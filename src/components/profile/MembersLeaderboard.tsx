import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Award, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/components/chores/types";

interface MembersLeaderboardProps {
  householdId: string;
}

export function MembersLeaderboard({ householdId }: MembersLeaderboardProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: members = [], isLoading } = useQuery<Profile[]>({
    queryKey: ["household-members-points", householdId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, points")
        .eq("household_id", householdId);

      if (error) throw error;
      
      // Ensure all members have at least 0 points
      return data.map(member => ({
        ...member,
        points: member.points || 0
      }));
    },
    enabled: !!householdId,
  });

  const sortedMembers = [...members].sort((a, b) => {
    if (sortOrder === "desc") {
      return (b.points || 0) - (a.points || 0);
    } else {
      return (a.points || 0) - (b.points || 0);
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const getInitials = (name: string | null): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return "text-yellow-500"; // Gold
      case 1: return "text-gray-400";   // Silver
      case 2: return "text-amber-700";  // Bronze
      default: return "text-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" /> Leaderboard
            </CardTitle>
            <CardDescription>Who's completed the most chores?</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSortOrder}
            className="text-xs flex items-center"
          >
            {sortOrder === "desc" ? (
              <>Highest <ArrowDown className="ml-1 h-3 w-3" /></>
            ) : (
              <>Lowest <ArrowUp className="ml-1 h-3 w-3" /></>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : sortedMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No members found</div>
        ) : (
          <div className="space-y-4">
            {sortedMembers.map((member, index) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium">
                    {index < 3 ? (
                      <Trophy className={`h-4 w-4 ${getMedalColor(index)}`} />
                    ) : (
                      <span className="text-gray-500">{index + 1}</span>
                    )}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar_url || ""} />
                    <AvatarFallback>{getInitials(member.full_name || member.username)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {member.full_name || member.username || "Anonymous"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.username && member.full_name && `@${member.username}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Award className="h-4 w-4 text-yellow-500" />
                  {member.points || 0} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
