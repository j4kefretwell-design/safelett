import {
  getCertificateStatus,
  getDaysUntilExpiry,
  getPropertyStatus,
} from "@/lib/compliance";
import {
  CERTIFICATE_LABELS,
  type Certificate,
  type CertificateType,
  type Property,
  type PropertyType,
} from "@/lib/types";
import {
  getDaysUntilDate,
  isDepositProtectionOverdue,
  type Tenancy,
} from "@/lib/tenancy";

const CORE_CERTIFICATES: Record<PropertyType, CertificateType[]> = {
  standard_rental: ["gas_safety", "eicr", "epc"],
  hmo: [
    "gas_safety",
    "eicr",
    "epc",
    "fire_risk_assessment",
    "hmo_licence",
    "fire_alarm_test",
  ],
  student_let: ["gas_safety", "eicr", "epc", "pat"],
};

export interface ExpiringCertificateItem {
  certificateId: string;
  propertyId: string;
  propertyAddress: string;
  certificateType: CertificateType;
  certificateLabel: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: "green" | "amber" | "red";
}

export interface RenewalTenancyItem {
  tenancyId: string;
  tenantNames: string;
  propertyAddress: string;
  endDate: string;
  daysUntilEnd: number;
}

export interface UnprotectedDepositItem {
  tenancyId: string;
  tenantNames: string;
  propertyAddress: string;
  depositAmount: number | null;
  reason: string;
}

export interface MissingCertificateItem {
  propertyId: string;
  propertyAddress: string;
  certificateType: CertificateType;
  certificateLabel: string;
}

export interface AssistantInsightData {
  expiringThisMonth: ExpiringCertificateItem[];
  renewalsIn60Days: RenewalTenancyItem[];
  unprotectedDeposits: UnprotectedDepositItem[];
  overdueCertificates: ExpiringCertificateItem[];
  missingCertificates: MissingCertificateItem[];
  compliantPropertyCount: number;
  totalProperties: number;
}

function isSameCalendarMonth(dateString: string, reference = new Date()): boolean {
  const date = new Date(dateString);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  );
}

export function buildAssistantInsights({
  properties,
  certificates,
  tenancies,
}: {
  properties: Property[];
  certificates: Certificate[];
  tenancies: Tenancy[];
}): AssistantInsightData {
  const certificatesByProperty = new Map<string, Certificate[]>();
  for (const certificate of certificates) {
    const existing = certificatesByProperty.get(certificate.property_id) ?? [];
    existing.push(certificate);
    certificatesByProperty.set(certificate.property_id, existing);
  }

  const expiringThisMonth: ExpiringCertificateItem[] = [];
  const overdueCertificates: ExpiringCertificateItem[] = [];

  for (const certificate of certificates) {
    const property = properties.find((item) => item.id === certificate.property_id);
    if (!property) continue;

    const daysUntilExpiry = getDaysUntilExpiry(certificate.expiry_date);
    const item: ExpiringCertificateItem = {
      certificateId: certificate.id,
      propertyId: property.id,
      propertyAddress: property.address,
      certificateType: certificate.certificate_type,
      certificateLabel:
        CERTIFICATE_LABELS[certificate.certificate_type] ??
        certificate.certificate_type,
      expiryDate: certificate.expiry_date,
      daysUntilExpiry,
      status: getCertificateStatus(certificate.expiry_date),
    };

    if (daysUntilExpiry < 0) {
      overdueCertificates.push(item);
    }

    if (daysUntilExpiry >= 0 && isSameCalendarMonth(certificate.expiry_date)) {
      expiringThisMonth.push(item);
    }
  }

  expiringThisMonth.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  overdueCertificates.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  const renewalsIn60Days: RenewalTenancyItem[] = tenancies
    .filter((tenancy) => {
      const daysUntilEnd = getDaysUntilDate(tenancy.end_date);
      return daysUntilEnd >= 0 && daysUntilEnd <= 60;
    })
    .map((tenancy) => ({
      tenancyId: tenancy.id,
      tenantNames: tenancy.tenant_names,
      propertyAddress: tenancy.property_address,
      endDate: tenancy.end_date,
      daysUntilEnd: getDaysUntilDate(tenancy.end_date),
    }))
    .sort((a, b) => a.daysUntilEnd - b.daysUntilEnd);

  const unprotectedDeposits: UnprotectedDepositItem[] = [];
  for (const tenancy of tenancies) {
    if (tenancy.deposit_amount == null || tenancy.deposit_amount <= 0) {
      continue;
    }

    if (tenancy.deposit_scheme === "none") {
      unprotectedDeposits.push({
        tenancyId: tenancy.id,
        tenantNames: tenancy.tenant_names,
        propertyAddress: tenancy.property_address,
        depositAmount: tenancy.deposit_amount,
        reason: "Deposit scheme recorded as none",
      });
      continue;
    }

    if (isDepositProtectionOverdue(tenancy)) {
      unprotectedDeposits.push({
        tenancyId: tenancy.id,
        tenantNames: tenancy.tenant_names,
        propertyAddress: tenancy.property_address,
        depositAmount: tenancy.deposit_amount,
        reason: "Deposit protection appears overdue or incomplete",
      });
    }
  }

  const missingCertificates: MissingCertificateItem[] = [];
  let compliantPropertyCount = 0;

  for (const property of properties) {
    const certs = certificatesByProperty.get(property.id) ?? [];
    const status = getPropertyStatus(certs);
    if (status === "green" && certs.length > 0) {
      compliantPropertyCount += 1;
    }

    const expected = CORE_CERTIFICATES[property.property_type] ?? CORE_CERTIFICATES.standard_rental;
    const present = new Set(certs.map((certificate) => certificate.certificate_type));

    for (const certificateType of expected) {
      if (!present.has(certificateType)) {
        missingCertificates.push({
          propertyId: property.id,
          propertyAddress: property.address,
          certificateType,
          certificateLabel: CERTIFICATE_LABELS[certificateType],
        });
      }
    }
  }

  return {
    expiringThisMonth,
    renewalsIn60Days,
    unprotectedDeposits,
    overdueCertificates,
    missingCertificates,
    compliantPropertyCount,
    totalProperties: properties.length,
  };
}

