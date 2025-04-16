
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Image } from "lucide-react";
import type { Chore } from "./types";
import { toast } from "sonner";

interface PhotoUploadDialogProps {
  chore: Chore;
  onPhotoUploaded: (choreId: string, completed: boolean) => void;
}

export function PhotoUploadDialog({ chore, onPhotoUploaded }: PhotoUploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handlePhotoUpload = async (choreId: string, file: File) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${choreId}-${Date.now()}.${fileExt}`;
      const filePath = `${choreId}/${fileName}`;
      
      console.log("Uploading to chore-photos bucket:", filePath);

      // Create a preview URL for the selected file
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      const { error: uploadError } = await supabase.storage
        .from('chore-photos')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error('Error uploading photo', {
          description: uploadError.message
        });
        throw uploadError;
      }

      // Get the public URL - construct it properly to ensure it works
      const { data } = supabase.storage
        .from('chore-photos')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      console.log("Generated public URL:", publicUrl);

      const { error: updateError } = await supabase
        .from('chores')
        .update({
          completed: true,
          completion_photo: publicUrl
        })
        .eq('id', choreId);

      if (updateError) {
        console.error("Update error:", updateError);
        toast.error('Error updating chore', {
          description: updateError.message
        });
        throw updateError;
      }

      toast.success('Photo uploaded successfully');
      onPhotoUploaded(choreId, true);
      setOpen(false); // Close the dialog on success
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          {previewUrl && (
            <div className="flex justify-center">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-40 object-contain rounded-md" 
              />
            </div>
          )}
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
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </div>
        {isUploading && (
          <div className="text-center text-sm text-muted-foreground">
            Uploading photo...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
