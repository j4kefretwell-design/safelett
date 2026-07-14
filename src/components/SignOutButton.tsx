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
      className="group w-full border-l border-transparent py-3 pl-5 text-left text-sm font-light tracking-[0.06em] text-dusty-cream/45 transition-all duration-200 hover:border-dusty-cream/15 hover:text-dusty-cream/75"
    >
      Sign out
    </button>
  );
}
