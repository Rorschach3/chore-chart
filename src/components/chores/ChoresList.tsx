
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChoreItem } from "./ChoreItem";
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
  onDelete
}: ChoresListProps) {
  return <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">Done</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Photo</TableHead>
          {isAdmin && <TableHead className="w-[50px]">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {chores.map(chore => (
          <ChoreItem 
            key={chore.id} 
            chore={chore} 
            members={members} 
            isAdmin={isAdmin} 
            onToggleComplete={onToggleComplete} 
            onAssign={onAssign} 
            onDelete={onDelete} 
          />
        ))}
      </TableBody>
    </Table>;
}
