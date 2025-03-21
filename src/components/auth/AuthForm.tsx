
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

interface AuthFormProps {
  isSignUp: boolean;
  loading: boolean;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleSignUp: () => void;
}

export function AuthForm({
  isSignUp,
  loading,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleSignUp,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          className="transition-all duration-200 focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          minLength={6}
          className="transition-all duration-200 focus:ring-2 focus:ring-primary"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full transition-all duration-200 hover:scale-105" 
        disabled={loading}
      >
        <Mail className="h-4 w-4 mr-2" />
        {loading
          ? "Loading..."
          : isSignUp
          ? "Create Account"
          : "Sign In with Email"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full transition-colors duration-200"
        onClick={onToggleSignUp}
      >
        {isSignUp
          ? "Already have an account? Sign In"
          : "Don't have an account? Sign Up"}
      </Button>
    </form>
  );
}
