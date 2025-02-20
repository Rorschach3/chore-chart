import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ListTodo, Copy, User } from "lucide-react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { MembersList } from "@/components/profile/MembersList";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
interface HouseholdDetailsProps {
  household: {
    id: string;
    name: string;
    household_number: number;
  };
}
export const HouseholdDetails = ({
  household
}: HouseholdDetailsProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const deleteHousehold = useMutation({
    mutationFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user?.id) throw new Error("User not authenticated");
      const {
        error: profileError
      } = await supabase.from("profiles").update({
        household_id: null
      }).eq("id", user.id);
      if (profileError) throw profileError;
      const {
        error: householdError
      } = await supabase.from("households").delete().eq("id", household.id);
      if (householdError) throw householdError;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Household deleted successfully!"
      });
      queryClient.invalidateQueries({
        queryKey: ["profile"]
      });
      queryClient.invalidateQueries({
        queryKey: ["household"]
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  const copyHouseholdNumber = () => {
    navigator.clipboard.writeText(household.household_number.toString());
    toast({
      title: "Copied!",
      description: "Household number copied to clipboard"
    });
  };
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Household</CardTitle>
          <CardDescription>Manage your household and members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{household.name}</h2>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500">
                Household Number: {household.household_number}
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={copyHouseholdNumber} className="h-6 w-6">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy household number</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button className="flex items-center space-x-2" onClick={() => navigate("/chores")}>
              <ListTodo className="h-4 w-4" />
              <span>Manage Chores</span>
            </Button>

            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <ProfileForm />
              </DialogContent>
            </Dialog>
            
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
                  <AlertDialogAction onClick={() => deleteHousehold.mutate()} className="bg-red-500 hover:bg-red-600">
                    {deleteHousehold.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <MembersList householdId={household.id} />
    </div>;
};