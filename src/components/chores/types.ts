
import { LucideIcon } from "lucide-react";

export type ChoreIcon = "Utensils" | "ShowerHead" | "Trash" | "Scissors";

export interface Chore {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  household_id: string;
  assigned_to: string;
  completion_photo: string | null;
  icon: ChoreIcon | null;
  profiles?: {
    id: string;
    full_name: string | null;
    username: string | null;
  };
}

export interface ChoreDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  icon: ChoreIcon | null;
  onIconChange: (value: ChoreIcon) => void;
  isSubmitting: boolean;
}
