
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/components/chores/types";

export function useHouseholdMembers(householdId: string | null) {
  return useQuery<Profile[]>({
    queryKey: ["householdMembers", householdId],
    queryFn: async () => {
      // The error suggests 'email' might not exist in the profiles table
      // Let's modify the select statement to only include columns we know exist
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, household_id, created_at")
        .eq("household_id", householdId);

      if (error) throw error;
      
      // Transform the data to match our Profile type
      return data.map((profile) => ({
        id: profile.id,
        full_name: profile.full_name,
        username: profile.username,
        email: null, // Since email isn't in the database, set it to null to match the type
        avatar_url: profile.avatar_url,
        household_id: profile.household_id,
        created_at: profile.created_at
      })) as Profile[];
    },
    enabled: !!householdId,
  });
}
