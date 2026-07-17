import Link from "next/link";
import {
  formatCurrency,
  formatTenancyDate,
  getDaysUntilDate,
  getTenancyStatus,
  isDepositProtectionOverdue,
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

  return [...eligible].sort(
    (a, b) => getDaysUntilDate(a.end_date) - getDaysUntilDate(b.end_date)
  )[0];
}

function depositLabel(tenancy: Tenancy): string {
  if (tenancy.deposit_scheme === "none" || !tenancy.deposit_amount) {
    return "Not applicable";
  }
  if (isDepositProtectionOverdue(tenancy)) return "Unprotected";
  if (tenancy.deposit_protection_date) return "Protected";
  return "Unprotected";
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
              <h3 className="font-serif text-xl tracking-wide text-heading">
                {featured.tenant_names}
              </h3>
              <p className="mt-2 text-sm text-leather">
                Ends {formatTenancyDate(featured.end_date)} ·{" "}
                {formatCurrency(Number(featured.monthly_rent))}/month
              </p>
              <p
                className={`mt-2 text-sm ${
                  depositLabel(featured) === "Unprotected"
                    ? "text-urgent"
                    : depositLabel(featured) === "Protected"
                      ? "text-compliant"
                      : "text-leather"
                }`}
              >
                Deposit: {depositLabel(featured)}
              </p>
            </div>
            <Link
              href={`/tenancy/${featured.id}`}
              className="text-sm font-normal tracking-wide text-gold-readable transition hover:text-gold"
            >
              View Full Tenancy →
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
