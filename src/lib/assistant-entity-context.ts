import {
  CERTIFICATE_LABELS,
  PROPERTY_TYPE_LABELS,
  type Certificate,
  type Property,
} from "@/lib/types";
import {
  DEPOSIT_SCHEME_LABELS,
  TENANCY_TYPE_LABELS,
  formatCurrency,
  getDaysUntilDate,
  getTenancyStatus,
  isDepositProtectionOverdue,
  TENANCY_STATUS_LABELS,
  type Tenancy,
} from "@/lib/tenancy";
import {
  getCertificateStatus,
  getDaysUntilExpiry,
  getPropertyStatus,
  getStatusLabel,
} from "@/lib/compliance";

export function buildTenancyReviewContext(
  tenancy: Tenancy,
  property: Property | null,
  certificates: Certificate[]
): string {
  const status = getTenancyStatus(tenancy);
  const daysUntilEnd = getDaysUntilDate(tenancy.end_date);
  const depositConcern =
    (tenancy.deposit_amount != null &&
      tenancy.deposit_amount > 0 &&
      tenancy.deposit_scheme === "none") ||
    isDepositProtectionOverdue(tenancy);

  const certLines =
    certificates.length === 0
      ? "No certificates recorded for the linked property."
      : certificates
          .map((certificate) => {
            const label =
              CERTIFICATE_LABELS[certificate.certificate_type] ??
              certificate.certificate_type;
            return `${label} expires ${certificate.expiry_date} (${getDaysUntilExpiry(certificate.expiry_date)} days, ${getCertificateStatus(certificate.expiry_date)})`;
          })
          .join("\n");

  return [
    `Tenancy review data for ${tenancy.tenant_names} at ${tenancy.property_address}`,
    `Status: ${TENANCY_STATUS_LABELS[status]}`,
    `Type: ${TENANCY_TYPE_LABELS[tenancy.tenancy_type]}`,
    `Start date: ${tenancy.start_date}`,
    `End date: ${tenancy.end_date} (${daysUntilEnd} days)`,
    `Monthly rent: ${formatCurrency(tenancy.monthly_rent)}`,
    `Rent review date: ${tenancy.rent_review_date ?? "not set"}`,
    `Deposit amount: ${
      tenancy.deposit_amount != null
        ? formatCurrency(tenancy.deposit_amount)
        : "not set"
    }`,
    `Deposit scheme: ${
      tenancy.deposit_scheme
        ? DEPOSIT_SCHEME_LABELS[tenancy.deposit_scheme]
        : "unknown"
    }`,
    `Deposit reference: ${tenancy.deposit_reference ?? "not set"}`,
    `Deposit protection date: ${tenancy.deposit_protection_date ?? "not set"}`,
    `Deposit protection concern: ${depositConcern ? "yes" : "no"}`,
    `Right to rent checked: ${tenancy.right_to_rent_checked ? "yes" : "no"}`,
    `Right to rent expiry: ${tenancy.right_to_rent_expiry ?? "not set"}`,
    property
      ? `Linked property: ${property.address} (${PROPERTY_TYPE_LABELS[property.property_type]})`
      : "Linked property: none",
    "",
    "Property certificates:",
    certLines,
  ].join("\n");
}

export function buildPropertyReportContext(
  property: Property,
  certificates: Certificate[],
  linkedTenancies: Tenancy[]
): string {
  const status = getPropertyStatus(certificates);
  const certLines =
    certificates.length === 0
      ? "No certificates recorded."
      : certificates
          .map((certificate) => {
            const label =
              CERTIFICATE_LABELS[certificate.certificate_type] ??
              certificate.certificate_type;
            const days = getDaysUntilExpiry(certificate.expiry_date);
            return `${label}: issue ${certificate.issue_date}, expiry ${certificate.expiry_date}, ${days} days, status ${getCertificateStatus(certificate.expiry_date)}`;
          })
          .join("\n");

  const tenancyLines =
    linkedTenancies.length === 0
      ? "No tenancies linked to this property."
      : linkedTenancies
          .map((tenancy) => {
            return `${tenancy.tenant_names}: ${TENANCY_STATUS_LABELS[getTenancyStatus(tenancy)]}, ends ${tenancy.end_date}, rent ${formatCurrency(tenancy.monthly_rent)}`;
          })
          .join("\n");

  return [
    `Property report data for ${property.address}`,
    `Type: ${PROPERTY_TYPE_LABELS[property.property_type]}`,
    `Bedrooms: ${property.bedrooms}`,
    `Overall compliance status from recorded certificates: ${getStatusLabel(status)}`,
    property.notes ? `Notes: ${property.notes}` : null,
    "",
    "Certificates:",
    certLines,
    "",
    "Tenancies:",
    tenancyLines,
  ]
    .filter(Boolean)
    .join("\n");
}
