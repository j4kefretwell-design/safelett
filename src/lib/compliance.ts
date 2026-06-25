import type { ComplianceStatus } from "./types";

export function getCertificateStatus(expiryDate: string): ComplianceStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0 || daysUntilExpiry <= 30) return "red";
  if (daysUntilExpiry <= 60) return "amber";
  return "green";
}

export function getPropertyStatus(
  certificates: { expiry_date: string }[]
): ComplianceStatus {
  if (certificates.length === 0) return "red";

  const statuses = certificates.map((c) => getCertificateStatus(c.expiry_date));

  if (statuses.includes("red")) return "red";
  if (statuses.includes("amber")) return "amber";
  return "green";
}

export function getStatusLabel(status: ComplianceStatus): string {
  switch (status) {
    case "green":
      return "Valid";
    case "amber":
      return "Expiring Soon";
    case "red":
      return "Needs Attention";
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
