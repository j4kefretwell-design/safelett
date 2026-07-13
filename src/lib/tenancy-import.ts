import {
  DEPOSIT_SCHEMES,
  TENANCY_TYPES,
  type DepositScheme,
  type TenancyType,
} from "@/lib/tenancy";
import { BRAND_NAME } from "@/lib/brand";

export const TENANCY_IMPORT_HEADERS = [
  "tenant_names",
  "property_address",
  "tenancy_type",
  "start_date",
  "end_date",
  "monthly_rent",
  "rent_review_date",
  "deposit_amount",
  "deposit_scheme",
  "deposit_protection_date",
  "right_to_rent_expiry",
] as const;

export type TenancyImportRow = {
  tenant_names: string;
  property_address: string;
  tenancy_type: TenancyType;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  rent_review_date: string | null;
  deposit_amount: number | null;
  deposit_scheme: DepositScheme | null;
  deposit_protection_date: string | null;
  right_to_rent_expiry: string | null;
};

const TENANCY_TYPE_MAP: Record<string, TenancyType> = Object.fromEntries(
  TENANCY_TYPES.flatMap((type) => [
    [type, type],
    [type.replace(/_/g, " "), type],
  ])
) as Record<string, TenancyType>;

const DEPOSIT_SCHEME_MAP: Record<string, DepositScheme> = Object.fromEntries(
  DEPOSIT_SCHEMES.flatMap((scheme) => [
    [scheme, scheme],
    [scheme.replace(/_/g, " "), scheme],
  ])
) as Record<string, DepositScheme>;

export function buildTenancyImportTemplateCsv(): string {
  const header = TENANCY_IMPORT_HEADERS.join(",");
  const example = [
    "Jane Smith",
    "12 High Street London SW1A 1AA",
    "assured_shorthold",
    "2025-01-01",
    "2026-01-01",
    "1450.00",
    "2025-07-01",
    "1450.00",
    "dps",
    "2025-01-15",
    "2026-01-01",
  ].join(",");

  return [
    `# ${BRAND_NAME} Tenancy Bulk Import Template`,
    `# tenancy_type: ${TENANCY_TYPES.join(" | ")}`,
    `# deposit_scheme: ${DEPOSIT_SCHEMES.join(" | ")}`,
    "# Dates must be YYYY-MM-DD",
    "# Optional columns may be left blank: rent_review_date, deposit_amount, deposit_scheme, deposit_protection_date, right_to_rent_expiry",
    "",
    header,
    example,
  ].join("\n");
}

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

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function optionalDate(
  value: string,
  field: string,
  rowNumber: number,
  errors: string[]
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!isValidDate(trimmed)) {
    errors.push(`Row ${rowNumber}: ${field} must be YYYY-MM-DD.`);
    return null;
  }
  return trimmed;
}

export function parseTenancyImportCsv(content: string): {
  rows: TenancyImportRow[];
  errors: string[];
} {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  const errors: string[] = [];

  if (lines.length === 0) {
    return { rows: [], errors: ["The file is empty."] };
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const expected = [...TENANCY_IMPORT_HEADERS];

  if (headers.join(",") !== expected.join(",")) {
    return {
      rows: [],
      errors: [
        `Invalid CSV headers. Expected: ${expected.join(", ")}`,
      ],
    };
  }

  const rows: TenancyImportRow[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    const rowNumber = index + 1;
    const values = parseCsvLine(lines[index]);

    if (values.every((value) => !value)) continue;

    while (values.length < expected.length) values.push("");

    const tenantNames = values[0]?.trim() ?? "";
    const propertyAddress = values[1]?.trim() ?? "";
    const tenancyTypeRaw = values[2]?.trim().toLowerCase().replace(/\s+/g, "_") ?? "";
    const startDate = values[3]?.trim() ?? "";
    const endDate = values[4]?.trim() ?? "";
    const monthlyRentRaw = values[5]?.trim() ?? "";

    if (!tenantNames) {
      errors.push(`Row ${rowNumber}: tenant_names is required.`);
    }
    if (!propertyAddress) {
      errors.push(`Row ${rowNumber}: property_address is required.`);
    }

    const tenancyType = TENANCY_TYPE_MAP[tenancyTypeRaw] ?? null;
    if (!tenancyType) {
      errors.push(
        `Row ${rowNumber}: tenancy_type must be one of ${TENANCY_TYPES.join(", ")}.`
      );
    }

    if (!isValidDate(startDate)) {
      errors.push(`Row ${rowNumber}: start_date must be YYYY-MM-DD.`);
    }
    if (!isValidDate(endDate)) {
      errors.push(`Row ${rowNumber}: end_date must be YYYY-MM-DD.`);
    }
    if (isValidDate(startDate) && isValidDate(endDate) && endDate < startDate) {
      errors.push(`Row ${rowNumber}: end_date must be on or after start_date.`);
    }

    const monthlyRent = Number(monthlyRentRaw);
    if (!monthlyRentRaw || Number.isNaN(monthlyRent) || monthlyRent < 0) {
      errors.push(`Row ${rowNumber}: monthly_rent must be a number ≥ 0.`);
    }

    const rentReviewDate = optionalDate(
      values[6] ?? "",
      "rent_review_date",
      rowNumber,
      errors
    );

    const depositAmountRaw = (values[7] ?? "").trim();
    let depositAmount: number | null = null;
    if (depositAmountRaw) {
      depositAmount = Number(depositAmountRaw);
      if (Number.isNaN(depositAmount) || depositAmount < 0) {
        errors.push(`Row ${rowNumber}: deposit_amount must be a number ≥ 0.`);
        depositAmount = null;
      }
    }

    const depositSchemeRaw = (values[8] ?? "").trim().toLowerCase().replace(/\s+/g, "_");
    let depositScheme: DepositScheme | null = null;
    if (depositSchemeRaw) {
      depositScheme = DEPOSIT_SCHEME_MAP[depositSchemeRaw] ?? null;
      if (!depositScheme) {
        errors.push(
          `Row ${rowNumber}: deposit_scheme must be one of ${DEPOSIT_SCHEMES.join(", ")}.`
        );
      }
    }

    const depositProtectionDate = optionalDate(
      values[9] ?? "",
      "deposit_protection_date",
      rowNumber,
      errors
    );
    const rightToRentExpiry = optionalDate(
      values[10] ?? "",
      "right_to_rent_expiry",
      rowNumber,
      errors
    );

    if (
      !tenantNames ||
      !propertyAddress ||
      !tenancyType ||
      !isValidDate(startDate) ||
      !isValidDate(endDate) ||
      !monthlyRentRaw ||
      Number.isNaN(monthlyRent) ||
      monthlyRent < 0
    ) {
      continue;
    }

    rows.push({
      tenant_names: tenantNames,
      property_address: propertyAddress,
      tenancy_type: tenancyType,
      start_date: startDate,
      end_date: endDate,
      monthly_rent: monthlyRent,
      rent_review_date: rentReviewDate,
      deposit_amount: depositAmount,
      deposit_scheme: depositScheme,
      deposit_protection_date: depositProtectionDate,
      right_to_rent_expiry: rightToRentExpiry,
    });
  }

  return { rows, errors };
}
