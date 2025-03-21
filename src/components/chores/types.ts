
export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
};

export type Household = {
  id: string;
  name: string;
  manager_id: string | null;
  rotation_interval: 'week' | '2-weeks' | 'month' | '3-months';
};

// Use icons that actually exist in lucide-react
export type ChoreIcon = 'Brush' | 'Shirt' | 'Wind' | 'Leaf' | 'Hammer' | 'Tool' | 'Paintbrush' | 'Trash2' | 'Lightbulb';

export type Chore = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  household_id: string;
  assigned_to: string | null;
  completion_photo: string | null;
  icon: ChoreIcon | null;
  profiles?: Profile;
};

export type ChoreRotation = {
  id: string;
  household_id: string;
  start_date: string;
  end_date: string;
};
