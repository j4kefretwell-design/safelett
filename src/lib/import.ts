import { PROPERTY_TYPE_LABELS, type PropertyType } from "@/lib/types";
import { CERTIFICATE_LABELS, CERTIFICATE_TYPES, type CertificateType } from "@/lib/types";

export const IMPORT_TEMPLATE_HEADERS = [
  "address",
  "property_type",
  "bedrooms",
  "certificate_type",
  "issue_date",
  "expiry_date",
] as const;

export type ImportRow = {
  address: string;
  property_type: PropertyType;
  bedrooms: number;
  certificate_type?: CertificateType;
  issue_date?: string;
  expiry_date?: string;
};

export function buildImportTemplateCsv(): string {
  const header = IMPORT_TEMPLATE_HEADERS.join(",");
  const example = [
    "123 High Street London SW1A 1AA",
    "standard_rental",
    "2",
    "gas_safety",
    "2024-06-01",
    "2025-06-01",
  ].join(",");

  const instructions = [
    "# SafeLett Bulk Import Template",
    "# property_type: standard_rental | hmo | student_let",
    `# certificate_type: ${CERTIFICATE_TYPES.join(" | ")}`,
    "# Leave certificate columns empty for property-only rows",
    "# Dates must be YYYY-MM-DD",
    "",
    header,
    example,
  ].join("\n");

  return instructions;
}

const PROPERTY_TYPE_MAP: Record<string, PropertyType> = {
  standard_rental: "standard_rental",
  "standard rental": "standard_rental",
  hmo: "hmo",
  student_let: "student_let",
  "student let": "student_let",
};

const CERTIFICATE_TYPE_MAP: Record<string, CertificateType> = Object.fromEntries(
  CERTIFICATE_TYPES.flatMap((type) => [
    [type, type],
    [CERTIFICATE_LABELS[type].toLowerCase(), type],
  ])
) as Record<string, CertificateType>;

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function normalizePropertyType(value: string): PropertyType | null {
  const key = value.trim().toLowerCase().replace(/\s+/g, " ");
  return PROPERTY_TYPE_MAP[key] ?? null;
}

function normalizeCertificateType(value: string): CertificateType | null {
  if (!value.trim()) return null;
  const key = value.trim().toLowerCase();
  return CERTIFICATE_TYPE_MAP[key] ?? null;
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseImportCsv(content: string): {
  rows: ImportRow[];
  errors: string[];
} {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  if (lines.length === 0) {
    return { rows: [], errors: ["The file is empty."] };
  }

  const header = lines[0].toLowerCase();
  const expected = IMPORT_TEMPLATE_HEADERS.join(",");
  if (header !== expected) {
    return {
      rows: [],
      errors: [`Invalid header row. Expected: ${expected}`],
    };
  }

  const rows: ImportRow[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const lineNumber = i + 1;
    const values = parseCsvLine(lines[i]);

    if (values.length !== IMPORT_TEMPLATE_HEADERS.length) {
      errors.push(`Line ${lineNumber}: expected ${IMPORT_TEMPLATE_HEADERS.length} columns.`);
      continue;
    }

    const [address, propertyTypeRaw, bedroomsRaw, certTypeRaw, issueDate, expiryDate] =
      values;

    if (!address) {
      errors.push(`Line ${lineNumber}: address is required.`);
      continue;
    }

    const property_type = normalizePropertyType(propertyTypeRaw);
    if (!property_type) {
      errors.push(`Line ${lineNumber}: invalid property_type "${propertyTypeRaw}".`);
      continue;
    }

    const bedrooms = parseInt(bedroomsRaw, 10);
    if (!Number.isFinite(bedrooms) || bedrooms < 1) {
      errors.push(`Line ${lineNumber}: bedrooms must be a positive number.`);
      continue;
    }

    const certificate_type = normalizeCertificateType(certTypeRaw);
    const hasCertData =
      Boolean(certTypeRaw.trim()) ||
      Boolean(issueDate.trim()) ||
      Boolean(expiryDate.trim());

    if (hasCertData) {
      if (!certificate_type) {
        errors.push(`Line ${lineNumber}: invalid certificate_type "${certTypeRaw}".`);
        continue;
      }

      if (!isValidDate(issueDate) || !isValidDate(expiryDate)) {
        errors.push(`Line ${lineNumber}: issue_date and expiry_date must be YYYY-MM-DD when adding a certificate.`);
        continue;
      }

      if (new Date(expiryDate) < new Date(issueDate)) {
        errors.push(`Line ${lineNumber}: expiry_date must be on or after issue_date.`);
        continue;
      }
    }

    rows.push({
      address,
      property_type,
      bedrooms,
      ...(hasCertData && certificate_type
        ? {
            certificate_type,
            issue_date: issueDate,
            expiry_date: expiryDate,
          }
        : {}),
    });
  }

  return { rows, errors };
}

export function getPropertyTypeOptionsForTemplate(): string {
  return Object.entries(PROPERTY_TYPE_LABELS)
    .map(([value, label]) => `${value} (${label})`)
    .join(", ");
}
