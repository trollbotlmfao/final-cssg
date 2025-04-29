"use client";

import Image from "next/image";
import Link from "next/link";
import FollowButton from "./FollowButton"; // Use FollowButton directly
import { Database } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface UserListItemProps {
  profile: Profile;
  currentUserId: string | undefined;
  isFollowingInitial: boolean;
}

export default function UserListItem({
  profile,
  currentUserId,
  isFollowingInitial,
}: UserListItemProps) {

  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md">
      <Link href={`/profile/${profile.username}`} className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{profile.username}</p>
          {profile.full_name && (
            <p className="text-xs text-muted-foreground">{profile.full_name}</p>
          )}
        </div>
      </Link>
      
      {/* Conditionally render FollowButton only if currentUserId is defined */}
      {currentUserId && (
        <FollowButton 
          profileId={profile.id} 
          currentUserId={currentUserId} // Now guaranteed to be string
          isFollowing={isFollowingInitial} 
        />
      )}
    </div>
  );
} 