
export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
};

export type Chore = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  household_id: string;
  assigned_to: string | null;
  profiles: Profile | null;
  completion_photo: string | null;
};
