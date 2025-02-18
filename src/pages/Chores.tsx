
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { ChoreDialog } from "@/components/chores/ChoreDialog";
import { ChoresList } from "@/components/chores/ChoresList";
import type { Chore, Profile } from "@/components/chores/types";

const Chores = () => {
  const [newChoreTitle, setNewChoreTitle] = useState("");
  const [newChoreDescription, setNewChoreDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const { data: members } = useQuery<Profile[]>({
    queryKey: ["householdMembers", userInfo?.household_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .eq("household_id", userInfo?.household_id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userInfo?.household_id,
  });

  const { data: chores = [], isLoading } = useQuery<Chore[]>({
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
          completion_photo,
          profiles:profiles(id, full_name, username)
        `)
        .eq("household_id", userInfo?.household_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userInfo?.household_id,
  });

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("id", session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

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
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Logged in as: {userProfile?.full_name || userProfile?.username || 'Unknown User'}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to Household
              </Button>
              <ChoreDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={handleCreateChore}
                title={newChoreTitle}
                onTitleChange={setNewChoreTitle}
                description={newChoreDescription}
                onDescriptionChange={setNewChoreDescription}
                isSubmitting={createChore.isPending}
              />
            </div>
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
            ) : chores.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No chores yet. Add your first chore!
              </div>
            ) : (
              <ChoresList
                chores={chores}
                members={members || []}
                isAdmin={!!userInfo?.isAdmin}
                onToggleComplete={(choreId, completed) =>
                  toggleChore.mutate({ choreId, completed })
                }
                onAssign={(choreId, userId) =>
                  assignChore.mutate({ choreId, userId })
                }
                onDelete={(choreId) => deleteChore.mutate(choreId)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chores;
