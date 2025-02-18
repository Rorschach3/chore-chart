
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

const Chores = () => {
  const [newChoreTitle, setNewChoreTitle] = useState("");
  const [newChoreDescription, setNewChoreDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: userInfo } = useHouseholdInfo(session);
  const { data: members } = useHouseholdMembers(userInfo?.household_id);
  const { household, updateSettings } = useHouseholdSettings(userInfo?.household_id);
  const { data: chores = [], isLoading } = useChores(userInfo?.household_id);
  const { data: userProfile } = useUserProfile(session);
  const { createChore, deleteChore, assignChore, toggleChore } = useChoreMutations(userInfo?.household_id);

  const isManager = household?.manager_id === session?.user?.id;

  const handleCreateChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChoreTitle.trim()) {
      createChore.mutate(
        { title: newChoreTitle, description: newChoreDescription },
        {
          onSuccess: () => {
            setNewChoreTitle("");
            setNewChoreDescription("");
            setIsDialogOpen(false);
          },
        }
      );
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
          isSubmitting={createChore.isPending}
        />

        <HouseholdSettings
          household={household}
          members={members || []}
          isManager={isManager}
          onUpdateSettings={updateSettings.mutate}
        />

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
                isAdmin={isManager}
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
