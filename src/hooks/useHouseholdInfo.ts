
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

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session?.user?.id)
        .eq("household_id", profile.household_id)
        .maybeSingle();

      if (roleError) throw roleError;

      return {
        household_id: profile.household_id,
        isAdmin: roleData?.role === "admin",
      };
    },
    enabled: !!session?.user?.id,
  });
}
