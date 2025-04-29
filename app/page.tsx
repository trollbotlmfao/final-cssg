import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    redirect("/feed");
  } else {
    redirect("/login");
  }
} 