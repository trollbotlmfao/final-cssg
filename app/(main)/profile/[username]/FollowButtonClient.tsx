"use client";

import FollowButton from "@/components/FollowButton";

interface FollowButtonClientProps {
  profileId: string;
  currentUserId: string;
  initialIsFollowing: boolean;
  initialFollowersCount: number;
}

export default function FollowButtonClient({
  profileId,
  currentUserId,
  initialIsFollowing,
}: FollowButtonClientProps) {
  return (
    <FollowButton
      profileId={profileId}
      currentUserId={currentUserId}
      isFollowing={initialIsFollowing}
    />
  );
} 