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
      <div className="border border-leather/30 bg-white p-10">
        <p className="text-[9px] font-normal uppercase tracking-[0.32em] text-gold">
          Current Plan
        </p>
        <p className="mt-4 font-serif text-3xl tracking-wide text-text">
          Starter Plan
        </p>

        <div className="mt-8 flex items-baseline gap-2 border-t border-leather/15 pt-8">
          <span className="font-serif text-5xl tracking-wide text-gold">£49</span>
          <span className="text-sm font-light text-leather">/ month</span>
        </div>

        <p className="mt-8 text-sm font-light leading-relaxed text-leather">
          Full access to compliance tracking, automated alerts, secure document
          storage, and contractor contacts across your portfolio.
        </p>

        <button
          type="button"
          className="mt-10 border border-gold/50 px-8 py-3.5 text-[10px] font-normal uppercase tracking-[0.14em] text-gold transition hover:border-gold"
        >
          Upgrade Membership
        </button>
      </div>
    </SettingsSection>
  );
}