export type SmartSuggestionKind =
  | "expiring_certificates"
  | "renewals"
  | "unprotected_deposits";

export interface SmartSuggestion {
  id: SmartSuggestionKind;
  text: string;
  href: string;
}

export function buildSmartSuggestions(
  insights: AssistantInsightData
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];

  const expiringCount = insights.expiringThisMonth.length;
  if (expiringCount > 0) {
    suggestions.push({
      id: "expiring_certificates",
      text: `You have ${expiringCount} certificate${expiringCount === 1 ? "" : "s"} expiring this month — draft contractor emails?`,
      href: "/reminders",
    });
  }

  const renewalCount = insights.renewalsIn60Days.length;
  if (renewalCount > 0) {
    suggestions.push({
      id: "renewals",
      text: `${renewalCount} tenanc${renewalCount === 1 ? "y is" : "ies are"} up for renewal in 60 days — draft renewal offers?`,
      href: "/assistant/draft?type=renewal_offer",
    });
  }

  const depositCount = insights.unprotectedDeposits.length;
  if (depositCount > 0) {
    suggestions.push({
      id: "unprotected_deposits",
      text: `${depositCount} deposit${depositCount === 1 ? "" : "s"} may be unprotected — view details?`,
      href: "/tenancy/dashboard",
    });
  }

  return suggestions;
}

export function formatInsightsForCompliancePrompt(
  insights: AssistantInsightData
): string {
  const lines: string[] = [
    `Total properties: ${insights.totalProperties}`,
    `Fully compliant properties (all recorded certificates green): ${insights.compliantPropertyCount}`,
    "",
    "=== OVERDUE CERTIFICATES ===",
  ];

  if (insights.overdueCertificates.length === 0) {
    lines.push("None.");
  } else {
    for (const item of insights.overdueCertificates) {
      lines.push(
        `- ${item.certificateLabel} at ${item.propertyAddress} expired ${item.expiryDate} (${Math.abs(item.daysUntilExpiry)} days overdue)`
      );
    }
  }

  lines.push("", "=== EXPIRING THIS MONTH ===");
  if (insights.expiringThisMonth.length === 0) {
    lines.push("None.");
  } else {
    for (const item of insights.expiringThisMonth) {
      lines.push(
        `- ${item.certificateLabel} at ${item.propertyAddress} expires ${item.expiryDate} (${item.daysUntilExpiry} days)`
      );
    }
  }

  lines.push("", "=== MISSING CORE CERTIFICATES ===");
  if (insights.missingCertificates.length === 0) {
    lines.push("None detected against core expected set.");
  } else {
    for (const item of insights.missingCertificates) {
      lines.push(
        `- ${item.certificateLabel} not recorded for ${item.propertyAddress}`
      );
    }
  }

  lines.push("", "=== TENANCIES RENEWAL WITHIN 60 DAYS ===");
  if (insights.renewalsIn60Days.length === 0) {
    lines.push("None.");
  } else {
    for (const item of insights.renewalsIn60Days) {
      lines.push(
        `- ${item.tenantNames} at ${item.propertyAddress} ends ${item.endDate} (${item.daysUntilEnd} days)`
      );
    }
  }

  lines.push("", "=== POSSIBLE UNPROTECTED DEPOSITS ===");
  if (insights.unprotectedDeposits.length === 0) {
    lines.push("None.");
  } else {
    for (const item of insights.unprotectedDeposits) {
      lines.push(
        `- ${item.tenantNames} at ${item.propertyAddress}: ${item.reason}${
          item.depositAmount != null ? ` (£${item.depositAmount})` : ""
        }`
      );
    }
  }

  return lines.join("\n");
}
