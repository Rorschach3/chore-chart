
import { UserCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Profile, Chore } from "./types";

interface ChoreAssignmentProps {
  chore: Chore;
  members: Profile[];
  isAdmin: boolean;
  onAssign: (choreId: string, userId: string | null) => void;
}

export function ChoreAssignment({ chore, members, isAdmin, onAssign }: ChoreAssignmentProps) {
  if (!isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <UserCircle2 className="h-4 w-4" />
        <span>
          {chore.profiles ? (
            chore.profiles.full_name || chore.profiles.username
          ) : (
            <span className="text-gray-500">Unassigned</span>
          )}
        </span>
      </div>
    );
  }

  return (
    <Select
      value={chore.assigned_to || "unassigned"}
      onValueChange={(value) => onAssign(chore.id, value === "unassigned" ? null : value)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue>
          {chore.profiles ? (
            chore.profiles.full_name || chore.profiles.username
          ) : (
            <span className="text-gray-500">Unassigned</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">Unassigned</SelectItem>
        {members?.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.full_name || member.username}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
