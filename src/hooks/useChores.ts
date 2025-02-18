
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Chore } from "@/components/chores/types";

export function useChores(householdId: string | null) {
  return useQuery<Chore[]>({
    queryKey: ["chores", householdId],
    queryFn: async () => {
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
          profiles:profiles(id, full_name, username)
        `)
        .eq("household_id", householdId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!householdId,
  });
}
