
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

const Index = () => {
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch user's household
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

  // Fetch households data
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

  // Create household mutation
  const createHousehold = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("User not authenticated");

      // First create the household and immediately update the user's profile
      const { data: householdData, error: householdError } = await supabase
        .from("households")
        .insert([{ name: newHouseholdName }])
        .select()
        .single();

      if (householdError) {
        console.error("Household creation error:", householdError);
        throw householdError;
      }

      // Update the user's profile with the new household_id
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
      // Invalidate both queries to refresh the data
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

  // Delete household mutation
  const deleteHousehold = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !household?.id) throw new Error("Invalid operation");

      // First update the user's profile to remove the household_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ household_id: null })
        .eq("id", session.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      // Then delete the household
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
      // Invalidate queries to refresh the data
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
              <h2 className="text-xl font-semibold">{household.name}</h2>
              
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
            </CardContent>
          </Card>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Index;
