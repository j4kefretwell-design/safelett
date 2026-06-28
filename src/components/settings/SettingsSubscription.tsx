import { btnGoldClassName, cardClassName, sectionTitleClassName } from "@/lib/ui";

export default function SettingsSubscription() {
  return (
    <section className={`${cardClassName} p-8`}>
      <h2 className={sectionTitleClassName}>Subscription Plan</h2>
      <p className="mt-1 text-sm text-mahogany-900/60">
        Manage your SafeLett subscription.
      </p>

      <div className="mt-6 rounded-xl border border-gold/30 bg-cream/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">
              Current Plan
            </p>
            <p className="mt-2 font-serif text-2xl font-semibold text-mahogany-950">
              Starter Plan
            </p>
            <p className="mt-2 text-sm text-mahogany-900/60">
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
