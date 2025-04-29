"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";
import UserListItem from "@/components/UserListItem";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ListType = 'followers' | 'following';

interface FollowListDialogContentProps {
  username: string;
  listType: ListType;
}

export default function FollowListDialogContent({ username, listType }: FollowListDialogContentProps) {
  const supabase = createClient();
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [currentUserFollows, setCurrentUserFollows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    getCurrentUser();
  }, [supabase]);

  useEffect(() => {
    if (!username || !listType || currentUserId === undefined) return;

    const fetchProfileAndList = async () => {
      setIsLoading(true);
      setError(null);
      setAllUsers([]);
      setCurrentUserFollows(new Set());

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single();

        if (profileError || !profileData) throw new Error(profileError?.message || "Profile not found");
        const targetProfileId = profileData.id;

        let userListQuery;
        if (listType === 'followers') {
          userListQuery = supabase.from('follows').select('profiles!follower_id(*)').eq('following_id', targetProfileId);
        } else {
          userListQuery = supabase.from('follows').select('profiles!following_id(*)').eq('follower_id', targetProfileId);
        }

        const { data: userListData, error: listError } = await userListQuery;
        if (listError) throw listError;

        const fetchedUsers: Profile[] = userListData?.map((item: any) => item.profiles).filter(Boolean) || [];
        setAllUsers(fetchedUsers);

        if (currentUserId && fetchedUsers.length > 0) {
          const userIds = fetchedUsers.map(u => u.id);
          const { data: followsData, error: followsError } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', currentUserId)
            .in('following_id', userIds);

          if (followsError) console.error("Error fetching current user follows:", followsError);
          else if (followsData) setCurrentUserFollows(new Set(followsData.map(f => f.following_id)));
        }
      } catch (err: any) {
        console.error("Error fetching follow list:", err);
        setError(err.message || "Failed to load list");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndList();
  }, [username, listType, supabase, currentUserId]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return allUsers;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return allUsers.filter(user =>
      user.username.toLowerCase().includes(lowerCaseQuery) ||
      (user.full_name && user.full_name.toLowerCase().includes(lowerCaseQuery))
    );
  }, [allUsers, searchQuery]);

  const sortedUsers = useMemo(() => {
    if (listType === 'followers' && currentUserId) {
      const currentUserIndex = filteredUsers.findIndex(u => u.id === currentUserId);
      if (currentUserIndex > -1) {
        const currentUser = filteredUsers[currentUserIndex];
        const otherUsers = filteredUsers.filter(u => u.id !== currentUserId);
        return [currentUser, ...otherUsers];
      }
    }
    return filteredUsers;
  }, [filteredUsers, listType, currentUserId]);

  return (
    <div className="flex flex-col h-[70vh]">
      {/* Search Input */}
      <div className="p-4 border-b">
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
        {/* Add Search Icon if needed */}
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
          <div className="rounded-md bg-destructive/15 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}
        {!isLoading && !error && sortedUsers.length === 0 && (
          <div className="text-center text-sm text-muted-foreground pt-8">
            {searchQuery ? `No users found for "${searchQuery}"` : `No ${listType} found.`}
          </div>
        )}
        {!isLoading && !error && sortedUsers.length > 0 && (
          <div className="space-y-1">
            {sortedUsers.map((user) => (
              <UserListItem
                key={user.id}
                profile={user}
                currentUserId={currentUserId}
                isFollowingInitial={currentUserFollows.has(user.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 