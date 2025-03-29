
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, Menu, Sun, Moon, LogIn } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";

export function Navbar() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Public navigation items (visible to all users)
  const publicNavItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "FAQ", path: "/faq" },
  ];
  
  // Private navigation items (only for authenticated users)
  const privateNavItems = session ? [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Chores", path: "/chores" },
  ] : [];
  
  // Combine the navigation items based on auth status
  const navItems = [...publicNavItems, ...privateNavItems];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[200px] sm:w-[240px]">
                <nav className="flex flex-col gap-4">
                  {navItems.map(item => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className="justify-start"
                      onClick={() => navigate(item.path)}
                    >
                      {item.name}
                    </Button>
                  ))}
                  {!session && (
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => navigate("/auth")}
                    >
                      Sign In
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <Button
            variant="ghost"
            className="hover:bg-transparent"
            onClick={() => navigate("/")}
          >
            <Home className="h-5 w-5" />
            <span className="ml-2 font-bold text-3xl text-center mx-[61px] py-0 px-[16px] my-0">
              ChoreChart
            </span>
          </Button>
          <nav className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">
            {navItems.map(item => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)}
              >
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          {!session && (
            <Button
              variant="default"
              onClick={() => navigate("/auth")}
              className="hidden md:flex"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="transition-all duration-200 hover:scale-105"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
