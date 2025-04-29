"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";
import Link from "next/link";
import Image from "next/image";
import { debounce } from "lodash";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type PostWithProfile = Database["public"]["Tables"]["posts"]["Row"] & {
  profiles: { username: string; avatar_url: string | null };
};

export default function SearchPage() {
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"users" | "posts">("users");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, type: "users" | "posts") => {
    setLoading(true);
      if (type === "users") {
        let query = supabase
        .from("profiles")
        .select("*")
          .limit(20);
          
        if (searchQuery.trim() !== "") {
          query = query.or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query;
      if (!error && data) setProfiles(data);
        else console.error(error);
    } else {
        let query = supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
          .limit(20);
          
        if (searchQuery.trim() !== "") {
          query = query.ilike("caption", `%${searchQuery}%`);
        }
        
        const { data, error } = await query;
      if (!error && data) setPosts(data as PostWithProfile[]);
        else console.error(error);
    }
    setLoading(false);
    }, 300),
    []
  );

  // Trigger search when query or searchType changes
  useEffect(() => {
    debouncedSearch(query, searchType);
    
    // Clean up the debounce function on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, searchType, debouncedSearch]);

  // Handle search type change
  const handleSearchTypeChange = (type: "users" | "posts") => {
    setSearchType(type);
    // Results will be updated automatically via useEffect
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Search</h1>
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md border px-3 py-2 pr-10"
          autoFocus
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => handleSearchTypeChange("users")}
          className={`px-3 py-1 rounded transition-colors ${
            searchType === "users" ? "bg-primary text-primary-foreground" : "bg-muted/30 hover:bg-muted/50"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => handleSearchTypeChange("posts")}
          className={`px-3 py-1 rounded transition-colors ${
            searchType === "posts" ? "bg-primary text-primary-foreground" : "bg-muted/30 hover:bg-muted/50"
          }`}
        >
          Posts
        </button>
      </div>
      <div className="space-y-4 min-h-[200px]">
        {searchType === "users" && (
          <>
            {profiles.length > 0 ? (
              <div className="space-y-2">
                {profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/profile/${profile.username}`}
                    className="flex items-center space-x-3 rounded p-2 hover:bg-muted/30"
              >
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.username}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
                    <div>
                      <span className="font-medium">{profile.username}</span>
                      {profile.full_name && (
                        <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                      )}
                    </div>
              </Link>
                ))}
              </div>
          ) : (
              query.trim() !== "" && !loading && <p>No users found.</p>
            )}
          </>
        )}
        {searchType === "posts" && (
          <>
            {posts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="block">
                    <div className="relative aspect-square w-full overflow-hidden rounded">
                  <Image
                    src={post.image_url}
                    alt={post.caption || "Post"}
                    fill
                        className="object-cover transition-all hover:scale-105"
                  />
                </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="h-5 w-5 rounded-full overflow-hidden">
                        {post.profiles.avatar_url ? (
                          <Image
                            src={post.profiles.avatar_url}
                            alt={post.profiles.username}
                            width={20}
                            height={20}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center text-xs">
                            {post.profiles.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-xs">{post.profiles.username}</span>
                    </div>
                    <p className="mt-1 text-sm line-clamp-2">{post.caption}</p>
              </Link>
                ))}
              </div>
          ) : (
              query.trim() !== "" && !loading && <p>No posts found.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
} 