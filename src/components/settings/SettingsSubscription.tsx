import SettingsSection from "@/components/settings/SettingsSection";
import { mutedTextClassName } from "@/lib/ui";

export default function SettingsSubscription() {
  return (
    <SettingsSection
      title="Subscription"
      description="Your current membership plan."
    >
      <div className="max-w-md bg-raspberry px-10 py-10 text-dusty-cream">
        <p className="font-serif text-2xl tracking-wide">Starter Plan</p>
        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-serif text-5xl tracking-wide">£49</span>
          <span className="text-sm font-light text-dusty-cream/70">/ month</span>
        </div>
        <p className={`${mutedTextClassName} mt-6 text-dusty-cream/65`}>
          Full access to compliance tracking, alerts, document storage, and
          contractor contacts across your portfolio.
        </p>
        <button
          type="button"
          className="mt-8 border border-dusty-cream/40 px-6 py-3 text-xs font-normal uppercase tracking-[0.12em] text-dusty-cream transition hover:border-dusty-cream hover:bg-dusty-cream/5"
        >
          Upgrade
        </button>
      </div>
    </SettingsSection>
  );
}
