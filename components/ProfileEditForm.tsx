"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";
import Image from "next/image";

export default function ProfileEditForm() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfile(data);
        setUsername(data.username);
        setFullName(data.full_name || '');
        setBio(data.bio || '');
        if (data.avatar_url) setAvatarPreview(data.avatar_url);
      }
    })();
  }, []);

  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [avatarFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !profile) return;

    let avatarUrl = profile.avatar_url;
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('instagram')
        .upload(filePath, avatarFile, { upsert: true });
      if (!uploadError) {
        const { data: publicUrl } = supabase.storage
          .from('instagram')
          .getPublicUrl(filePath);
        avatarUrl = publicUrl.publicUrl;
      }
    }

    await supabase
      .from('profiles')
      .update({ username, full_name: fullName, bio, avatar_url: avatarUrl })
      .eq('id', user.id);

    setLoading(false);
    // Optionally refresh or navigate
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-muted">
          {avatarPreview ? (
            <Image src={avatarPreview} alt="Avatar preview" width={64} height={64} className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <label className="cursor-pointer text-sm text-primary hover:underline">
          Change Avatar
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setAvatarFile(e.target.files[0])} />
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-md border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Full Name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-md border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full rounded-md border px-3 py-2" rows={3} />
      </div>
      <button disabled={loading} className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50">
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
} 