"use client";

import { Database } from "@/lib/database.types";
import PostDetail from "./PostDetail";

type PostWithProfile = Database["public"]["Tables"]["posts"]["Row"] & {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

interface PostCardProps {
  post: PostWithProfile;
}

export default function PostCard({ post }: PostCardProps) {
  return <PostDetail post={post} />;
} 