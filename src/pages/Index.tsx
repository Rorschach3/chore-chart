
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { CreateHousehold } from "@/components/household/CreateHousehold";
import { JoinHousehold } from "@/components/household/JoinHousehold";
import { HouseholdDetails } from "@/components/household/HouseholdDetails";
import { LogOut } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Household Manager
          </h1>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>

        <div className="animate-fade-in">
          {household ? (
            <HouseholdDetails household={household} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 animate-fade-in">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold mb-2">Welcome to Chore Chart!</h2>
                  <p className="text-white/90">
                    Get started by creating your own household or joining an existing one.
                  </p>
                </div>
                <CreateHousehold />
              </div>
              <JoinHousehold />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
