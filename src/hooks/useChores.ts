
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Chore } from "@/components/chores/types";

export function useChores(householdId: string | null) {
  return useQuery<Chore[]>({
    queryKey: ["chores", householdId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("chores")
          .select(`
            id,
            title,
            description,
            completed,
            created_at,
            household_id,
            assigned_to,
            completion_photo,
            icon,
            profiles:profiles(id, full_name, username)
          `)
          .eq("household_id", householdId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        // Safely transform the data to match the Chore type
        const chores = data.map(chore => {
          return {
            id: chore.id,
            title: chore.title,
            description: chore.description,
            completed: chore.completed,
            created_at: chore.created_at,
            household_id: chore.household_id,
            assigned_to: chore.assigned_to,
            completion_photo: chore.completion_photo,
            icon: chore.icon as Chore['icon'], // Type cast the icon properly
            profiles: chore.profiles
          } as Chore;
        });
        
        return chores;
      } catch (error) {
        console.error("Error fetching chores:", error);
        return [] as Chore[];
      }
    },
    enabled: !!householdId,
  });
}
