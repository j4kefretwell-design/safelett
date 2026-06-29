import { btnGoldClassName, cardClassName, mutedTextClassName, sectionTitleClassName } from "@/lib/ui";

export default function SettingsSubscription() {
  return (
    <section className={`${cardClassName} p-8`}>
      <h2 className={sectionTitleClassName}>Subscription Plan</h2>
      <p className={`${mutedTextClassName} mt-1`}>
        Manage your SafeLett subscription.
      </p>

      <div className="mt-6 rounded-sm border border-border bg-off-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-gold">
              Current Plan
            </p>
            <p className="mt-2 font-serif text-2xl font-medium text-charcoal">
              Starter Plan
            </p>
            <p className={`${mutedTextClassName} mt-2`}>
              Core compliance tracking for your property portfolio.
            </p>
          </div>
          <button type="button" className={btnGoldClassName} disabled>
            Upgrade (Coming Soon)
          </button>
        </div>
      </div>
    </section>
  );
}
