"use client";

import Link from "next/link";

interface TrialBannerProps {
  daysRemaining: number;
  onDismiss: () => void;
}

export default function TrialBanner({
  daysRemaining,
  onDismiss,
}: TrialBannerProps) {
  if (daysRemaining <= 0) return null;

  const dayLabel = daysRemaining === 1 ? "1 day" : `${daysRemaining} days`;

  return (
    <div className="relative z-20 flex min-h-11 w-full items-center gap-3 bg-white px-4 py-2.5 sm:gap-4 sm:px-6 lg:px-12">
      <p className="min-w-0 flex-1 text-[14px] font-medium leading-snug text-[#60544D]">
        Your free trial ends in {dayLabel}. Subscribe to unlock full access.
      </p>
      <Link
        href="/subscription"
        className="shrink-0 rounded-[6px] border border-[#443A35] bg-[#443A35] px-4 py-[6px] text-[12px] font-medium text-white transition hover:bg-[#252525]"
      >
        Subscribe Now
      </Link>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss trial reminder"
        className="flex h-8 w-8 shrink-0 items-center justify-center text-[#60544D]/70 transition hover:text-[#60544D]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
