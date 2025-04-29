"use client";

import { Database } from "@/lib/database.types";
import { createClient } from "@/utils/supabase/client";
import { Heart, MessageCircle, MoreVertical, Edit, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import CommentsSection from "@/components/CommentsSection";
import { useRouter } from "next/navigation";
import FollowButton from "./FollowButton";

type PostWithProfile = Database["public"]["Tables"]["posts"]["Row"] & {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

interface PostDetailProps {
  post: PostWithProfile;
  showHeader?: boolean;
  expanded?: boolean;
}

export default function PostDetail({ 
  post, 
  showHeader = true,
  expanded = false 
}: PostDetailProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showComments, setShowComments] = useState(expanded);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [likeButtonAnimating, setLikeButtonAnimating] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [isAuthor, setIsAuthor] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const doubleTapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tapCountRef = useRef(0);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadStatsAndStatus() {
      // Fetch current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      const userId = user?.id;
      setCurrentUserId(userId); // Store current user ID

      // Determine if the current user is the author
      const authorCheck = userId ? userId === post.user_id : false;
      setIsAuthor(authorCheck);

      // Infer initial follow state for non-authors (must be true if in feed)
      if (userId && !authorCheck) {
          setIsFollowingAuthor(true); 
      }

      // Run other fetches in parallel (Likes and Comments counts, User's Like Status)
      const [likesResult, commentsResult, userLikeResult] = await Promise.all([
        supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", post.id),
        supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", post.id),
        userId ? supabase.from("likes").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("post_id", post.id).maybeSingle() : Promise.resolve({ data: null, error: null })
      ]);

      // Set Like and Comment Counts
      const { count: totalLikes, error: likesError } = likesResult;
      if (!likesError && typeof totalLikes === "number") setLikesCount(totalLikes);
      const { count: totalComments, error: commentsError } = commentsResult;
      if (!commentsError && typeof totalComments === "number") setCommentsCount(totalComments);
      
      // Set User's Like Status
      if (userId) {
        const { data: likeData, error: likeError } = userLikeResult as { data: any, error: any };
        if (!likeError) setIsLiked(!!likeData);
      }
    }
    
    loadStatsAndStatus();
    
    // Click outside listener for menu
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, [post.id, post.user_id, supabase]); // Added supabase to dependency array

  const handleLike = async (isDoubleTap = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      // Don't do anything if already liking and this is a double tap
      if (isLiked && isDoubleTap) return;
      
      // Don't unlike if this is a double tap
      if (isDoubleTap && isLiked) return;
      
      // Update UI immediately with animation
      if (!isLiked) {
        setLikeButtonAnimating(true);
        setTimeout(() => setLikeButtonAnimating(false), 600);
      }
      
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      
      // Then update the database
      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .match({ user_id: user.id, post_id: post.id });
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: post.id,
          });
      }
    } catch (error) {
      // If error, revert the optimistic update
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      console.error("Error handling like:", error);
    }
  };

  const handleDoubleTap = () => {
    tapCountRef.current += 1;
    
    if (doubleTapTimerRef.current) {
      clearTimeout(doubleTapTimerRef.current);
    }
    
    if (tapCountRef.current === 1) {
      // Single tap - wait to see if there's a second tap
      doubleTapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
        doubleTapTimerRef.current = null;
      }, 300);
    } else if (tapCountRef.current === 2) {
      // Double tap - like the post
      tapCountRef.current = 0;
      doubleTapTimerRef.current = null;
      
      // Show heart animation with image scaling effect
      setShowLikeAnimation(true);
      
      // Create subtle scale effect
      setImageScale(0.95);
      setTimeout(() => setImageScale(1), 200);
      
      setTimeout(() => setShowLikeAnimation(false), 1200);
      
      // Like the post (if not already liked)
      handleLike(true);
    }
  };

  // Handle comments count updates from the CommentsSection
  const handleCommentsChange = (count: number) => {
    setCommentsCount(count);
  };
  
  const handleEdit = () => {
    setShowMenu(false);
    router.push(`/edit-post/${post.id}`);
  };
  
  const handleDelete = async () => {
    setShowMenu(false);
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    
    if (confirmDelete) {
      try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', post.id);
          
        if (error) throw error;
        
        // Redirect to profile or feed
        router.push('/');
        router.refresh();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  // Callback for FollowButton
  const handleFollowChange = (following: boolean) => {
      setIsFollowingAuthor(following);
      // Optionally update follower counts elsewhere if needed
  };

  return (
    <div className="rounded-lg border bg-card">
      {showHeader && (
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
              {post.profiles.avatar_url ? (
                <Image
                  src={post.profiles.avatar_url}
                  alt={post.profiles.username}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                  {post.profiles.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <Link 
              href={`/profile/${post.profiles.username}`}
              className="text-sm font-medium"
            >
              {post.profiles.username}
            </Link>
          </div>
          
          <div>
            {currentUserId && !isAuthor && (
              <FollowButton
                profileId={post.user_id}
                currentUserId={currentUserId}
                isFollowing={isFollowingAuthor}
                onFollowChange={handleFollowChange}
              />
            )}
            {isAuthor && (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-full hover:bg-muted/50"
                >
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-40 bg-background border rounded-md shadow-lg z-10">
                    <button
                      onClick={handleEdit}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                    >
                      <Edit className="h-4 w-4" /> Edit Post
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
                    >
                      <Trash className="h-4 w-4" /> Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div 
        className="relative aspect-square bg-muted overflow-hidden" 
        onClick={handleDoubleTap}
      >
        <Image
          src={post.image_url}
          alt={post.caption || "Instagram post"}
          fill
          className="object-cover transition-transform duration-200 ease-in-out"
          style={{ transform: `scale(${imageScale})` }}
        />
        
        {showLikeAnimation && (
          <div className="absolute inset-0 flex items-center justify-center z-10 animate-heart-enter">
            <Heart className="h-24 w-24 fill-red-500 text-red-500 drop-shadow-lg animate-heart-pulse" />
          </div>
        )}
      </div>
      
      <div className="p-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleLike()}
            className="flex items-center gap-1 group"
          >
            <Heart 
              className={`h-6 w-6 transition-all duration-300 ease-in-out transform group-hover:scale-110 ${
                isLiked ? "fill-red-500 text-red-500" : "group-hover:text-red-300"
              } ${
                likeButtonAnimating ? "animate-heart-bounce" : ""
              }`} 
            />
            <span className="text-sm">{likesCount}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 group"
          >
            <MessageCircle className="h-6 w-6 transition-transform duration-200 ease-in-out group-hover:scale-110 group-hover:text-blue-400" />
            <span className="text-sm">{commentsCount}</span>
          </button>
        </div>
        
        {post.caption && (
          <div className="mt-2">
            <span className="text-sm font-medium">{post.profiles.username}</span>{" "}
            <span className="text-sm">{post.caption}</span>
          </div>
        )}
        {showComments && <CommentsSection postId={post.id} onCommentsChange={handleCommentsChange} />}
      </div>
    </div>
  );
} 