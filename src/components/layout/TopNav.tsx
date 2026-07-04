"use client";

import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface TopNavProps {
  sidebarOpen: boolean;
  onMenuClick: () => void;
}

export default function TopNav({ sidebarOpen, onMenuClick }: TopNavProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="fixed inset-x-0 top-0 z-30 h-16 bg-raspberry">
      <div className="relative flex h-full items-center border-b border-gold px-6 lg:px-10">
        <button
          type="button"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          onClick={onMenuClick}
          className="relative z-10 shrink-0 text-dusty-cream transition hover:text-white"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" strokeWidth={1.25} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.25} />
          )}
        </button>

        <p className="pointer-events-none absolute inset-x-0 text-center font-serif text-sm uppercase tracking-[0.32em] text-dusty-cream sm:text-base">
          Fretwell <span className="text-gold">&amp;</span> Co
        </p>

        <button
          type="button"
          onClick={handleSignOut}
          className="relative z-10 ml-auto shrink-0 text-[10px] font-normal uppercase tracking-[0.22em] text-dusty-cream transition hover:text-gold"
        >
          SIGN OUT
        </button>
      </div>
    </header>
  );
}
