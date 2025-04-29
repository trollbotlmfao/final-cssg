import { createClient } from "@/utils/supabase/server";
import PostCard from "@/components/PostCard";
import { redirect } from "next/navigation";

export default async function FeedPage(props: any) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  // Get users that the current user follows
  const { data: followedUsers } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id);
  
  // Create an array of user IDs to include in the feed (current user + followed users)
  const followedUserIds = followedUsers?.map(follow => follow.following_id) || [];
  const userIdsToShow = [user.id, ...followedUserIds];
  
  // Fetch posts from current user and followed users
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .in('user_id', userIdsToShow)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching posts:", error);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold md:text-2xl">Feed</h1>
      </div>
      
      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No posts yet</h3>
          <p className="text-sm text-muted-foreground">
            Follow more users to see their posts in your feed.
          </p>
        </div>
      )}
    </div>
  );
} 