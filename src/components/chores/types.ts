
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
