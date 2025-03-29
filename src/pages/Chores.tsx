import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { ChoresList } from "@/components/chores/ChoresList";
import { ChoresHeader } from "@/components/chores/ChoresHeader";
import { createChore, markChoreComplete, updateChorePhoto } from "@/components/chores/ChoreMutations";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useHouseholdInfo } from "@/hooks/useHouseholdInfo";
import { supabase } from "@/integrations/supabase/client";
import { ChoreIcon } from "@/components/chores/types";
import { useChores } from "@/hooks/useChores";

export default function Chores() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile } = useUserProfile(session);
  
  const { data: householdInfo, isLoading: isHouseholdLoading } = useHouseholdInfo(session);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newChoreTitle, setNewChoreTitle] = useState("");
  const [newChoreDescription, setNewChoreDescription] = useState("");
  const [newChoreIcon, setNewChoreIcon] = useState<ChoreIcon>("Utensils");
  
  const { data: chores = [], isLoading: isChoresLoading } = useChores(householdInfo?.household_id);
  
  const createChoreMutation = useMutation({
    mutationFn: createChore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      setIsDialogOpen(false);
      setNewChoreTitle("");
      setNewChoreDescription("");
      setNewChoreIcon("Utensils");
      toast({
        title: "Chore Created",
        description: "Your new chore has been added to the list.",
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
  
  const markCompleteMutation = useMutation({
    mutationFn: markChoreComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast({
        title: "Chore Completed",
        description: "Great job! The chore has been marked as complete.",
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
  
  const handleCreateChore = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!householdInfo?.household_id) {
      toast({
        title: "Error",
        description: "You must be part of a household to create chores.",
        variant: "destructive",
      });
      return;
    }
    
    createChoreMutation.mutate({
      title: newChoreTitle,
      description: newChoreDescription,
      icon: newChoreIcon,
      householdId: householdInfo.household_id,
    });
  };
  
  const handleCompleteChore = (id: string) => {
    markCompleteMutation.mutate(id);
  };
  
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ choreId, file }: { choreId: string; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${choreId}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("chore_photos")
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from("chore_photos")
        .getPublicUrl(fileName);
      
      return updateChorePhoto(choreId, publicUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast({
        title: "Photo Uploaded",
        description: "Your completion photo has been uploaded.",
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
  
  const handlePhotoUpload = (choreId: string, file: File) => {
    uploadPhotoMutation.mutate({ choreId, file });
  };
  
  const handleNavigateBack = () => {
    navigate("/");
  };
  
  if (isHouseholdLoading || isChoresLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }
  
  if (!householdInfo?.household_id) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-lg font-medium">You don't have a household yet</div>
          <button 
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Go create or join one
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8 space-y-8">
      <ChoresHeader
        username={profile?.username}
        isDialogOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onNavigateBack={handleNavigateBack}
        onCreateChore={handleCreateChore}
        title={newChoreTitle}
        onTitleChange={setNewChoreTitle}
        description={newChoreDescription}
        onDescriptionChange={setNewChoreDescription}
        icon={newChoreIcon}
        onIconChange={setNewChoreIcon}
        isSubmitting={createChoreMutation.isPending}
      />
      
      {chores.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-lg font-medium">No chores found</div>
          <div className="text-sm text-gray-500">
            Create your first chore to get started
          </div>
        </div>
      ) : (
        <ChoresList
          chores={chores}
          onComplete={handleCompleteChore}
          onPhotoUpload={handlePhotoUpload}
          isUpdating={markCompleteMutation.isPending || uploadPhotoMutation.isPending}
        />
      )}
    </div>
  );
}
