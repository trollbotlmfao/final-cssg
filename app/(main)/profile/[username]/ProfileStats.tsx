"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
// Link is no longer needed here, but we need Dialog components
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FollowListDialogContent from "@/components/FollowListDialogContent";

export interface ProfileStatsRef {
  updateFollowerCount: (isFollowing: boolean) => void;
}

interface ProfileStatsProps {
  username: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

const ProfileStats = forwardRef<ProfileStatsRef, ProfileStatsProps>(({
  username,
  postsCount,
  followersCount: initialFollowersCount,
  followingCount,
}: ProfileStatsProps, ref) => {
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);

  // Update follower count if the prop changes (due to a follow/unfollow action)
  useEffect(() => {
    setFollowersCount(initialFollowersCount);
  }, [initialFollowersCount]);

  // Listen for custom events to update follower count
  useEffect(() => {
    const handleUpdateFollowerCount = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { isFollowing } = customEvent.detail;
      setFollowersCount(prevCount => 
        isFollowing ? prevCount + 1 : prevCount - 1
      );
    };

    // Add event listener
    document.addEventListener('updateFollowerCount', handleUpdateFollowerCount);
    
    // Remove event listener on cleanup
    return () => {
      document.removeEventListener('updateFollowerCount', handleUpdateFollowerCount);
    };
  }, []);

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    updateFollowerCount: (isFollowing: boolean) => {
      setFollowersCount(prevCount => isFollowing ? prevCount + 1 : prevCount - 1);
    }
  }));

  return (
    <div className="flex space-x-6">
      <div className="text-center">
        <span className="block font-bold">{postsCount}</span>
        <span className="text-sm text-muted-foreground">Posts</span>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <button className="text-center hover:underline cursor-pointer">
            <span className="block font-bold">{followersCount}</span>
            <span className="text-sm text-muted-foreground">Followers</span>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] p-0">
           <DialogHeader className="p-4 border-b text-center">
              <DialogTitle>Followers</DialogTitle>
           </DialogHeader>
          <FollowListDialogContent username={username} listType="followers" />
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <button className="text-center hover:underline cursor-pointer">
            <span className="block font-bold">{followingCount}</span>
            <span className="text-sm text-muted-foreground">Following</span>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] p-0">
          <DialogHeader className="p-4 border-b text-center">
              <DialogTitle>Following</DialogTitle>
           </DialogHeader>
          <FollowListDialogContent username={username} listType="following" />
        </DialogContent>
      </Dialog>

    </div>
  );
});

ProfileStats.displayName = "ProfileStats";
export default ProfileStats; 