import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PostDetail from "@/components/PostDetail";

type Props = {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq("id", id)
    .single();

  if (error || !post) {
    redirect("/feed");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <PostDetail post={post} expanded={true} />
    </div>
  );
} 