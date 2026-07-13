import Link from "next/link";
import {
  formatCurrency,
  formatTenancyDate,
  getDaysUntilDate,
  getTenancyStatus,
  isDepositProtectionOverdue,
  TENANCY_TYPE_LABELS,
  type Tenancy,
} from "@/lib/tenancy";
import {
  cardClassName,
  formSectionRuleClassName,
  formSectionTitleClassName,
} from "@/lib/ui";

interface PropertyTenancySummaryProps {
  tenancies: Tenancy[];
}

function pickFeaturedTenancy(tenancies: Tenancy[]): Tenancy | null {
  const eligible = tenancies.filter((tenancy) => {
    const status = getTenancyStatus(tenancy);
    return status === "active" || status === "renewal_due";
  });

  if (eligible.length === 0) return null;

  const ranked = [...eligible].sort((a, b) => {
    const statusRank = (tenancy: Tenancy) =>
      getTenancyStatus(tenancy) === "active" ? 0 : 1;

    const rankDiff = statusRank(a) - statusRank(b);
    if (rankDiff !== 0) return rankDiff;
    return getDaysUntilDate(a.end_date) - getDaysUntilDate(b.end_date);
  });

  return ranked[0] ?? null;
}

export default function PropertyTenancySummary({
  tenancies,
}: PropertyTenancySummaryProps) {
  const featured = pickFeaturedTenancy(tenancies);

  return (
    <section className="mt-14">
      <h2 className={formSectionTitleClassName}>Tenancy</h2>
      <div className={formSectionRuleClassName} />

      {!featured ? (
        <div className={`${cardClassName} mt-8 px-6 py-8 sm:px-8`}>
          <p className="text-sm font-light leading-relaxed text-leather">
            No active tenancy recorded
          </p>
          <Link
            href="/tenancy/new"
            className="mt-4 inline-block text-sm font-normal tracking-wide text-gold-readable transition hover:text-gold"
          >
            Add Tenancy →
          </Link>
        </div>
      ) : (
        <div
          className={`${cardClassName} mt-8 border-l-[3px] border-l-navy px-6 py-7 sm:px-8`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-navy">
                Linked Tenancy
              </p>
              <h3 className="mt-3 font-serif text-xl tracking-wide text-text">
                {featured.tenant_names}
              </h3>
              <p className="mt-1 text-sm text-leather">
                {TENANCY_TYPE_LABELS[featured.tenancy_type]}
              </p>
            </div>
            <Link
              href={`/tenancy/${featured.id}`}
              className="text-sm font-normal tracking-wide text-gold-readable transition hover:text-gold"
            >
              View Full Tenancy →
            </Link>
          </div>

          <dl className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-leather">
                Tenancy Period
              </dt>
              <dd className="mt-1.5 text-sm text-text">
                {formatTenancyDate(featured.start_date)} —{" "}
                {formatTenancyDate(featured.end_date)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-leather">
                Monthly Rent
              </dt>
              <dd className="mt-1.5 font-serif text-lg text-text">
                {formatCurrency(Number(featured.monthly_rent))}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-leather">
                Days Until Renewal
              </dt>
              <dd className="mt-1.5 text-sm text-text">
                {(() => {
                  const days = getDaysUntilDate(featured.end_date);
                  if (days < 0) return `${Math.abs(days)} days overdue`;
                  if (days === 0) return "Due today";
                  return `${days} days`;
                })()}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-leather">
                Deposit Protection
              </dt>
              <dd
                className={`mt-1.5 text-sm ${
                  isDepositProtectionOverdue(featured)
                    ? "text-urgent"
                    : "text-compliant"
                }`}
              >
                {featured.deposit_scheme === "none" || !featured.deposit_amount
                  ? "Not applicable"
                  : isDepositProtectionOverdue(featured)
                    ? "Unprotected"
                    : featured.deposit_protection_date
                      ? "Protected"
                      : "Unprotected"}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
