"use client";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserGeneratedImages } from "@/app/_api/getUserGeneratedImages";
import { supabase } from "@/lib/supabase";
import { fetchApikey } from "@/app/_api/fetchApiKey";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User2Icon, ImageIcon, HeartIcon, KeyIcon, SaveIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/misc-components/LoadingSpinner";

interface UserStats {
  totalImages: number;
  totalLikes: number;
}

const ProfilePage = ({ user }: { user: User | null }) => {
  const [apiKey, setApiKey] = useState("");
  const queryClient = useQueryClient();

  // Fetch user's API key
  const { data: userApiKey, isLoading: isLoadingApiKey } = useQuery({
    queryKey: ["userApiKey", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return fetchApikey(user.id);
    },
    enabled: !!user,
  });

  // Fetch user stats
  const { data: userStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["userStats", user?.id],
    queryFn: async () => {
      if (!user?.id) return { totalImages: 0, totalLikes: 0 };

      // Get total images
      const { count: totalImages, error: imagesError } = await supabase
        .from("image_metadata")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get total likes
      const { count: totalLikes, error: likesError } = await supabase
        .from("image_likes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (imagesError) console.error("Error fetching image count:", imagesError);
      if (likesError) console.error("Error fetching likes count:", likesError);

      return {
        totalImages: totalImages || 0,
        totalLikes: totalLikes || 0,
      };
    },
    enabled: !!user,
  });

  // Update API key mutation
  const updateApiKey = useMutation({
    mutationFn: async (newApiKey: string) => {
      if (!user?.id) throw new Error("User not logged in");

      const { data: existingKey } = await supabase
        .from("user_api_keys")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingKey) {
        // Update existing key
        const { error } = await supabase
          .from("user_api_keys")
          .update({ api_key: newApiKey, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Insert new key
        const { error } = await supabase
          .from("user_api_keys")
          .insert({ user_id: user.id, api_key: newApiKey });

        if (error) throw error;
      }

      return newApiKey;
    },
    onSuccess: () => {
      toast({
        title: "API Key Updated",
        description: "Your API key has been successfully updated.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["userApiKey", user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update API key: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Set API key input value when userApiKey is loaded
  useEffect(() => {
    if (userApiKey) {
      setApiKey(userApiKey);
    }
  }, [userApiKey]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      updateApiKey.mutate(apiKey.trim());
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md bg-zinc-900/30 backdrop-blur-lg border border-zinc-800/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-white">Profile</CardTitle>
              <CardDescription className="text-center text-zinc-400">
                Please log in to view your profile
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Profile Header */}
        <Card className="w-full bg-zinc-900/30 backdrop-blur-lg border border-zinc-800/50 shadow-2xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-end -mt-12">
              <Avatar className="h-24 w-24 border-4 border-zinc-900 bg-zinc-800">
                <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.email || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                  <User2Icon className="w-12 h-12 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-white">{user.email}</h1>
                <p className="text-zinc-400">Member since {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-zinc-900/30 backdrop-blur-lg border border-zinc-800/50 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-zinc-200 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                Images Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <LoadingSpinner />
              ) : (
                <p className="text-4xl font-bold text-white">{userStats?.totalImages || 0}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/30 backdrop-blur-lg border border-zinc-800/50 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-zinc-200 flex items-center gap-2">
                <HeartIcon className="w-5 h-5 text-pink-400" />
                Total Likes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <LoadingSpinner />
              ) : (
                <p className="text-4xl font-bold text-white">{userStats?.totalLikes || 0}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* API Key Card */}
        <Card className="w-full bg-zinc-900/30 backdrop-blur-lg border border-zinc-800/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-zinc-200 flex items-center gap-2">
              <KeyIcon className="w-5 h-5 text-yellow-400" />
              API Key
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Enter your custom AI Horde API key for image generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-zinc-300">
                Your API Key
              </Label>
              <Input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your AI Horde API key"
                className="bg-zinc-800/50 border-zinc-700 text-white"
              />
              <p className="text-sm text-zinc-400">
                You can get an API key by registering at{" "}
                <a
                  href="https://aihorde.net/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline"
                >
                  AI Horde
                </a>
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSaveApiKey} 
              disabled={updateApiKey.isPending}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
            >
              {updateApiKey.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Save API Key
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
