"use client";

import { useRef } from "react";
import FollowButton from "@/components/FollowButton";
import { useRouter } from "next/navigation";
import { ProfileStatsRef } from "./ProfileStats";

interface FollowButtonWrapperProps {
  profileId: string;
  currentUserId: string;
  isFollowing: boolean;
  initialFollowersCount: number;
}

export default function FollowButtonWrapper({
  profileId,
  currentUserId,
  isFollowing,
  initialFollowersCount,
}: FollowButtonWrapperProps) {
  const router = useRouter();
  
  // Find the ProfileStats component by looking in the DOM
  const updateStats = (isFollowing: boolean) => {
    try {
      // Use a custom event to communicate with the ProfileStats component
      const event = new CustomEvent('updateFollowerCount', {
        detail: { isFollowing }
      });
      document.dispatchEvent(event);
    } catch (error) {
      console.error('Error updating follower stats:', error);
    }
  };

  // Handle follow status change
  const handleFollowChange = (isFollowing: boolean) => {
    // Update the UI immediately (optimistic update)
    updateStats(isFollowing);
    
    // Refresh the page data after a delay to ensure database consistency
    setTimeout(() => {
      router.refresh();
    }, 500);
  };

  return (
    <FollowButton
      profileId={profileId}
      currentUserId={currentUserId}
      isFollowing={isFollowing}
      onFollowChange={handleFollowChange}
    />
  );
} 