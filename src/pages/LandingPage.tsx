
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Users, CalendarClock, CheckSquare } from "lucide-react";

export default function LandingPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 py-12 md:py-24">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-fade-in">
            ChoreChart
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            The simple way to manage household chores and keep your space organized.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  onClick={() => navigate("/auth")}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate("/about")}
                >
                  Learn More
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-4 bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full w-fit">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Household Management</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create a household and invite your roommates, family members, or friends to join.
              </p>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-4 bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full w-fit">
                <CalendarClock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Chore Scheduling</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Assign chores, set deadlines, and automatically rotate responsibilities.
              </p>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-fit">
                <CheckSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Task Verification</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete chores and upload photos as proof, keeping everyone accountable.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          <div className="space-y-8">
            {[
              {
                title: "Create Your Household",
                description: "Sign up and create a household or join an existing one with a simple invitation code."
              },
              {
                title: "Add Chores and Assign Tasks",
                description: "Create tasks, add descriptions, and assign them to household members."
              },
              {
                title: "Track Completion",
                description: "Mark tasks as complete and upload verification photos when finished."
              },
              {
                title: "Stay Organized",
                description: "Keep your shared space clean and organized with automatic task rotation."
              }
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full p-2">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border-none shadow-lg">
            <CardContent className="py-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Join thousands of households already using ChoreChart to maintain a clean and organized home.
              </p>
              {session ? (
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  onClick={() => navigate("/auth")}
                >
                  Sign Up for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
