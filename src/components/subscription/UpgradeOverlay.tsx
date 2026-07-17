"use client";

import Link from "next/link";

interface UpgradeOverlayProps {
  title: string;
  message: string;
  onDismiss: () => void;
}

export default function UpgradeOverlay({
  title,
  message,
  onDismiss,
}: UpgradeOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#252525]/55 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
    >
      <div className="w-full max-w-lg border border-gold/50 bg-[#443A35] px-7 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:px-12 sm:py-12">
        <div className="mx-auto h-px w-12 bg-gold" aria-hidden="true" />
        <h2
          id="upgrade-title"
          className="mt-7 font-display text-3xl leading-tight tracking-wide text-dusty-cream sm:text-4xl"
        >
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-sm text-sm font-light leading-relaxed text-dusty-cream/80 sm:text-base">
          {message}
        </p>
        <Link
          href="/subscription"
          className="mt-8 inline-flex min-h-12 items-center justify-center bg-gold px-8 py-3 text-sm font-normal uppercase tracking-[0.14em] text-[#252525] transition hover:bg-[#D2B86D]"
        >
          Upgrade Now →
        </Link>
        <button
          type="button"
          onClick={onDismiss}
          className="mx-auto mt-5 block min-h-11 px-4 text-xs font-light uppercase tracking-[0.14em] text-dusty-cream/65 transition hover:text-dusty-cream"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
