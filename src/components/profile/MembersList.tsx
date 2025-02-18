
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const MembersList = ({ householdId }: { householdId: string }) => {
  const { data: members, isLoading } = useQuery({
    queryKey: ["household-members", householdId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("household_id", householdId);

      if (error) throw error;
      return data;
    },
    enabled: !!householdId,
  });

  if (isLoading) {
    return <div>Loading members...</div>;
  }

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
                  {member.first_name?.[0]?.toUpperCase()}
                  {member.last_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {member.first_name} {member.last_name}
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
