
// Check if this file exists first and only add what's missing
export type ChoreIcon = 'Brush' | 'Shirt' | 'Wind' | 'Leaf' | 'Hammer' | 'Paintbrush' | 'Trash2' | 'Lightbulb';

export interface Profile {
  id: string;
  avatar_url: string | null;
  username: string | null;
  full_name: string | null;
  points?: number;
}

export interface Household {
  id: string;
  name: string;
  manager_id: string | null;
  household_number: number;
  invitation_code: string;
  created_at: string;
  updated_at: string;
  rotation_interval: 'week' | '2-weeks' | 'month' | '3-months';
}

export interface Chore {
  id: string;
  title: string;
  description: string | null;
  household_id: string;
  assigned_to: string | null;
  completed: boolean | null;
  completion_photo: string | null;
  created_at: string;
  updated_at: string;
  icon: ChoreIcon | null;
  profiles?: Profile;
}
