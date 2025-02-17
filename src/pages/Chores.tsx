
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, UserCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
};

type Chore = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  household_id: string;
  assigned_to: string | null;
  profiles: Profile | null;
};

const Chores = () => {
  const [newChoreTitle, setNewChoreTitle] = useState("");
  const [newChoreDescription, setNewChoreDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get user's household and role
  const { data: userInfo } = useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", session?.user?.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile?.household_id) return { household_id: null, isAdmin: false };

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session?.user?.id)
        .eq("household_id", profile.household_id)
        .maybeSingle();

      if (roleError) throw roleError;

      return {
        household_id: profile.household_id,
        isAdmin: roleData?.role === "admin",
      };
    },
    enabled: !!session?.user?.id,
  });

  // Get household members
  const { data: members } = useQuery<Profile[]>({
    queryKey: ["householdMembers", userInfo?.household_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .eq("household_id", userInfo?.household_id);

      if (error) throw error;
      return data;
    },
    enabled: !!userInfo?.household_id,
  });

  // Fetch chores
  const { data: chores, isLoading } = useQuery<Chore[]>({
    queryKey: ["chores", userInfo?.household_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chores")
        .select(`
          id,
          title,
          description,
          completed,
          created_at,
          household_id,
          assigned_to,
          profiles:profiles(id, full_name, username)
        `)
        .eq("household_id", userInfo?.household_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userInfo?.household_id,
  });

  // Create chore mutation
  const createChore = useMutation({
    mutationFn: async () => {
      if (!userInfo?.household_id) throw new Error("No household selected");

      const { error } = await supabase.from("chores").insert([
        {
          title: newChoreTitle,
          description: newChoreDescription,
          household_id: userInfo.household_id,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Chore added successfully!",
      });
      setNewChoreTitle("");
      setNewChoreDescription("");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["chores"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete chore mutation
  const deleteChore = useMutation({
    mutationFn: async (choreId: string) => {
      const { error } = await supabase.from("chores").delete().eq("id", choreId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Chore deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["chores"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Assign chore mutation
  const assignChore = useMutation({
    mutationFn: async ({ choreId, userId }: { choreId: string; userId: string | null }) => {
      const { error } = await supabase
        .from("chores")
        .update({ assigned_to: userId })
        .eq("id", choreId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast({
        title: "Success",
        description: "Chore assigned successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle chore completion mutation
  const toggleChore = useMutation({
    mutationFn: async ({ choreId, completed }: { choreId: string; completed: boolean }) => {
      const { error } = await supabase
        .from("chores")
        .update({ completed })
        .eq("id", choreId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChoreTitle.trim()) {
      createChore.mutate();
    }
  };

  if (!userInfo?.household_id) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>No Household Selected</CardTitle>
            <CardDescription>You need to create or join a household first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>Go to Households</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Household Chores</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Household
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Chore</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Chore</DialogTitle>
                  <DialogDescription>
                    Create a new chore for your household.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateChore} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter chore title"
                      value={newChoreTitle}
                      onChange={(e) => setNewChoreTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter chore description (optional)"
                      value={newChoreDescription}
                      onChange={(e) => setNewChoreDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createChore.isPending || !newChoreTitle.trim()}
                    >
                      {createChore.isPending ? "Adding..." : "Add Chore"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chores List</CardTitle>
            <CardDescription>Manage your household chores</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading chores...</div>
            ) : chores?.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No chores yet. Add your first chore!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Done</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Assigned To</TableHead>
                    {userInfo?.isAdmin && <TableHead className="w-12">Delete</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chores?.map((chore) => (
                    <TableRow key={chore.id}>
                      <TableCell>
                        <Checkbox
                          checked={chore.completed}
                          onCheckedChange={(checked) =>
                            toggleChore.mutate({
                              choreId: chore.id,
                              completed: checked as boolean,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className={chore.completed ? "line-through text-gray-500" : ""}>
                        {chore.title}
                      </TableCell>
                      <TableCell className={chore.completed ? "line-through text-gray-500" : ""}>
                        {chore.description}
                      </TableCell>
                      <TableCell>
                        {userInfo?.isAdmin ? (
                          <Select
                            value={chore.assigned_to || ""}
                            onValueChange={(value) =>
                              assignChore.mutate({
                                choreId: chore.id,
                                userId: value || null,
                              })
                            }
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue>
                                {chore.profiles ? (
                                  chore.profiles.full_name || chore.profiles.username
                                ) : (
                                  <span className="text-gray-500">Unassigned</span>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Unassigned</SelectItem>
                              {members?.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.full_name || member.username}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <UserCircle2 className="h-4 w-4" />
                            <span>
                              {chore.profiles ? (
                                chore.profiles.full_name || chore.profiles.username
                              ) : (
                                <span className="text-gray-500">Unassigned</span>
                              )}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      {userInfo?.isAdmin && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteChore.mutate(chore.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chores;
