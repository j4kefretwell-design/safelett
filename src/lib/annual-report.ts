import {
  getCertificateStatus,
  getPropertyStatus,
  formatDate,
} from "@/lib/compliance";
import {
  CERTIFICATE_LABELS,
  type Certificate,
  type CertificateType,
  type ComplianceStatus,
  type Contractor,
  type Property,
  type PropertyContractorWithDetails,
} from "@/lib/types";

export interface AnnualReportCertificateRow {
  type: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  contractor: string | null;
}

export interface AnnualReportPropertySection {
  address: string;
  notes: string | null;
  certificates: AnnualReportCertificateRow[];
}

export interface AnnualReportSummary {
  totalProperties: number;
  compliancePercentage: number;
  compliant: number;
  requiringAttention: number;
  overdue: number;
}

export interface AnnualReportData {
  preparedFor: string;
  reportYear: number;
  generatedAt: string;
  summary: AnnualReportSummary;
  properties: AnnualReportPropertySection[];
}

export function getCertificateReportStatusLabel(
  status: ComplianceStatus
): string {
  switch (status) {
    case "green":
      return "Compliant";
    case "amber":
      return "Expiring Soon";
    case "red":
      return "Overdue";
  }
}

function formatContractor(contractor: Contractor | undefined): string | null {
  if (!contractor) {
    return null;
  }

  const company = contractor.company_name?.trim();
  if (company) {
    return `${contractor.name} (${company})`;
  }

  return contractor.name;
}

export function buildAnnualReportData({
  properties,
  certificatesByProperty,
  contractorsByProperty,
  preparedFor,
  generatedAt = new Date(),
}: {
  properties: Property[];
  certificatesByProperty: Map<string, Certificate[]>;
  contractorsByProperty: Map<string, PropertyContractorWithDetails[]>;
  preparedFor: string;
  generatedAt?: Date;
}): AnnualReportData {
  const reportYear = generatedAt.getFullYear();
  const generatedAtLabel = generatedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let compliant = 0;
  let requiringAttention = 0;
  let overdue = 0;

  const propertySections: AnnualReportPropertySection[] = properties.map(
    (property) => {
      const certificates = certificatesByProperty.get(property.id) ?? [];
      const assignments = contractorsByProperty.get(property.id) ?? [];
      const contractorsByType = new Map<CertificateType, Contractor>();

      for (const assignment of assignments) {
        if (assignment.contractors) {
          contractorsByType.set(
            assignment.certificate_type,
            assignment.contractors as Contractor
          );
        }
      }

      const propertyStatus = getPropertyStatus(certificates);
      if (propertyStatus === "green") compliant += 1;
      if (propertyStatus === "amber") requiringAttention += 1;
      if (propertyStatus === "red") overdue += 1;

      const certificateRows: AnnualReportCertificateRow[] =
        certificates.length === 0
          ? [
              {
                type: "No certificates recorded",
                issueDate: "—",
                expiryDate: "—",
                status: "Overdue",
                contractor: null,
              },
            ]
          : certificates.map((certificate) => ({
              type: CERTIFICATE_LABELS[certificate.certificate_type],
              issueDate: formatDate(certificate.issue_date),
              expiryDate: formatDate(certificate.expiry_date),
              status: getCertificateReportStatusLabel(
                getCertificateStatus(certificate.expiry_date)
              ),
              contractor: formatContractor(
                contractorsByType.get(certificate.certificate_type)
              ),
            }));

      return {
        address: property.address,
        notes: property.notes,
        certificates: certificateRows,
      };
    }
  );

  const totalProperties = properties.length;
  const compliancePercentage =
    totalProperties === 0
      ? 0
      : Math.round((compliant / totalProperties) * 100);

  return {
    preparedFor,
    reportYear,
    generatedAt: generatedAtLabel,
    summary: {
      totalProperties,
      compliancePercentage,
      compliant,
      requiringAttention,
      overdue,
    },
    properties: propertySections,
  };
}
