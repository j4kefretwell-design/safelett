"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-ivory/70 transition hover:bg-ivory/5 hover:text-ivory"
    >
      Sign out
    </button>
  );
}
