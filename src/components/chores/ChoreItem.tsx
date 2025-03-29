
import { useState } from "react";
import { Chore } from "./types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Utensils, ShowerHead, Trash, Scissors, Check, Camera } from "lucide-react";
import { PhotoUploadDialog } from "./PhotoUploadDialog";
import { useToast } from "@/components/ui/use-toast";

// Icon mapping
const iconComponents = {
  Utensils: Utensils,
  ShowerHead: ShowerHead,
  Trash: Trash,
  Scissors: Scissors,
};

interface ChoreItemProps {
  chore: Chore;
  onComplete: (id: string) => void;
  onPhotoUpload: (id: string, photo: File) => void;
  isUpdating: boolean;
}

export function ChoreItem({ chore, onComplete, onPhotoUpload, isUpdating }: ChoreItemProps) {
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const IconComponent = chore.icon ? iconComponents[chore.icon] : Utensils;

  const handlePhotoUpload = (photo: File) => {
    onPhotoUpload(chore.id, photo);
    setIsPhotoDialogOpen(false);
  };

  const handleCompleteClick = () => {
    if (!chore.completion_photo) {
      toast({
        title: "Photo Required",
        description: "Please upload a photo of the completed chore before marking it as done.",
        variant: "destructive"
      });
      setIsPhotoDialogOpen(true);
      return;
    }
    
    onComplete(chore.id);
  };

  return (
    <div className="flex items-start p-4 bg-white dark:bg-gray-800 rounded-lg shadow mb-4 transition-all duration-200 hover:shadow-md">
      <div className="mr-4 bg-primary-100 p-2 rounded-full">
        <IconComponent className="h-6 w-6 text-primary" />
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{chore.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{chore.description}</p>
          </div>
          
          <Badge variant={chore.completed ? "secondary" : "outline"}>
            {chore.completed ? "Completed" : "Pending"}
          </Badge>
        </div>
        
        <div className="mt-2 flex justify-between items-center">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarFallback>
                {chore.profiles?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {chore.profiles?.full_name || "Unassigned"}
            </span>
          </div>
          
          {!chore.completed && (
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant={chore.completion_photo ? "default" : "outline"}
                onClick={() => setIsPhotoDialogOpen(true)}
              >
                <Camera className="h-4 w-4 mr-1" />
                {chore.completion_photo ? "Change Photo" : "Upload Photo"}
              </Button>
              <Button 
                size="sm" 
                variant="default" 
                onClick={handleCompleteClick}
                disabled={isUpdating}
              >
                <Check className="h-4 w-4 mr-1" />
                Complete
              </Button>
            </div>
          )}
          
          {chore.completed && chore.completion_photo && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => window.open(chore.completion_photo || '', '_blank')}
            >
              View Photo
            </Button>
          )}
        </div>
      </div>
      
      <PhotoUploadDialog 
        isOpen={isPhotoDialogOpen}
        onOpenChange={setIsPhotoDialogOpen}
        onUpload={handlePhotoUpload}
      />
    </div>
  );
}
