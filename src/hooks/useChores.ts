
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Chore } from "@/components/chores/types";

export function useChores(householdId: string | undefined) {
  return useQuery({
    queryKey: ["chores", householdId],
    queryFn: async () => {
      if (!householdId) return [];

      const { data, error } = await supabase
        .from("chores")
        .select(`
          *,
          profiles: assigned_to (id, full_name, username)
        `)
        .eq("household_id", householdId);

      if (error) throw error;

      // Handle the case where the icon column might not exist yet in the database
      // Transform the data to ensure it conforms to the Chore type
      const choresWithDefaults = data.map(chore => ({
        ...chore,
        icon: chore.icon || "Utensils", // Provide a default icon if missing
        completion_photo: chore.completion_photo || null,
      })) as Chore[];

      return choresWithDefaults;
    },
    enabled: !!householdId,
  });
}
