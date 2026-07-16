"use client";

import Link from "next/link";

interface TrialBannerProps {
  daysRemaining: number;
  onDismiss?: () => void;
}

export default function TrialBanner({ daysRemaining }: TrialBannerProps) {
  if (daysRemaining <= 0) return null;

  const dayLabel = daysRemaining === 1 ? "1 day" : `${daysRemaining} days`;

  return (
    <div className="relative z-20 flex h-9 w-full items-center justify-between gap-4 border-t border-raspberry bg-[#F8F4EE] px-4 sm:px-6 lg:px-12">
      <p className="min-w-0 truncate text-[12px] font-light leading-none text-umber">
        Free trial — {dayLabel} remaining
      </p>
      <Link
        href="/subscription"
        className="shrink-0 text-[12px] font-light text-gold-readable transition hover:text-gold"
      >
        Subscribe →
      </Link>
    </div>
  );
}
