
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/components/chores/types";

export function useHouseholdMembers(householdId: string | null) {
  return useQuery<Profile[]>({
    queryKey: ["householdMembers", householdId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .eq("household_id", householdId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!householdId,
  });
}
