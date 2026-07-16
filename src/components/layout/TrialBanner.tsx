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
    <div className="relative z-20 flex h-11 w-full items-center justify-between gap-4 bg-raspberry px-4 sm:px-6 lg:px-12">
      <p className="min-w-0 truncate text-[13px] font-light leading-none text-dusty-cream">
        Your free trial ends in {dayLabel}
      </p>
      <Link
        href="/subscription"
        className="shrink-0 rounded-[6px] bg-[#C4A35A] px-[14px] py-1.5 text-[12px] font-normal text-umber transition hover:brightness-105"
      >
        Subscribe Now
      </Link>
    </div>
  );
}
