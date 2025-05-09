
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { ChoresList } from "@/components/chores/ChoresList";
import { ChoresHeader } from "@/components/chores/ChoresHeader";
import { HouseholdSettings } from "@/components/chores/HouseholdSettings";
import { useHouseholdInfo } from "@/hooks/useHouseholdInfo";
import { useHouseholdMembers } from "@/hooks/useHouseholdMembers";
import { useHouseholdSettings } from "@/hooks/useHouseholdSettings";
import { useChores } from "@/hooks/useChores";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useChoreMutations } from "@/components/chores/ChoreMutations";
import { ChoreIcon } from "@/components/chores/types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Chores = () => {
  const [newChoreTitle, setNewChoreTitle] = useState("");
  const [newChoreDescription, setNewChoreDescription] = useState("");
  const [newChoreIcon, setNewChoreIcon] = useState<ChoreIcon | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    session
  } = useAuth();
  const navigate = useNavigate();
  const {
    data: userInfo
  } = useHouseholdInfo(session);
  const {
    data: members
  } = useHouseholdMembers(userInfo?.household_id);
  const {
    household,
    updateSettings
  } = useHouseholdSettings(userInfo?.household_id);
  const {
    data: chores = [],
    isLoading
  } = useChores(userInfo?.household_id);
  const {
    data: userProfile
  } = useUserProfile(session);
  const {
    createChore,
    deleteChore,
    assignChore,
    toggleChore,
    randomlyReassignChore
  } = useChoreMutations(userInfo?.household_id);

  const isManager = household?.manager_id === session?.user?.id;

  const handleCreateChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChoreTitle.trim()) {
      createChore.mutate({
        title: newChoreTitle,
        description: newChoreDescription,
        icon: newChoreIcon
      }, {
        onSuccess: () => {
          setNewChoreTitle("");
          setNewChoreDescription("");
          setNewChoreIcon(null);
          setIsDialogOpen(false);
        }
      });
    }
  };

  // Prepare points data for chart
  const pointsData = members?.map(member => ({
    name: member.full_name || member.username || 'Unknown',
    points: member.points || 0
  })).sort((a, b) => b.points - a.points) || [];

  if (!userInfo?.household_id) {
    return <div className="min-h-screen p-4 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>No Household Selected</CardTitle>
            <CardDescription>You need to create or join a household first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>Go to Households</Button>
          </CardContent>
        </Card>
      </div>;
  }

  return <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-4">
        <ChoresHeader 
          username={userProfile?.full_name || userProfile?.username} 
          isDialogOpen={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          onNavigateBack={() => navigate("/")} 
          onCreateChore={handleCreateChore} 
          title={newChoreTitle} 
          onTitleChange={setNewChoreTitle} 
          description={newChoreDescription} 
          onDescriptionChange={setNewChoreDescription}
          icon={newChoreIcon}
          onIconChange={setNewChoreIcon}
          isSubmitting={createChore.isPending} 
        />

        <HouseholdSettings 
          household={household} 
          members={members || []} 
          isManager={isManager} 
          currentUserId={session?.user?.id || ""} 
          onUpdateSettings={updateSettings.mutate} 
        />

        <Tabs defaultValue="chores" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chores">Chores List</TabsTrigger>
            <TabsTrigger value="points">Points Leaderboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chores">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Chores List</CardTitle>
                <CardDescription>
                  Manage your household chores (A picture of the completed task is needed to mark as complete)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading chores...</div>
                ) : chores.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No chores yet. Add your first chore!
                  </div>
                ) : (
                  <ChoresList 
                    chores={chores} 
                    members={members || []} 
                    isAdmin={isManager} 
                    onToggleComplete={(choreId, completed) => toggleChore.mutate({ choreId, completed })} 
                    onAssign={(choreId, userId) => assignChore.mutate({ choreId, userId })} 
                    onDelete={choreId => deleteChore.mutate(choreId)}
                    onReassign={choreId => randomlyReassignChore.mutate(choreId)} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="points">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Points Leaderboard</CardTitle>
                <CardDescription>
                  See who's completed the most chores and earned the most points
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pointsData.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No points earned yet. Complete some chores to earn points!
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={pointsData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="points" fill="#8884d8" name="Points" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};

export default Chores;
