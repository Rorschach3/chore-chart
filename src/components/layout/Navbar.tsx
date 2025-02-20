import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
export function Navbar() {
  const {
    session
  } = useAuth();
  const navigate = useNavigate();
  const navItems = [{
    name: "Home",
    path: "/"
  }, {
    name: "Chores",
    path: "/chores"
  }];
  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
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
                {navItems.map(item => <Button key={item.path} variant="ghost" className="justify-start" onClick={() => navigate(item.path)}>
                    {item.name}
                  </Button>)}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <div className="mr-4 flex">
          <Button variant="ghost" className="hover:bg-transparent" onClick={() => navigate("/")}>
            <Home className="h-5 w-5" />
            <span className="ml-2 font-bold text-3xl text-center mx-[61px] py-0 px-[16px] my-0">ChoreChart</span>
          </Button>
        </div>
        <nav className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">
          {navItems.map(item => <Button key={item.path} variant="ghost" onClick={() => navigate(item.path)}>
              {item.name}
            </Button>)}
        </nav>
      </div>
    </header>;
}