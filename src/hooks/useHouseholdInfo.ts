
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export function useHouseholdInfo(session: Session | null) {
  return useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", session?.user?.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile?.household_id) return { household_id: null, isAdmin: false };

      const { data: household, error: householdError } = await supabase
        .from("households")
        .select("manager_id")
        .eq("id", profile.household_id)
        .single();

      if (householdError) throw householdError;

      return {
        household_id: profile.household_id,
        isAdmin: household.manager_id === session?.user?.id,
      };
    },
    enabled: !!session?.user?.id,
  });
}
