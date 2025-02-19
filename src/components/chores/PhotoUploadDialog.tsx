
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import type { Chore } from "./types";

interface PhotoUploadDialogProps {
  chore: Chore;
  onPhotoUploaded: (choreId: string, completed: boolean) => void;
}

export function PhotoUploadDialog({ chore, onPhotoUploaded }: PhotoUploadDialogProps) {
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

      onPhotoUploaded(choreId, true);
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
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
              if (e.target.files?.[0]) {
                handlePhotoUpload(chore.id, e.target.files[0]);
              }
            }}
            disabled={isUploading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
