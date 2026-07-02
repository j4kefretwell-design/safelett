"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SidebarUser() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="px-6 py-8">
      {email && (
        <p className="truncate text-xs font-light tracking-wide text-dusty-cream/40">
          {email}
        </p>
      )}
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-3 text-xs font-light tracking-[0.06em] text-dusty-cream/50 underline-offset-4 transition hover:text-dusty-cream/80 hover:underline"
      >
        Sign out
      </button>
    </div>
  );
}
