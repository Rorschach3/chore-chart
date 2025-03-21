
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Broom, WashingMachine, Vacuum, Leaf, Hammer, Screwdriver, PaintRoller, Trash, Lightbulb } from "lucide-react";
import { PhotoUploadDialog } from "./PhotoUploadDialog";
import { ChoreAssignment } from "./ChoreAssignment";
import type { Chore, Profile } from "./types";

const iconMap = {
  Broom,
  WashingMachine,
  Vacuum,
  Leaf,
  Hammer,
  Screwdriver,
  PaintRoller,
  Trash,
  Lightbulb,
};

interface ChoreItemProps {
  chore: Chore;
  members: Profile[];
  isAdmin: boolean;
  onToggleComplete: (choreId: string, completed: boolean) => void;
  onAssign: (choreId: string, userId: string | null) => void;
  onDelete: (choreId: string) => void;
}

export function ChoreItem({
  chore,
  members,
  isAdmin,
  onToggleComplete,
  onAssign,
  onDelete
}: ChoreItemProps) {
  const IconComponent = chore.icon ? iconMap[chore.icon] : null;

  return (
    <TableRow>
      <TableCell className="w-[50px] text-center">
        <Checkbox 
          checked={chore.completed} 
          onCheckedChange={checked => onToggleComplete(chore.id, checked as boolean)} 
          disabled={!chore.completion_photo}
        />
      </TableCell>
      <TableCell className={chore.completed ? "line-through text-gray-500" : ""}>
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="h-4 w-4" />}
          {chore.title}
        </div>
      </TableCell>
      <TableCell className={chore.completed ? "line-through text-gray-500" : ""}>
        {chore.description}
      </TableCell>
      <TableCell>
        <ChoreAssignment 
          chore={chore} 
          members={members} 
          isAdmin={isAdmin} 
          onAssign={onAssign}
        />
      </TableCell>
      <TableCell>
        {chore.completion_photo ? (
          <a 
            href={chore.completion_photo} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:text-blue-700"
          >
            View Photo
          </a>
        ) : (
          <PhotoUploadDialog chore={chore} onPhotoUploaded={onToggleComplete} />
        )}
      </TableCell>
      {isAdmin && (
        <TableCell className="w-[50px]">
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
  );
}
