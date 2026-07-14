import {
  CERTIFICATE_LABELS,
  type Certificate,
  type Property,
} from "@/lib/types";
import { getDaysUntilExpiry, getPropertyStatus } from "@/lib/compliance";
import {
  getDaysUntilDate,
  getTenancyStatus,
  isDepositProtectionOverdue,
  type Tenancy,
} from "@/lib/tenancy";

/** Overview only surfaces items overdue or due within this window. */
const IMMEDIATE_DAYS = 7;

export type OverviewActionModule = "compliance" | "tenancy";

export interface OverviewActionItem {
  id: string;
  module: OverviewActionModule;
  address: string;
  /** Certificate or tenancy type shown beneath the address */
  typeLabel: string;
  /** What needs doing — short italic status */
  actionLabel: string;
  detail: string;
  daysRemaining: number;
  href: string;
}

export interface OverviewStats {
  totalProperties: number;
  totalTenancies: number;
  activeTenancies: number;
  expiringThisMonth: number;
  overdueItems: number;
  complianceExpiringSoon: number;
  complianceNeedsAttention: number;
  tenancyRenewalsDue: number;
  urgentCount: number;
  attentionCount: number;
  immediateComplianceCount: number;
  immediateTenancyCount: number;
}

function isImmediate(daysRemaining: number) {
  return daysRemaining < 0 || daysRemaining <= IMMEDIATE_DAYS;
}

function isSameCalendarMonth(dateString: string, reference = new Date()): boolean {
  const date = new Date(`${dateString}T12:00:00`);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  );
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
} {
  const propertyById = new Map(properties.map((property) => [property.id, property]));

  const actions: OverviewActionItem[] = [];

  for (const certificate of certificates) {
    const property = propertyById.get(certificate.property_id);
    if (!property) continue;

    const days = getDaysUntilExpiry(certificate.expiry_date);
    if (!isImmediate(days)) continue;

    const label =
      CERTIFICATE_LABELS[certificate.certificate_type] ??
      certificate.certificate_type;

    actions.push({
      id: `cert-${certificate.id}`,
      module: "compliance",
      address: property.address,
      typeLabel: label,
      actionLabel: days < 0 ? "Certificate overdue" : "Certificate expiring",
      detail:
        days < 0
          ? `${label} overdue`
          : `${label} expires in ${days} day${days === 1 ? "" : "s"}`,
      daysRemaining: days,
      href: `/properties/${property.id}`,
    });
  }

  for (const tenancy of tenancies) {
    const daysUntilEnd = getDaysUntilDate(tenancy.end_date);

    if (isImmediate(daysUntilEnd)) {
      actions.push({
        id: `tenancy-end-${tenancy.id}`,
        module: "tenancy",
        address: tenancy.property_address,
        typeLabel: tenancy.tenant_names,
        actionLabel: daysUntilEnd < 0 ? "Tenancy ended" : "Renewal due",
        detail:
          daysUntilEnd < 0
            ? `Tenancy ended (${tenancy.tenant_names})`
            : `Renewal due — ${tenancy.tenant_names}`,
        daysRemaining: daysUntilEnd,
        href: `/tenancy/${tenancy.id}`,
      });
    }

    if (tenancy.rent_review_date) {
      const daysUntilReview = getDaysUntilDate(tenancy.rent_review_date);
      if (daysUntilReview >= 0 && daysUntilReview <= IMMEDIATE_DAYS) {
        actions.push({
          id: `rent-review-${tenancy.id}`,
          module: "tenancy",
          address: tenancy.property_address,
          typeLabel: tenancy.tenant_names,
          actionLabel: "Rent review due",
          detail: `Rent review in ${daysUntilReview} day${
            daysUntilReview === 1 ? "" : "s"
          } — ${tenancy.tenant_names}`,
          daysRemaining: daysUntilReview,
          href: `/tenancy/${tenancy.id}`,
        });
      }
    }

    if (isDepositProtectionOverdue(tenancy)) {
      actions.push({
        id: `deposit-${tenancy.id}`,
        module: "tenancy",
        address: tenancy.property_address,
        typeLabel: tenancy.tenant_names,
        actionLabel: "Deposit unprotected",
        detail: `Deposit unprotected — ${tenancy.tenant_names}`,
        daysRemaining: Math.min(daysUntilEnd, 0),
        href: `/tenancy/${tenancy.id}`,
      });
    }
  }

  actions.sort((a, b) => a.daysRemaining - b.daysRemaining);
  const urgentCount = actions.length;
  const immediateComplianceCount = actions.filter(
    (item) => item.module === "compliance"
  ).length;
  const immediateTenancyCount = actions.filter(
    (item) => item.module === "tenancy"
  ).length;

  const complianceNeedsAttention = properties.filter((property) => {
    const certs = certificates.filter(
      (certificate) => certificate.property_id === property.id
    );
    const status = getPropertyStatus(certs);
    return status === "amber" || status === "red";
  }).length;

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
    (tenancy) =>
      getDaysUntilDate(tenancy.end_date) < 0 || isDepositProtectionOverdue(tenancy)
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

  return {
    stats: {
      totalProperties: properties.length,
      totalTenancies: tenancies.length,
      activeTenancies,
      expiringThisMonth: certsExpiringThisMonth + tenancyDatesThisMonth,
      overdueItems: overdueCertificates + overdueTenancies,
      complianceExpiringSoon,
      complianceNeedsAttention,
      tenancyRenewalsDue,
      urgentCount,
      attentionCount: urgentCount,
      immediateComplianceCount,
      immediateTenancyCount,
    },
    actions,
  };
}
