
export interface Profile {
  id: string;
  avatar_url: string | null;
  username: string | null;
  full_name: string | null;
  points?: number;  // Ensure points is optional with a default of 0
  household_id?: string | null;
  Role?: 'admin' | 'member';
  created_at?: string | null;
  updated_at?: string | null;
}

export type ChoreIcon = 'Brush' | 'Shirt' | 'Wind' | 'Leaf' | 'Hammer' | 'Paintbrush' | 'Trash2' | 'Lightbulb';

export interface Chore {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  household_id: string;
  assigned_to: string | null;
  completion_photo: string | null;
  icon: ChoreIcon | null;
  profiles?: {
    id: string;
    username: string | null;
    full_name: string | null;
  } | null;
}

export interface Household {
  id: string;
  name: string;
  manager_id: string | null;
  rotation_interval: 'week' | '2-weeks' | 'month' | '3-months';
  created_at: string;
  updated_at: string;
  household_number: number | null;
  invitation_code: string;
}
