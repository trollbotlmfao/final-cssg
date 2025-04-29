import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import FollowButtonWrapper from "./FollowButtonWrapper";
import ProfileStats from "./ProfileStats";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ username: string }>
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  
  if (!username) {
    return notFound();
  }
  
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile by username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  
  if (profileError || !profile) {
    return notFound();
  }

  // Fetch user's posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });
  
  if (postsError) {
    console.error('Error fetching posts:', postsError);
  }

  // Fetch counts
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id);
  
  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id);

  // Check if current user is following this profile
  let isFollowing = false;
  if (user) {
    const { data: followData } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', user.id)
      .eq('following_id', profile.id)
      .single();
    
    isFollowing = !!followData;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4 md:flex-row md:space-x-8 md:space-y-0">
        <div className="h-24 w-24 overflow-hidden rounded-full bg-muted md:h-32 md:w-32">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center space-y-4 text-center md:items-start md:text-left">
          <div className="flex w-full items-center gap-4">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            {user && user.id !== profile.id && (
              <FollowButtonWrapper
                profileId={profile.id}
                currentUserId={user.id}
                isFollowing={isFollowing}
                initialFollowersCount={followersCount || 0}
              />
            )}
            {user && user.id === profile.id && (
              <Link href="/profile/edit" className="rounded-md border px-3 py-1 text-sm">
                Edit Profile
              </Link>
            )}
          </div>
          
          <ProfileStats
            username={profile.username}
            postsCount={posts?.length || 0}
            followersCount={followersCount || 0}
            followingCount={followingCount || 0}
          />
          
          {profile.full_name && <p className="font-medium">{profile.full_name}</p>}
          {profile.bio && <p className="text-sm">{profile.bio}</p>}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">Posts</h2>
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="relative aspect-square bg-muted">
                <Image
                  src={post.image_url}
                  alt={post.caption || "Post"}
                  fill
                  className="object-cover"
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium">No posts yet</h3>
            <p className="text-sm text-muted-foreground">
              {`@${profile.username}`} has not posted anything yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 