import { formatDate } from "@/lib/compliance";
import { CERTIFICATE_LABELS, type CertificateType } from "@/lib/types";

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

function getInspectionLabel(certificateType: CertificateType): string {
  return CERTIFICATE_LABELS[certificateType];
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
  const certificateLabel = getInspectionLabel(certificateType);
  const formattedExpiry = formatDate(expiryDate);
  const completionDeadline = subtractDays(expiryDate, 7);

  const body = `Dear ${contractorName},

I hope this finds you well. I am writing to arrange a ${certificateLabel} inspection at the above property.

The current certificate expires on ${formattedExpiry} and we are required to ensure renewal is completed before this date.

Could you please confirm your availability to carry out this inspection at ${propertyAddress}? We would appreciate completion no later than ${completionDeadline}.

Please do not hesitate to contact me should you require any further information.

Kind regards,
${userName}
Fretwell & Co`;

  return {
    toName: contractorName,
    toEmail: contractorEmail,
    subject: `Compliance Inspection Required — ${propertyAddress}`,
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

export function resolveUserDisplayName(
  fullName: string | null | undefined,
  fallback = "Property Manager"
): string {
  const trimmed = fullName?.trim();
  return trimmed || fallback;
}
