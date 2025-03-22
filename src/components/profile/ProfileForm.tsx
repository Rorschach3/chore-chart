
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileData {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export const ProfileForm = ({ initialData }: { initialData?: ProfileData }) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch profile data if not provided
  const { data: fetchedProfileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profileData"],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, username, avatar_url")
        .eq("id", session.user.id)
        .single();
        
      if (error) throw error;
      return data as ProfileData;
    },
    enabled: !!session?.user?.id && !initialData,
  });
  
  const profileData = initialData || fetchedProfileData;
  
  const [formData, setFormData] = useState<ProfileData>({
    full_name: "",
    username: "",
    avatar_url: null,
  });
  
  // Update local state when data is fetched
  useState(() => {
    if (profileData) {
      setFormData({
        full_name: profileData.full_name || "",
        username: profileData.username || "",
        avatar_url: profileData.avatar_url || null,
      });
    }
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("Not authenticated");

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

      // Only update profile data, not authentication data like email
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          avatar_url: avatarUrl,
        })
        .eq('id', session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profileData"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  if (isProfileLoading && !initialData) {
    return <div>Loading profile data...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <CardContent>
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
                onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter your username"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-full"
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
