
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ChoreIcon } from "./types";

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
      const { error } = await supabase
        .from("chores")
        .update({ completed })
        .eq("id", choreId);
      if (error) throw error;
    },
    onSuccess: () => {
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

  return {
    createChore,
    deleteChore,
    assignChore,
    toggleChore,
  };
}
