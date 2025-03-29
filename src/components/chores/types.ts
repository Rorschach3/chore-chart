
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

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  household_id: string | null;
  created_at: string;
}

export interface Household {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  invitation_code: string;
  manager_id?: string | null; // Added to match implementation
  rotation_interval?: string; // Added to match implementation
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

export interface PhotoUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (photo: File) => void;
}

export interface ChoreItemProps {
  chore: Chore;
  onComplete: (id: string) => void;
  onPhotoUpload: (id: string, photo: File) => void;
  isUpdating: boolean;
}

export interface ChoresListProps {
  chores: Chore[];
  members?: Profile[];
  isAdmin?: boolean;
  onToggleComplete?: (choreId: string, completed: boolean) => void;
  onAssign?: (choreId: string, userId: string | null) => void;
  onDelete?: (choreId: string) => void;
  onComplete: (id: string) => void;
  onPhotoUpload: (choreId: string, file: File) => void;
  isUpdating: boolean;
}
