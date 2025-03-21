
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const CreateHousehold = () => {
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createHousehold = useMutation({
    mutationFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user?.id) throw new Error("User not authenticated");

      const { data: householdData, error: householdError } = await supabase
        .from("households")
        .insert([{ 
          name: newHouseholdName, 
          rotation_interval: 'week',
          manager_id: user.id // Set creator as initial manager
        }])
        .select()
        .single();

      if (householdError) throw householdError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ household_id: householdData.id })
        .eq("id", user.id);

      if (profileError) throw profileError;

      return householdData;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Household created successfully! You are now the house manager.",
      });
      setNewHouseholdName("");
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

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newHouseholdName.trim()) {
      createHousehold.mutate();
    }
  };

  return (
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
  );
};
