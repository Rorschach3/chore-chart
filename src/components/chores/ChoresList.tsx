
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChoreItem } from "./ChoreItem";
import type { ChoresListProps } from "./types";

export function ChoresList({
  chores,
  onComplete,
  onPhotoUpload,
  isUpdating
}: ChoresListProps) {
  return (
    <div className="space-y-4">
      {chores.map(chore => (
        <ChoreItem 
          key={chore.id} 
          chore={chore}
          onComplete={onComplete}
          onPhotoUpload={onPhotoUpload}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
}
