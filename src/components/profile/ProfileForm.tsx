
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileData {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export const ProfileForm = ({ initialData }: { initialData?: ProfileData }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ProfileData>({
    full_name: initialData?.full_name || "",
    username: initialData?.username || "",
    avatar_url: initialData?.avatar_url || null,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      
      // Check if username is already taken by another user
      if (formData.username && formData.username !== initialData?.username) {
        setIsCheckingUsername(true);
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', formData.username)
          .neq('id', session.user.id)
          .single();
        
        setIsCheckingUsername(false);
        
        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 means no rows returned, which is what we want
          throw checkError;
        }
        
        if (existingUser) {
          throw new Error("Username is already taken");
        }
      }

      let avatarUrl = formData.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${session.user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          avatar_url: avatarUrl,
        })
        .eq('id', session.user.id);

      if (error) {
        // If we encounter a unique constraint violation
        if (error.code === '23505') {
          throw new Error("Username is already taken");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setFormError(null);
    },
    onError: (error: any) => {
      setFormError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    updateProfile.mutate();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const getInitials = (fullName: string | null) => {
    if (!fullName) return '?';
    const names = fullName.split(' ');
    return names.map(name => name.charAt(0).toUpperCase()).join('');
  };

  const handleUsernameChange = (value: string) => {
    setFormData(prev => ({ ...prev, username: value }));
    setFormError(null); // Clear errors when user changes input
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <CardContent>
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarFile ? URL.createObjectURL(avatarFile) : formData.avatar_url || ''} />
              <AvatarFallback>{getInitials(formData.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="max-w-xs"
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.full_name || ''}
                onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username || ''}
                onChange={e => handleUsernameChange(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={updateProfile.isPending || isCheckingUsername}
            className="w-full"
          >
            {updateProfile.isPending || isCheckingUsername ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
