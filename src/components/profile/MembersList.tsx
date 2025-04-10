
import { useHouseholdMembers } from "@/hooks/useHouseholdMembers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile } from "@/components/chores/types";

export const MembersList = ({ householdId }: { householdId: string }) => {
  const { data: members, isLoading } = useHouseholdMembers(householdId);

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
