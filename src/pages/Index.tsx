
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { CreateHousehold } from "@/components/household/CreateHousehold";
import { JoinHousehold } from "@/components/household/JoinHousehold";
import { HouseholdDetails } from "@/components/household/HouseholdDetails";
import { LogOut, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProfileForm } from "@/components/profile/ProfileForm";

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
        <div className="animate-pulse text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 transition-all duration-200 hover:shadow-xl">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-fade-in">
              Household Manager
            </h1>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <ProfileForm />
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>

          <div className="animate-fade-in space-y-6">
            {household ? (
              <HouseholdDetails household={household} />
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 animate-fade-in">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white p-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl ring-1 ring-purple-500/20">
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

          <footer className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <a 
                href="/privacy" 
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 underline-offset-4 hover:underline"
              >
                Privacy Policy
              </a>
              <span className="hidden sm:inline">•</span>
              <a 
                href="/terms" 
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 underline-offset-4 hover:underline"
              >
                Terms of Service
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Index;
