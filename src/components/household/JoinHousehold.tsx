
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface HouseholdJoinResult {
  id: string;
}

export const JoinHousehold = () => {
  const [householdNumber, setHouseholdNumber] = useState("");
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const joinHousehold = useMutation({
    mutationFn: async (): Promise<HouseholdJoinResult> => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user?.id) throw new Error("User not authenticated");

      // Try to find household by household_number first (for backward compatibility)
      const { data: householdData, error: findError } = await supabase
        .from("households")
        .select("id")
        .eq("household_number", parseInt(householdNumber))
        .maybeSingle();
      
      // If not found by household_number, try to find by invitation_code
      let householdId = householdData?.id;
      
      if (!householdId) {
        const { data: inviteData, error: inviteError } = await supabase
          .from("households")
          .select("id")
          .eq("invitation_code", householdNumber)
          .maybeSingle();
          
        if (inviteError) {
          throw new Error("Household not found. Please check the number and try again.");
        }
          
        householdId = inviteData?.id;
      }

      if (!householdId) {
        throw new Error("Household not found. Please check the number and try again.");
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ household_id: householdId })
        .eq("id", user.id);

      if (profileError) throw profileError;

      return { id: householdId };
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

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (householdNumber.trim()) {
      joinHousehold.mutate();
    }
  };

  return (
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
                Enter the household number or invitation code to join an existing household
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleJoinHousehold} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="householdNumber">Household Number / Invitation Code</Label>
                <Input
                  id="householdNumber"
                  placeholder="Enter household number or code"
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
  );
};
