
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, UserCircle2, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoUpload = async (choreId: string, file: File) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${choreId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chore-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chore-photos')
        .getPublicUrl(filePath);

      await supabase
        .from('chores')
        .update({
          completed: true,
          completion_photo: publicUrl
        })
        .eq('id', choreId);

      onToggleComplete(choreId, true);
      setSelectedChore(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Done</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Photo</TableHead>
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
                  disabled={!chore.completion_photo}
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedChore(chore)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Completion Photo</DialogTitle>
                        <DialogDescription>
                          Upload a photo of the completed chore to mark it as done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0] && selectedChore) {
                              handlePhotoUpload(selectedChore.id, e.target.files[0]);
                            }
                          }}
                          disabled={isUploading}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
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
    </>
  );
}
