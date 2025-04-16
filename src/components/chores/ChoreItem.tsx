
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Brush, Shirt, Wind, Leaf, Hammer, Paintbrush, Lightbulb, Award } from "lucide-react";
import { PhotoUploadDialog } from "./PhotoUploadDialog";
import { ChoreAssignment } from "./ChoreAssignment";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Chore, Profile } from "./types";

const iconMap = {
  Brush,
  Shirt,
  Wind,
  Leaf,
  Hammer,
  Paintbrush,
  Trash2,
  Lightbulb,
};

// Points awarded for completing different types of chores
const CHORE_POINTS = {
  default: 10,
  difficult: 20,
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
  const IconComponent = chore.icon && iconMap[chore.icon] ? iconMap[chore.icon] : null;
  
  const handleToggleComplete = (checked: boolean) => {
    onToggleComplete(chore.id, checked);
  };

  // Calculate points based on chore type/description
  const getChorePoints = () => {
    // Can be extended to check for keywords like "difficult" or chore duration
    if (chore.description?.toLowerCase().includes('difficult')) {
      return CHORE_POINTS.difficult;
    }
    return CHORE_POINTS.default;
  };

  return (
    <TableRow>
      <TableCell className="w-[50px] text-center">
        <Checkbox 
          checked={chore.completed} 
          onCheckedChange={handleToggleComplete} 
          disabled={!chore.completion_photo}
        />
      </TableCell>
      <TableCell className={chore.completed ? "line-through text-gray-500" : ""}>
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent className="h-4 w-4" />}
          {chore.title}
          
          {chore.completed && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center text-yellow-500 text-xs font-semibold ml-2">
                    <Award className="h-3 w-3 mr-1" />
                    {getChorePoints()} pts
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Points earned for completing this chore</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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
