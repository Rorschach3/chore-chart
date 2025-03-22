
import { supabase } from "@/integrations/supabase/client";
import { ChoreIcon } from "./types";

interface CreateChoreParams {
  title: string;
  description: string;
  icon: ChoreIcon | null;
  householdId: string;
}

export async function createChore({
  title,
  description,
  icon,
  householdId,
}: CreateChoreParams) {
  const { data, error } = await supabase
    .from("chores")
    .insert({
      title,
      description,
      icon,
      household_id: householdId,
      completed: false,
    })
    .select();

  if (error) throw error;
  return data;
}

export async function markChoreComplete(choreId: string) {
  const { data, error } = await supabase
    .from("chores")
    .update({ completed: true })
    .eq("id", choreId)
    .select();

  if (error) throw error;
  return data;
}

export async function updateChorePhoto(choreId: string, photoUrl: string) {
  const { data, error } = await supabase
    .from("chores")
    .update({ completion_photo: photoUrl })
    .eq("id", choreId)
    .select();

  if (error) throw error;
  return data;
}
