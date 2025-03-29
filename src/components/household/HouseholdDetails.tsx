
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings2, Clipboard, CalendarClock } from "lucide-react";
import { useHouseholdMembers } from "@/hooks/useHouseholdMembers";
import { MembersList } from "@/components/profile/MembersList";
import { HouseholdSettings } from "@/components/chores/HouseholdSettings";
import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface HouseholdDetailsProps {
  household: {
    id: string;
    name: string;
    household_number?: number;
    manager_id?: string;
    created_at: string;
  };
}

export function HouseholdDetails({ household }: HouseholdDetailsProps) {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data: members, isLoading } = useHouseholdMembers(household.id);
  const [showSettings, setShowSettings] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { toast } = useToast();
  
  const isManager = household.manager_id === session?.user.id;
  const invitationCode = household.household_number?.toString() || "";

  const copyInviteInfo = () => {
    const inviteText = `Join my household "${household.name}" on Chore Chart!\n\nHousehold Number: ${household.household_number}\nInvitation Code: ${invitationCode}`;
    navigator.clipboard.writeText(inviteText);
    toast({
      title: "Copied!",
      description: "Invitation details copied to clipboard",
    });
  };

  const handleNavigateToChores = () => {
    navigate("/chores");
  };

  return (
    <div className="space-y-6">
      <Card className="transform transition-all duration-200 hover:shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">{household.name}</CardTitle>
          <CardDescription>
            Household #{household.household_number}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 mt-2">
            <Button 
              variant="default"
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              onClick={handleNavigateToChores}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              Manage Chores
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1 transition-all duration-200 hover:bg-purple-50 dark:hover:bg-slate-800"
              onClick={() => setShowInviteDialog(true)}
            >
              <Clipboard className="mr-2 h-4 w-4" />
              Invite Members
            </Button>
            
            {isManager && (
              <Button 
                variant="outline" 
                className="flex-1 transition-all duration-200 hover:bg-purple-50 dark:hover:bg-slate-800"
                onClick={() => setShowSettings(true)}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Household Settings
              </Button>
            )}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 mr-2 text-purple-500" />
              <h3 className="font-medium">Members</h3>
            </div>
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading members...</p>
            ) : (
              <MembersList members={members || []} />
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-0">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isManager ? "You're the household manager" : ""}
          </div>
        </CardFooter>
      </Card>
      
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Household Settings</DialogTitle>
            <DialogDescription>
              Configure your household settings
            </DialogDescription>
          </DialogHeader>
          <HouseholdSettings householdId={household.id} onClose={() => setShowSettings(false)} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Members</DialogTitle>
            <DialogDescription>
              Share these details with people you want to invite to your household
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
              <div>
                <p className="text-sm font-medium mb-1">Household Number</p>
                <p className="text-2xl font-bold">{household.household_number}</p>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
              <div>
                <p className="text-sm font-medium mb-1">Invitation Code</p>
                <p className="text-2xl font-bold">{invitationCode}</p>
              </div>
            </div>
            <Button className="w-full" onClick={copyInviteInfo}>
              <Clipboard className="mr-2 h-4 w-4" />
              Copy Invitation Details
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Anyone with both the household number and invitation code can join your household.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
