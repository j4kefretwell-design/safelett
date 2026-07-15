"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TrialBannerProps {
  daysRemaining: number;
  onDismiss?: () => void;
}

const DISMISS_KEY = "safelett-trial-banner-dismissed";

export default function TrialBanner({
  daysRemaining,
  onDismiss,
}: TrialBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") {
        setVisible(false);
        onDismiss?.();
        return;
      }
    } catch {
      // ignore storage errors
    }
    setVisible(true);
  }, [onDismiss]);

  if (!visible || daysRemaining <= 0) return null;

  const dayLabel = daysRemaining === 1 ? "1 day" : `${daysRemaining} days`;

  return (
    <div className="relative z-20 flex h-11 w-full items-center gap-3 bg-[#C4A35A] px-4 text-umber sm:px-6 lg:px-12">
      <p className="min-w-0 flex-1 truncate text-[13px] font-light leading-snug">
        You are on a free trial —{" "}
        <span className="font-normal">{dayLabel} remaining</span>. Subscribe to
        continue after your trial ends.
      </p>
      <Link
        href="/subscription"
        className="shrink-0 text-[12px] font-normal text-raspberry transition hover:opacity-80"
      >
        Subscribe Now →
      </Link>
      <button
        type="button"
        aria-label="Dismiss trial banner"
        onClick={() => {
          try {
            sessionStorage.setItem(DISMISS_KEY, "1");
          } catch {
            // ignore
          }
          setVisible(false);
          onDismiss?.();
        }}
        className="flex h-8 w-8 shrink-0 items-center justify-center text-lg font-light leading-none text-umber/70 transition hover:text-umber"
      >
        ×
      </button>
    </div>
  );
}
