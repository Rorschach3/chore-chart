
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/components/chores/types";

interface MembersListProps {
  members?: Profile[];
  householdId?: string;
}

export const MembersList = ({ members, householdId }: MembersListProps) => {
  const { data: fetchedMembers, isLoading } = useQuery({
    queryKey: ["household-members", householdId],
    queryFn: async () => {
      if (!householdId) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("household_id", householdId);

      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!householdId && !members,
  });

  const displayMembers = members || fetchedMembers;
  
  if (isLoading) {
    return <div>Loading members...</div>;
  }

  const getInitials = (fullName: string | null) => {
    if (!fullName) return '?';
    const names = fullName.split(' ');
    return names.map(name => name.charAt(0).toUpperCase()).join('');
  };

  return (
    <div className="space-y-4">
      {displayMembers?.map((member) => (
        <div key={member.id} className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={member.avatar_url || ""} />
            <AvatarFallback>
              {getInitials(member.full_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {member.full_name || member.username || 'Unknown'}
            </p>
            {member.username && (
              <p className="text-sm text-gray-500">@{member.username}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
