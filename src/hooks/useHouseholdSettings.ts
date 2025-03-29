
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Household } from "@/components/chores/types";

export function useHouseholdSettings(householdId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: household } = useQuery<Household>({
    queryKey: ["household", householdId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("households")
        .select(`
          id,
          name,
          manager_id,
          rotation_interval,
          created_at,
          created_by: manager_id,
          invitation_code: household_number::text
        `)
        .eq("id", householdId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Household not found");

      // Create a full Household object
      const household: Household = {
        id: data.id,
        name: data.name,
        created_at: data.created_at,
        created_by: data.created_by || "",
        invitation_code: data.invitation_code || "",
        manager_id: data.manager_id,
        rotation_interval: data.rotation_interval
      };

      return household;
    },
    enabled: !!householdId,
  });

  const updateSettings = useMutation({
    mutationFn: async ({
      managerId,
      rotationInterval,
    }: {
      managerId?: string;
      rotationInterval?: string;
    }) => {
      const { error } = await supabase
        .from("households")
        .update({
          ...(managerId && { manager_id: managerId }),
          ...(rotationInterval && { rotation_interval: rotationInterval }),
        })
        .eq("id", householdId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Household settings updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["household"] });
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
    household,
    updateSettings,
  };
}
