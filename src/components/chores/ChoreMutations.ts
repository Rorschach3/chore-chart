
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChoreIcon } from "./types";

// Points awarded for completing different types of chores
const CHORE_POINTS = {
  default: 10,
  difficult: 20,
};

export function useChoreMutations(householdId: string | null) {
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
      toast.success("Chore added successfully!");
      queryClient.invalidateQueries({ queryKey: ["chores"] });
    },
    onError: (error: any) => {
      toast.error("Error adding chore", {
        description: error.message
      });
    },
  });

  const deleteChore = useMutation({
    mutationFn: async (choreId: string) => {
      const { error } = await supabase.from("chores").delete().eq("id", choreId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Chore deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["chores"] });
    },
    onError: (error: any) => {
      toast.error("Error deleting chore", {
        description: error.message
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
      toast.success("Chore assigned successfully!");
    },
    onError: (error: any) => {
      toast.error("Error assigning chore", {
        description: error.message
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
        
        toast.success(`${points} points earned for completing this chore!`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      queryClient.invalidateQueries({ queryKey: ["household"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: any) => {
      toast.error("Error updating chore", {
        description: error.message
      });
    },
  });

  const randomlyReassignChore = useMutation({
    mutationFn: async (choreId: string) => {
      // Get all available household members
      const { data: members, error: membersError } = await supabase
        .from("profiles")
        .select("id")
        .eq("household_id", householdId);
      
      if (membersError) throw membersError;
      
      if (!members || members.length === 0) {
        throw new Error("No household members available for assignment");
      }
      
      // Get current assignment
      const { data: chore, error: choreError } = await supabase
        .from("chores")
        .select("assigned_to")
        .eq("id", choreId)
        .single();
        
      if (choreError) throw choreError;
      
      // Filter out the current assignee
      const eligibleMembers = members.filter(member => member.id !== chore.assigned_to);
      
      if (eligibleMembers.length === 0) {
        throw new Error("No other household members available for reassignment");
      }
      
      // Randomly select a new assignee
      const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
      const newAssignee = eligibleMembers[randomIndex];
      
      // Update the chore assignment
      const { error: updateError } = await supabase
        .from("chores")
        .update({ assigned_to: newAssignee.id })
        .eq("id", choreId);
        
      if (updateError) throw updateError;
      
      return newAssignee.id;
    },
    onSuccess: () => {
      toast.success("Chore has been randomly reassigned!");
      queryClient.invalidateQueries({ queryKey: ["chores"] });
    },
    onError: (error: any) => {
      toast.error("Error reassigning chore", {
        description: error.message
      });
    },
  });

  return {
    createChore,
    deleteChore,
    assignChore,
    toggleChore,
    randomlyReassignChore,
  };
}
