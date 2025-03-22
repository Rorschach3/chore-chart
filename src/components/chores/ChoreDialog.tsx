
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChoreDialogProps, ChoreIcon } from "./types";
import { Check, Plus, Utensils, ShowerHead, Trash, Scissors } from "lucide-react";

// Map of available icon options
const iconOptions: Record<ChoreIcon, typeof Utensils> = {
  "Utensils": Utensils,
  "ShowerHead": ShowerHead,
  "Trash": Trash,
  "Scissors": Scissors,
};

export function ChoreDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  icon,
  onIconChange,
  isSubmitting,
}: ChoreDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Chore
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Chore</DialogTitle>
          <DialogDescription>
            Add a new chore to your household task list.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter chore title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter chore description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(iconOptions).map(([iconName, IconComponent]) => {
                const isSelected = icon === iconName;
                return (
                  <Button
                    key={iconName}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`h-12 ${isSelected ? "ring-2 ring-primary" : ""}`}
                    onClick={() => onIconChange(iconName as ChoreIcon)}
                  >
                    <IconComponent className="h-6 w-6" />
                    {isSelected && <Check className="h-3 w-3 absolute top-1 right-1" />}
                  </Button>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Chore"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
