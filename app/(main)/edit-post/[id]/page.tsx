"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import UserMentionsInput from "@/components/UserMentionsInput";

interface PostData {
  id: string;
  user_id: string;
  caption: string | null;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export default function EditPost() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<PostData | null>(null);
  const [caption, setCaption] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const postId = params?.id;
    if (!postId) {
      setError("Post ID not found in URL.");
      setIsLoading(false);
      return;
    }

    async function loadPost() {
      setIsLoading(true);
      setError(null);
      
      try {
        // First check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        
        // Load the post data
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", postId)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          setError("Post not found");
          return;
        }
        
        // Check if user is the author
        if (data.user_id !== user.id) {
          setError("You don't have permission to edit this post");
          return;
        }
        
        setPost(data);
        setCaption(data.caption || "");
      } catch (err: any) {
        setError(err.message || "Error loading post");
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPost();
  }, [params?.id, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!post) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Update the post
      const { error } = await supabase
        .from("posts")
        .update({ 
          caption,
          updated_at: new Date().toISOString()
        })
        .eq("id", post.id);
        
      if (error) throw error;
      
      // Redirect back to the post
      router.push(`/post/${post.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Error updating post");
      console.error("Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-6 text-center">
        <p className="text-destructive">{error}</p>
        <Button 
          onClick={() => router.push("/")} 
          variant="outline" 
          className="mt-4"
        >
          Return Home
        </Button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-md bg-destructive/15 p-6 text-center">
        <p className="text-destructive">Post not found or initial ID missing.</p>
        <Button 
          onClick={() => router.push("/")} 
          variant="outline" 
          className="mt-4"
        >
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Edit Post</h1>
        <p className="text-sm text-muted-foreground">
          Update your post details
        </p>
      </div>
      
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative aspect-square rounded-md border overflow-hidden">
            <Image
              src={post.image_url}
              alt="Post image"
              fill
              className="object-cover"
            />
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="caption" className="text-sm font-medium">
                Caption
              </label>
              <UserMentionsInput
                value={caption}
                onChange={setCaption}
                placeholder="Write a caption... (Type @ to mention users)"
                rows={5}
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button 
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 