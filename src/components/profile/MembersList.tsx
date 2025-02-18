
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  username: string | null;
  household_id: string | null;
}

export const MembersList = ({ householdId }: { householdId: string }) => {
  const { data: members, isLoading } = useQuery({
    queryKey: ["household-members", householdId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("household_id", householdId);

      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!householdId,
  });

  if (isLoading) {
    return <div>Loading members...</div>;
  }

  const getInitials = (fullName: string | null) => {
    if (!fullName) return '?';
    const names = fullName.split(' ');
    return names.map(name => name.charAt(0).toUpperCase()).join('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Household Members</CardTitle>
        <CardDescription>People in your household</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members?.map((member) => (
            <div key={member.id} className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={member.avatar_url || ""} />
                <AvatarFallback>
                  {getInitials(member.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {member.full_name || 'Unknown'}
                </p>
                {member.username && (
                  <p className="text-sm text-gray-500">@{member.username}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
