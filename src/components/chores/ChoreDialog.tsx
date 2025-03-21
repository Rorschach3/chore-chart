
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Broom, WashingMachine, Vacuum, Leaf, Hammer, Screwdriver, PaintRoller, Trash, Lightbulb } from "lucide-react";
import { ChoreIcon } from "./types";

const CHORE_ICONS: { icon: ChoreIcon; label: string; component: React.FC }[] = [
  { icon: 'Broom', label: "Sweeping", component: Broom },
  { icon: 'WashingMachine', label: "Laundry", component: WashingMachine },
  { icon: 'Vacuum', label: "Vacuuming", component: Vacuum },
  { icon: 'Leaf', label: "Yard Work", component: Leaf },
  { icon: 'Hammer', label: "Repairs", component: Hammer },
  { icon: 'Screwdriver', label: "Maintenance", component: Screwdriver },
  { icon: 'PaintRoller', label: "Painting", component: PaintRoller },
  { icon: 'Trash', label: "Trash", component: Trash },
  { icon: 'Lightbulb', label: "Utilities", component: Lightbulb },
];

interface ChoreDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  icon: ChoreIcon | null;
  onIconChange: (value: ChoreIcon) => void;
  isSubmitting: boolean;
}

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
        <Button>Add Chore</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Chore</DialogTitle>
          <DialogDescription>Create a new chore for your household.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter chore title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select value={icon || undefined} onValueChange={(value) => onIconChange(value as ChoreIcon)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {CHORE_ICONS.map(({ icon, label, component: IconComponent }) => (
                  <SelectItem key={icon} value={icon}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter chore description (optional)"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Adding..." : "Add Chore"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
