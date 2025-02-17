
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, UserCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Profile, Chore } from "./types";

interface ChoresListProps {
  chores: Chore[];
  members: Profile[];
  isAdmin: boolean;
  onToggleComplete: (choreId: string, completed: boolean) => void;
  onAssign: (choreId: string, userId: string | null) => void;
  onDelete: (choreId: string) => void;
}

export function ChoresList({
  chores,
  members,
  isAdmin,
  onToggleComplete,
  onAssign,
  onDelete,
}: ChoresListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Done</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Assigned To</TableHead>
          {isAdmin && <TableHead className="w-12">Delete</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {chores.map((chore) => (
          <TableRow key={chore.id}>
            <TableCell>
              <Checkbox
                checked={chore.completed}
                onCheckedChange={(checked) =>
                  onToggleComplete(chore.id, checked as boolean)
                }
              />
            </TableCell>
            <TableCell className={chore.completed ? "line-through text-gray-500" : ""}>
              {chore.title}
            </TableCell>
            <TableCell className={chore.completed ? "line-through text-gray-500" : ""}>
              {chore.description}
            </TableCell>
            <TableCell>
              {isAdmin ? (
                <Select
                  value={chore.assigned_to || ""}
                  onValueChange={(value) => onAssign(chore.id, value || null)}
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
                    <SelectItem value="">Unassigned</SelectItem>
                    {members?.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name || member.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
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
              )}
            </TableCell>
            {isAdmin && (
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(chore.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
