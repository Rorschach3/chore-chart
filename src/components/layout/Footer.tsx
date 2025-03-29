
import { useNavigate } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();
  
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} ChoreChart. All rights reserved.
        </p>
        <nav className="flex space-x-4 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/privacy")}
            className="transition-colors hover:text-foreground"
          >
            Privacy
          </button>
          <button
            onClick={() => navigate("/terms")}
            className="transition-colors hover:text-foreground"
          >
            Terms
          </button>
          <button
            onClick={() => navigate("/about")}
            className="transition-colors hover:text-foreground"
          >
            About
          </button>
          <button
            onClick={() => navigate("/faq")}
            className="transition-colors hover:text-foreground"
          >
            FAQ
          </button>
        </nav>
      </div>
    </footer>
  );
}
