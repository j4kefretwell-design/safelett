import {
  formatDate,
  getCertificateStatus,
  getDaysUntilExpiry,
  getPropertyStatus,
  getStatusLabel,
} from "@/lib/compliance";
import {
  CERTIFICATE_LABELS,
  PROPERTY_TYPE_LABELS,
  type Certificate,
  type Property,
} from "@/lib/types";

function escapeCsvValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

interface ExportRow {
  property: Property;
  propertyStatus: string;
  certificate?: Certificate;
  certificateStatus?: string;
}

export function buildComplianceCsv(rows: ExportRow[]): string {
  const headers = [
    "Property Address",
    "Property Type",
    "Bedrooms",
    "Property Status",
    "Certificate Type",
    "Issue Date",
    "Expiry Date",
    "Certificate Status",
    "Days Until Expiry",
  ];

  const lines = rows.map((row) => {
    const cert = row.certificate;
    const daysUntilExpiry = cert
      ? String(getDaysUntilExpiry(cert.expiry_date))
      : "";

    return [
      escapeCsvValue(row.property.address),
      escapeCsvValue(PROPERTY_TYPE_LABELS[row.property.property_type]),
      String(row.property.bedrooms),
      escapeCsvValue(row.propertyStatus),
      escapeCsvValue(
        cert ? CERTIFICATE_LABELS[cert.certificate_type] : "No certificates"
      ),
      escapeCsvValue(cert ? formatDate(cert.issue_date) : ""),
      escapeCsvValue(cert ? formatDate(cert.expiry_date) : ""),
      escapeCsvValue(row.certificateStatus ?? ""),
      daysUntilExpiry,
    ].join(",");
  });

  return [headers.join(","), ...lines].join("\n");
}

export function buildExportRows(
  properties: Property[],
  certificatesByProperty: Map<string, Certificate[]>
): ExportRow[] {
  const rows: ExportRow[] = [];

  for (const property of properties) {
    const certificates = certificatesByProperty.get(property.id) ?? [];
    const propertyStatus = getPropertyStatus(certificates);
    const propertyStatusLabel = getStatusLabel(propertyStatus);

    if (certificates.length === 0) {
      rows.push({ property, propertyStatus: propertyStatusLabel });
      continue;
    }

    for (const certificate of certificates) {
      rows.push({
        property,
        propertyStatus: propertyStatusLabel,
        certificate,
        certificateStatus: getStatusLabel(
          getCertificateStatus(certificate.expiry_date)
        ),
      });
    }
  }

  return rows;
}
