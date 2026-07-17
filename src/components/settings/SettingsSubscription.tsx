"use client";

import { useState } from "react";
import Link from "next/link";
import SettingsSection from "@/components/settings/SettingsSection";

export default function SettingsSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to open billing portal.");
      }
      window.location.href = data.url;
    } catch (portalError) {
      setError(
        portalError instanceof Error
          ? portalError.message
          : "Unable to open billing portal."
      );
      setLoading(false);
    }
  }

  return (
    <SettingsSection
      id="subscription"
      label="Subscription"
      title="Membership"
      description="Your Fretwell & Co subscription."
    >
      <div className="border border-taupe bg-dune p-10">
        <p className="text-[9px] font-normal uppercase tracking-[0.32em] text-gold">
          Current Plan
        </p>
        <p className="mt-4 font-serif text-3xl tracking-wide text-text">
          Manage billing in Stripe
        </p>

        <p className="mt-8 text-sm font-light leading-relaxed text-leather">
          Update your payment method, change plans, or cancel from the customer
          portal. Or choose a plan on the subscription page.
        </p>

        {error ? (
          <p className="mt-6 text-sm text-urgent">{error}</p>
        ) : null}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void openPortal()}
            disabled={loading}
            className="border border-gold/50 px-8 py-3.5 text-[10px] font-normal uppercase tracking-[0.14em] text-gold transition hover:border-gold disabled:opacity-50"
          >
            {loading ? "Opening…" : "Manage billing"}
          </button>
          <Link
            href="/subscription"
            className="inline-flex items-center justify-center bg-raspberry px-8 py-3.5 text-[10px] font-normal uppercase tracking-[0.14em] text-dusty-cream transition hover:bg-raspberry-dark"
          >
            View plans
          </Link>
        </div>
      </div>
    </SettingsSection>
  );
}
