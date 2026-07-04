"use client";

import SettingsSection from "@/components/settings/SettingsSection";

export default function SettingsSubscription() {
  return (
    <SettingsSection
      id="subscription"
      label="Subscription"
      title="Membership"
      description="Your Fretwell & Co subscription."
    >
      <div className="relative max-w-lg overflow-hidden border border-gold/35 bg-raspberry p-10 text-dusty-cream shadow-[0_20px_60px_rgba(26,16,8,0.2)]">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 border border-gold/15"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-6 right-6 h-16 w-16 border border-gold/20"
          aria-hidden="true"
        />

        <p className="text-[9px] font-normal uppercase tracking-[0.32em] text-gold/80">
          Current Plan
        </p>
        <p className="mt-4 font-serif text-3xl tracking-wide">Starter Plan</p>

        <div className="mt-8 flex items-baseline gap-2 border-t border-gold/20 pt-8">
          <span className="font-serif text-5xl tracking-wide text-gold">£49</span>
          <span className="text-sm font-light text-dusty-cream/60">/ month</span>
        </div>

        <p className="mt-8 text-sm font-light leading-relaxed text-dusty-cream/65">
          Full access to compliance tracking, automated alerts, secure document
          storage, and contractor contacts across your portfolio.
        </p>

        <button
          type="button"
          className="mt-10 border border-gold/50 px-8 py-3.5 text-[10px] font-normal uppercase tracking-[0.14em] text-gold transition hover:border-gold hover:bg-gold/5"
        >
          Upgrade Membership
        </button>
      </div>
    </SettingsSection>
  );
}
