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

export const JoinHousehold = () => {
  const [householdNumber, setHouseholdNumber] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const joinHousehold = useMutation({
    mutationFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user?.id) throw new Error("User not authenticated");

      // First, verify the household exists and check if the invite code matches
      const { data: householdData, error: findError } = await supabase
        .from("households")
        .select("id, invitation_code")
        .eq("household_number", parseInt(householdNumber))
        .single();

      if (findError) {
        if (findError.code === "PGRST116") {
          throw new Error("Household not found. Please check the number and try again.");
        }
        throw findError;
      }

      // Verify the invitation code
      if (householdData && householdData.invitation_code !== inviteCode) {
        throw new Error("Invalid invitation code. Please check with the household owner.");
      }

      // If verified, join the household
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
        description: "Successfully joined household!",
      });
      setHouseholdNumber("");
      setInviteCode("");
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
    if (householdNumber.trim() && inviteCode.trim()) {
      joinHousehold.mutate();
    } else {
      toast({
        title: "Error",
        description: "Both household number and invitation code are required.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join a Household</CardTitle>
        <CardDescription>Enter a household number and invitation code to join</CardDescription>
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
                Enter the household number and invitation code to join an existing household
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
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invitation Code</Label>
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="Enter invitation code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
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
                  disabled={joinHousehold.isPending || !householdNumber.trim() || !inviteCode.trim()}
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
