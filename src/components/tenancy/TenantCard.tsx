import Link from "next/link";
import {
  getTenantStatus,
  getTenantTenancyTypeLabel,
  TENANT_STATUS_LABELS,
  type Tenant,
  type TenantStatus,
} from "@/lib/tenants";
import { formatTenancyDate, type Tenancy } from "@/lib/tenancy";

interface TenantCardProps {
  tenant: Tenant;
  propertyAddress: string | null;
  tenancy: Tenancy | null;
}

const statusTextClasses: Record<TenantStatus, string> = {
  active: "text-compliant",
  renewal_due: "text-attention",
  expired: "text-urgent",
  unlinked: "text-steel",
};

export default function TenantCard({
  tenant,
  propertyAddress,
  tenancy,
}: TenantCardProps) {
  const status = getTenantStatus(tenancy);

  return (
    <Link
      href={`/tenancy/tenants/${tenant.id}`}
      className="group tenancy-card flex h-full min-h-[200px] flex-col justify-between border-l-[3px] border-l-steel p-6 transition duration-200 hover:border-navy sm:min-h-[220px] sm:p-8"
    >
      <div>
        <h3 className="font-serif text-lg leading-snug tracking-wide text-tenancy-text transition group-hover:text-navy sm:text-xl">
          {tenant.full_name}
        </h3>
        <p className="mt-3 text-sm font-light leading-relaxed text-steel">
          {propertyAddress ?? tenancy?.property_address ?? "No property linked"}
        </p>
        <p className="mt-4 text-xs font-normal uppercase tracking-[0.12em] text-steel/80">
          {getTenantTenancyTypeLabel(tenancy)}
        </p>
        {tenant.move_in_date ? (
          <p className="mt-2 text-sm font-light text-steel">
            Moved in {formatTenancyDate(tenant.move_in_date)}
          </p>
        ) : null}
      </div>
      <p
        className={`mt-6 text-xs font-normal uppercase tracking-[0.14em] ${statusTextClasses[status]}`}
      >
        {TENANT_STATUS_LABELS[status]}
      </p>
    </Link>
  );
}
