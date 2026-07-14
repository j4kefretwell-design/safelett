"use client";

import Link from "next/link";
import {
  formatCurrency,
  formatTenancyDate,
  getDaysUntilDate,
  TENANCY_STATUS_LABELS,
  type Tenancy,
  type TenancyStatus,
} from "@/lib/tenancy";

interface TenancyCardProps {
  tenancy: Tenancy;
  status: TenancyStatus;
}

const statusTextClasses: Record<TenancyStatus, string> = {
  active: "text-compliant",
  renewal_due: "text-attention",
  expired: "text-urgent",
};

export default function TenancyCard({ tenancy, status }: TenancyCardProps) {
  const daysRemaining = getDaysUntilDate(tenancy.end_date);

  return (
    <Link
      href={`/tenancy/${tenancy.id}`}
      className="group tenancy-card flex h-full min-h-[220px] flex-col justify-between border-l-[3px] border-l-steel p-6 transition duration-200 hover:border-navy sm:min-h-[260px] sm:p-8"
    >
      <div>
        <h3 className="font-serif text-lg leading-snug tracking-wide text-tenancy-text transition group-hover:text-navy sm:text-xl lg:text-2xl">
          {tenancy.tenant_names}
        </h3>
        <p className="mt-3 text-sm font-light leading-relaxed text-steel">
          {tenancy.property_address}
        </p>
        <p className="mt-4 text-xs font-normal uppercase tracking-[0.12em] text-steel/80">
          Ends {formatTenancyDate(tenancy.end_date)}
          {daysRemaining >= 0
            ? ` · ${daysRemaining} days remaining`
            : ` · ${Math.abs(daysRemaining)} days overdue`}
        </p>
        <p className="mt-2 font-serif text-lg tracking-wide text-tenancy-text">
          {formatCurrency(Number(tenancy.monthly_rent))}
          <span className="text-sm font-sans font-light text-steel"> / month</span>
        </p>
      </div>
      <p
        className={`text-xs font-normal uppercase tracking-[0.14em] ${statusTextClasses[status]}`}
      >
        {TENANCY_STATUS_LABELS[status]}
      </p>
    </Link>
  );
}
