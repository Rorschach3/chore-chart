
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import type { Chore } from "./types";
import { toast } from "sonner";

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
      const fileName = `${choreId}-${Date.now()}.${fileExt}`;
      const filePath = `${choreId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chore-photos')
        .upload(filePath, file);

      if (uploadError) {
        toast.error('Error uploading photo', {
          description: uploadError.message
        });
        throw uploadError;
      }

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

      toast.success('Photo uploaded successfully');
      onPhotoUploaded(choreId, true);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
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
