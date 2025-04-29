"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

interface FollowButtonProps {
  profileId: string;
  currentUserId: string;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  followersCount?: number;
}

export default function FollowButton({
  profileId,
  currentUserId,
  isFollowing: initialIsFollowing,
  onFollowChange,
  followersCount,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleFollowToggle = async () => {
    if (profileId === currentUserId) return;
    
    setIsLoading(true);
    
    try {
      // Update UI immediately
      const newIsFollowing = !isFollowing;
      setIsFollowing(newIsFollowing);
      
      // Then update the database
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', profileId);
          
        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUserId,
            following_id: profileId
          });
          
        if (error) throw error;
      }
      
      // Call the onFollowChange callback after successful database update
      if (onFollowChange) {
        onFollowChange(newIsFollowing);
      }
    } catch (error) {
      // If error, revert the optimistic update
      setIsFollowing(!isFollowing);
      if (onFollowChange) {
        onFollowChange(isFollowing);
      }
      console.error('Error toggling follow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button if it's the current user's profile
  if (profileId === currentUserId) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      disabled={isLoading}
      onClick={handleFollowToggle}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
} 