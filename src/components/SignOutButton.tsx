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
      className="group w-full border-l-2 border-transparent py-3 pl-5 text-left text-sm tracking-[0.08em] text-cream/50 transition-all duration-200 hover:border-gold/40 hover:bg-[rgba(255,255,255,0.03)] hover:pl-6 hover:text-cream/90"
    >
      Sign out
    </button>
  );
}
