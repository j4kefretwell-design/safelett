import { formatDate } from "@/lib/compliance";
import {
  getCertificateDateLabels,
  type CertificateType,
} from "@/lib/types";

export interface ContractorEmailDraft {
  toName: string;
  toEmail: string;
  subject: string;
  body: string;
}

export function isCertificateEligibleForContractorEmail(
  daysUntilExpiry: number
): boolean {
  return daysUntilExpiry <= 60;
}

function subtractDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - days);

  const formatted = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  return formatDate(formatted);
}

function getCertificateFullName(certificateType: CertificateType): string {
  const names: Record<CertificateType, string> = {
    gas_safety: "Gas Safety Certificate",
    eicr: "Electrical Installation Condition Report (EICR)",
    epc: "Energy Performance Certificate (EPC)",
    fire_risk_assessment: "Fire Risk Assessment",
    fire_alarm_test: "Fire Alarm Test Certificate",
    emergency_lighting_check: "Emergency Lighting Check",
    fire_extinguisher_service: "Fire Extinguisher Service",
    deposit_protection: "Deposit Protection Certificate",
    right_to_rent: "Right to Rent Check",
    hmo_licence: "HMO Licence",
    legionella_risk_assessment: "Legionella Risk Assessment",
    pat: "Portable Appliance Testing (PAT)",
    asbestos_survey: "Asbestos Survey",
  };

  return names[certificateType];
}

function getWorkDescription(certificateType: CertificateType): string {
  const descriptions: Record<CertificateType, string> = {
    gas_safety: "Gas Safety inspection",
    eicr: "EICR inspection",
    epc: "EPC assessment",
    fire_risk_assessment: "Fire Risk Assessment review",
    fire_alarm_test: "fire alarm test",
    emergency_lighting_check: "emergency lighting check",
    fire_extinguisher_service: "fire extinguisher service",
    deposit_protection: "deposit protection renewal",
    right_to_rent: "Right to Rent check",
    hmo_licence: "HMO licence renewal",
    legionella_risk_assessment: "Legionella Risk Assessment",
    pat: "Portable Appliance Testing (PAT)",
    asbestos_survey: "asbestos survey",
  };

  return descriptions[certificateType];
}

export function buildContractorEmailDraft({
  contractorName,
  contractorEmail,
  certificateType,
  propertyAddress,
  expiryDate,
  userName,
}: {
  contractorName: string;
  contractorEmail: string;
  certificateType: CertificateType;
  propertyAddress: string;
  expiryDate: string;
  userName: string;
}): ContractorEmailDraft {
  const certificateFullName = getCertificateFullName(certificateType);
  const workDescription = getWorkDescription(certificateType);
  const formattedExpiry = formatDate(expiryDate);
  const completionDeadline = subtractDays(expiryDate, 7);
  const expiryLabel = getCertificateDateLabels(certificateType).expiry;

  const body = `Dear ${contractorName},

I am writing to arrange a ${workDescription} at the below property. The current ${certificateFullName} is due to expire on ${formattedExpiry} and we require renewal before this date to maintain compliance.

Property: ${propertyAddress}
Certificate Required: ${certificateFullName}
${expiryLabel}: ${formattedExpiry}
Completion Required By: ${completionDeadline}

Please could you confirm your availability and proposed date for carrying out this work. If you have any questions regarding access or the property, please do not hesitate to get in touch.

Kind regards,
${userName}
Fretwell & Co`;

  return {
    toName: contractorName,
    toEmail: contractorEmail,
    subject: `${certificateFullName} Renewal Required — ${propertyAddress}`,
    body,
  };
}

export function formatEmailForCopy(draft: ContractorEmailDraft): string {
  return `To: ${draft.toName} <${draft.toEmail}>
Subject: ${draft.subject}

${draft.body}`;
}

export function buildMailtoUrl(draft: ContractorEmailDraft): string {
  const params = new URLSearchParams({
    subject: draft.subject,
    body: draft.body,
  });

  return `mailto:${draft.toEmail}?${params.toString()}`;
}

export function buildGmailComposeUrl(draft: ContractorEmailDraft): string {
  const params = new URLSearchParams({
    view: "cm",
    to: draft.toEmail,
    su: draft.subject,
    body: draft.body,
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function resolveUserDisplayName(
  fullName: string | null | undefined,
  fallback = "Property Manager"
): string {
  const trimmed = fullName?.trim();
  return trimmed || fallback;
}
