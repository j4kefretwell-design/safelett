import SettingsSection from "@/components/settings/SettingsSection";
import { goldLabelClassName, mutedTextClassName } from "@/lib/ui";
import { BRAND_NAME } from "@/lib/brand";

export default function SettingsSubscription() {
  return (
    <SettingsSection
      title="Subscription"
      description={`Manage your ${BRAND_NAME} subscription.`}
    >
      <div className="max-w-md border border-cocoa/20 bg-beige px-8 py-8">
        <p className={goldLabelClassName}>Current Plan</p>
        <p className="mt-4 font-serif text-3xl tracking-wide text-text">£49</p>
        <p className="mt-1 text-sm font-light text-cocoa">per month</p>
        <p className={`${mutedTextClassName} mt-5`}>
          Full access to compliance tracking, alerts, document storage, and
          contractor contacts across your portfolio.
        </p>
      </div>
    </SettingsSection>
  );
}
