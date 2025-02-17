
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { CreateHousehold } from "@/components/household/CreateHousehold";
import { JoinHousehold } from "@/components/household/JoinHousehold";
import { HouseholdDetails } from "@/components/household/HouseholdDetails";

const Index = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: household, isLoading: householdLoading } = useQuery({
    queryKey: ["household", profile?.household_id],
    enabled: !!profile?.household_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("households")
        .select("*")
        .eq("id", profile.household_id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (profileLoading || householdLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Household Manager</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        {household ? (
          <HouseholdDetails household={household} />
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <CreateHousehold />
            <JoinHousehold />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
