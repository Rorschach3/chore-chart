
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/components/chores/types";

export function useHouseholdMembers(householdId: string | null) {
  return useQuery<Profile[]>({
    queryKey: ["householdMembers", householdId],
    queryFn: async () => {
      // Fetch profiles data from the database
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, household_id, created_at, updated_at, Role")
        .eq("household_id", householdId);

      if (error) throw error;
      
      // Transform and cast the data to match our Profile type
      return data as Profile[];
    },
    enabled: !!householdId,
  });
}
