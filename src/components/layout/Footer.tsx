
export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Household Manager. All rights reserved.
        </p>
        <nav className="flex space-x-4 text-sm text-muted-foreground">
          <a
            href="/privacy"
            className="transition-colors hover:text-foreground"
          >
            Privacy
          </a>
          <a
            href="/terms"
            className="transition-colors hover:text-foreground"
          >
            Terms
          </a>
        </nav>
      </div>
    </footer>
  );
}
