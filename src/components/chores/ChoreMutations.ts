import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ChoreIcon } from "./types";

// Points awarded for completing different types of chores
const CHORE_POINTS = {
  default: 10,
  difficult: 20,
};

export function useChoreMutations(householdId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createChore = useMutation({
    mutationFn: async ({ 
      title, 
      description, 
      icon 
    }: { 
      title: string; 
      description: string;
      icon: ChoreIcon | null;
    }) => {
      if (!householdId) throw new Error("No household selected");

      const { error } = await supabase.from("chores").insert([
        {
          title,
          description,
          household_id: householdId,
          icon
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Chore added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["chores"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteChore = useMutation({
    mutationFn: async (choreId: string) => {
      const { error } = await supabase.from("chores").delete().eq("id", choreId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Chore deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["chores"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const assignChore = useMutation({
    mutationFn: async ({ choreId, userId }: { choreId: string; userId: string | null }) => {
      const { error } = await supabase
        .from("chores")
        .update({ assigned_to: userId })
        .eq("id", choreId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast({
        title: "Success",
        description: "Chore assigned successfully!",
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

  const toggleChore = useMutation({
    mutationFn: async ({ choreId, completed }: { choreId: string; completed: boolean }) => {
      // First, get chore details
      const { data: chore, error: choreError } = await supabase
        .from("chores")
        .select("*, profiles:assigned_to(*)")
        .eq("id", choreId)
        .single();
      
      if (choreError) throw choreError;
      
      // Update chore completion status
      const { error } = await supabase
        .from("chores")
        .update({ completed })
        .eq("id", choreId);
      
      if (error) throw error;

      // If chore is being marked as completed and has an assigned user
      if (completed && chore.assigned_to) {
        // Calculate points based on chore description
        let points = CHORE_POINTS.default;
        if (chore.description?.toLowerCase().includes('difficult')) {
          points = CHORE_POINTS.difficult;
        }
        
        // Fetch current profile to get existing points
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("points")
          .eq("id", chore.assigned_to)
          .single();
        
        if (profileError) throw profileError;
        
        // Update user profile with points
        const currentPoints = profileData.points || 0;
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ points: currentPoints + points })
          .eq("id", chore.assigned_to);
        
        if (updateError) throw updateError;
        
        toast({
          title: "Points awarded!",
          description: `${points} points earned for completing this chore`,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      queryClient.invalidateQueries({ queryKey: ["household"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createChore,
    deleteChore,
    assignChore,
    toggleChore,
  };
}
