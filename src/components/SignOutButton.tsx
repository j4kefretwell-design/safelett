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
      className="w-full border-l-2 border-transparent py-2.5 pl-4 text-left text-sm text-charcoal-muted transition hover:text-charcoal"
    >
      Sign out
    </button>
  );
}
