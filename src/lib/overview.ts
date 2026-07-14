import {
  CERTIFICATE_LABELS,
  type Certificate,
  type Property,
} from "@/lib/types";
import {
  getCertificateStatus,
  getDaysUntilExpiry,
} from "@/lib/compliance";
import {
  getDaysUntilDate,
  getTenancyStatus,
  isDepositProtectionOverdue,
  type Tenancy,
} from "@/lib/tenancy";

export type OverviewActionModule = "compliance" | "tenancy";

export interface OverviewActionItem {
  id: string;
  module: OverviewActionModule;
  address: string;
  detail: string;
  daysRemaining: number;
  href: string;
}

export interface OverviewActivityItem {
  id: string;
  date: string;
  dateLabel: string;
  description: string;
}

export interface OverviewStats {
  totalProperties: number;
  activeTenancies: number;
  expiringThisMonth: number;
  overdueItems: number;
  complianceExpiringSoon: number;
  tenancyRenewalsDue: number;
  attentionCount: number;
}

function isSameCalendarMonth(dateString: string, reference = new Date()): boolean {
  const date = new Date(`${dateString}T12:00:00`);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  );
}

function formatActivityDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function buildOverviewData({
  properties,
  certificates,
  tenancies,
}: {
  properties: Property[];
  certificates: Certificate[];
  tenancies: Tenancy[];
}): {
  stats: OverviewStats;
  actions: OverviewActionItem[];
  activity: OverviewActivityItem[];
} {
  const propertyById = new Map(properties.map((property) => [property.id, property]));

  const actions: OverviewActionItem[] = [];

  for (const certificate of certificates) {
    const property = propertyById.get(certificate.property_id);
    if (!property) continue;

    const days = getDaysUntilExpiry(certificate.expiry_date);
    const status = getCertificateStatus(certificate.expiry_date);
    const label =
      CERTIFICATE_LABELS[certificate.certificate_type] ??
      certificate.certificate_type;

    if (status === "red" || status === "amber") {
      actions.push({
        id: `cert-${certificate.id}`,
        module: "compliance",
        address: property.address,
        detail:
          days < 0
            ? `${label} overdue`
            : `${label} expires in ${days} day${days === 1 ? "" : "s"}`,
        daysRemaining: days,
        href: `/properties/${property.id}`,
      });
    }
  }

  for (const tenancy of tenancies) {
    const daysUntilEnd = getDaysUntilDate(tenancy.end_date);
    const status = getTenancyStatus(tenancy);

    if (status === "expired" || status === "renewal_due") {
      actions.push({
        id: `tenancy-end-${tenancy.id}`,
        module: "tenancy",
        address: tenancy.property_address,
        detail:
          daysUntilEnd < 0
            ? `Tenancy ended (${tenancy.tenant_names})`
            : `Renewal due — ${tenancy.tenant_names}`,
        daysRemaining: daysUntilEnd,
        href: `/tenancy/${tenancy.id}`,
      });
    }

    if (isDepositProtectionOverdue(tenancy)) {
      actions.push({
        id: `deposit-${tenancy.id}`,
        module: "tenancy",
        address: tenancy.property_address,
        detail: `Deposit protection needs attention — ${tenancy.tenant_names}`,
        daysRemaining: Math.min(daysUntilEnd, 0),
        href: `/tenancy/${tenancy.id}`,
      });
    }
  }

  actions.sort((a, b) => a.daysRemaining - b.daysRemaining);

  const certsExpiringThisMonth = certificates.filter((certificate) => {
    const days = getDaysUntilExpiry(certificate.expiry_date);
    return days >= 0 && isSameCalendarMonth(certificate.expiry_date);
  }).length;

  const tenancyDatesThisMonth = tenancies.filter((tenancy) => {
    if (isSameCalendarMonth(tenancy.end_date)) return true;
    if (tenancy.rent_review_date && isSameCalendarMonth(tenancy.rent_review_date)) {
      return true;
    }
    return false;
  }).length;

  const overdueCertificates = certificates.filter(
    (certificate) => getDaysUntilExpiry(certificate.expiry_date) < 0
  ).length;

  const overdueTenancies = tenancies.filter(
    (tenancy) => getDaysUntilDate(tenancy.end_date) < 0 || isDepositProtectionOverdue(tenancy)
  ).length;

  const activeTenancies = tenancies.filter(
    (tenancy) => getTenancyStatus(tenancy) === "active"
  ).length;

  const complianceExpiringSoon = certificates.filter((certificate) => {
    const days = getDaysUntilExpiry(certificate.expiry_date);
    return days >= 0 && days <= 30;
  }).length;

  const tenancyRenewalsDue = tenancies.filter((tenancy) => {
    const status = getTenancyStatus(tenancy);
    return status === "renewal_due" || status === "expired";
  }).length;

  const urgentActions = actions.slice(0, 5);
  const attentionCount = urgentActions.length;

  const activityCandidates: OverviewActivityItem[] = [
    ...properties.map((property) => ({
      id: `property-${property.id}`,
      date: property.created_at,
      dateLabel: formatActivityDate(property.created_at),
      description: `Property added — ${property.address}`,
    })),
    ...certificates.map((certificate) => {
      const property = propertyById.get(certificate.property_id);
      const label =
        CERTIFICATE_LABELS[certificate.certificate_type] ??
        certificate.certificate_type;
      return {
        id: `certificate-${certificate.id}`,
        date: certificate.created_at,
        dateLabel: formatActivityDate(certificate.created_at),
        description: `${label} added${property ? ` — ${property.address}` : ""}`,
      };
    }),
    ...tenancies.map((tenancy) => ({
      id: `tenancy-${tenancy.id}`,
      date: tenancy.created_at,
      dateLabel: formatActivityDate(tenancy.created_at),
      description: `Tenancy created — ${tenancy.tenant_names} at ${tenancy.property_address}`,
    })),
  ]
    .filter((item) => item.date && item.dateLabel)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 5);

  return {
    stats: {
      totalProperties: properties.length,
      activeTenancies,
      expiringThisMonth: certsExpiringThisMonth + tenancyDatesThisMonth,
      overdueItems: overdueCertificates + overdueTenancies,
      complianceExpiringSoon,
      tenancyRenewalsDue,
      attentionCount,
    },
    actions: urgentActions,
    activity: activityCandidates,
  };
}
