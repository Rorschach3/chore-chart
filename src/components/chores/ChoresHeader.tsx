
import { Button } from "@/components/ui/button";
import { ChoreDialog } from "./ChoreDialog";

interface ChoresHeaderProps {
  username: string | null;
  isDialogOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateBack: () => void;
  onCreateChore: (e: React.FormEvent) => void;
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  isSubmitting: boolean;
}

export function ChoresHeader({
  username,
  isDialogOpen,
  onOpenChange,
  onNavigateBack,
  onCreateChore,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  isSubmitting,
}: ChoresHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Household Chores</h1>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500">
          Logged in as: {username || 'Unknown User'}
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={onNavigateBack}>
            Back to Household
          </Button>
          <ChoreDialog
            isOpen={isDialogOpen}
            onOpenChange={onOpenChange}
            onSubmit={onCreateChore}
            title={title}
            onTitleChange={onTitleChange}
            description={description}
            onDescriptionChange={onDescriptionChange}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
