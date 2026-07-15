"use client";

import Link from "next/link";
import BrandWordmark from "@/components/BrandWordmark";
import { useAppMode } from "@/lib/app-mode";

export default function SubscriptionSuccessClient() {
  const { mode } = useAppMode();

  const pageBg =
    mode === "tenancy"
      ? "tenancy-slate-bg"
      : mode === "assistant"
        ? "bg-greige"
        : mode === "overview"
          ? "bg-greige"
          : "dashboard-parchment-bg";

  const panelClass =
    mode === "tenancy"
      ? "border-navy/20 bg-white"
      : mode === "assistant"
        ? "border-olive/30 bg-white"
        : mode === "overview"
          ? "border-umber/15 bg-white"
          : "border-raspberry/20 bg-white";

  const accentRule =
    mode === "tenancy"
      ? "bg-navy"
      : mode === "assistant"
        ? "bg-study"
        : mode === "overview"
          ? "bg-umber"
          : "bg-raspberry";

  const headingClass =
    mode === "tenancy"
      ? "text-tenancy-text"
      : mode === "overview"
        ? "text-umber"
        : "text-text";

  const mutedClass = mode === "tenancy" ? "text-steel" : "text-leather";

  const buttonClass =
    mode === "tenancy"
      ? "bg-navy text-dusty-cream hover:bg-navy-dark"
      : mode === "assistant"
        ? "bg-study text-dusty-cream hover:bg-olive"
        : mode === "overview"
          ? "bg-umber text-dusty-cream hover:bg-umber/90"
          : "bg-raspberry text-dusty-cream hover:bg-raspberry-dark";

  const dashboardHref =
    mode === "tenancy"
      ? "/tenancy/dashboard"
      : mode === "assistant"
        ? "/assistant"
        : mode === "compliance"
          ? "/compliance"
          : "/dashboard";

  return (
    <div
      className={`${pageBg} flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-16`}
    >
      <div className={`w-full max-w-lg border px-8 py-12 text-center sm:px-12 ${panelClass}`}>
        <div className={`mx-auto h-px w-12 ${accentRule}`} aria-hidden />
        <div className="mt-8 flex justify-center">
          <BrandWordmark
            href={dashboardHref}
            variant={mode === "overview" ? "auth" : "card"}
          />
        </div>
        <h1 className={`mt-10 font-serif text-2xl tracking-wide sm:text-3xl ${headingClass}`}>
          Your subscription is active.
        </h1>
        <p className={`mt-4 text-sm font-light leading-relaxed ${mutedClass}`}>
          Welcome to Fretwell &amp; Co.
        </p>
        <Link
          href={dashboardHref}
          className={`mt-10 inline-flex min-h-12 w-full items-center justify-center px-6 text-[11px] font-normal uppercase tracking-[0.14em] transition sm:w-auto ${buttonClass}`}
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
