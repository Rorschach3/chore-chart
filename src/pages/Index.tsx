
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { ListTodo } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Index = () => {
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [householdNumber, setHouseholdNumber] = useState("");
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: household, isLoading: householdLoading } = useQuery({
    queryKey: ["household", profile?.household_id],
    enabled: !!profile?.household_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("households")
        .select("*")
        .eq("id", profile.household_id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const createHousehold = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("User not authenticated");

      const { data: householdData, error: householdError } = await supabase
        .from("households")
        .insert([{ name: newHouseholdName }])
        .select()
        .single();

      if (householdError) {
        console.error("Household creation error:", householdError);
        throw householdError;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ household_id: householdData.id })
        .eq("id", session.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      return householdData;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Household created successfully!",
      });
      setNewHouseholdName("");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["household"] });
    },
    onError: (error: any) => {
      console.error("Error in household creation flow:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const joinHousehold = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("User not authenticated");

      // First find the household with the given number
      const { data: householdData, error: findError } = await supabase
        .from("households")
        .select("id")
        .eq("household_number", parseInt(householdNumber))
        .single();

      if (findError) {
        if (findError.code === "PGRST116") {
          throw new Error("Household not found. Please check the number and try again.");
        }
        throw findError;
      }

      // Then update the user's profile with the household id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ household_id: householdData.id })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      return householdData;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully joined household!",
      });
      setHouseholdNumber("");
      setIsJoinDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["household"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteHousehold = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !household?.id) throw new Error("Invalid operation");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ household_id: null })
        .eq("id", session.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      const { error: householdError } = await supabase
        .from("households")
        .delete()
        .eq("id", household.id);

      if (householdError) {
        console.error("Household deletion error:", householdError);
        throw householdError;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Household deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["household"] });
    },
    onError: (error: any) => {
      console.error("Error in household deletion flow:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newHouseholdName.trim()) {
      createHousehold.mutate();
    }
  };

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (householdNumber.trim()) {
      joinHousehold.mutate();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (profileLoading || householdLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Household Manager</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        {household ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Household</CardTitle>
              <CardDescription>Manage your household and members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{household.name}</h2>
                <p className="text-sm text-gray-500">
                  Household Number: {household.household_number}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  className="flex items-center space-x-2"
                  onClick={() => navigate("/chores")}
                >
                  <ListTodo className="h-4 w-4" />
                  <span>Manage Chores</span>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Household</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your household
                        and remove all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteHousehold.mutate()}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {deleteHousehold.isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create a Household</CardTitle>
                <CardDescription>Get started by creating your household</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateHousehold} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="householdName">Household Name</Label>
                    <Input
                      id="householdName"
                      placeholder="Enter household name"
                      value={newHouseholdName}
                      onChange={(e) => setNewHouseholdName(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={createHousehold.isPending || !newHouseholdName.trim()}
                  >
                    {createHousehold.isPending ? "Creating..." : "Create Household"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Join a Household</CardTitle>
                <CardDescription>Enter a household number to join</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Join Existing Household</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join a Household</DialogTitle>
                      <DialogDescription>
                        Enter the household number to join an existing household
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleJoinHousehold} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="householdNumber">Household Number</Label>
                        <Input
                          id="householdNumber"
                          type="number"
                          placeholder="Enter household number"
                          value={householdNumber}
                          onChange={(e) => setHouseholdNumber(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsJoinDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={joinHousehold.isPending || !householdNumber.trim()}
                        >
                          {joinHousehold.isPending ? "Joining..." : "Join Household"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
