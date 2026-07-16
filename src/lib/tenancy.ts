export type TenancyType =
  | "assured_shorthold"
  | "periodic"
  | "fixed_term"
  | "student_let"
  | "hmo_room";

export type DepositScheme = "dps" | "mydeposits" | "tds" | "none";

export type TenancyStatus = "active" | "renewal_due" | "expired";

export type TenancyAlertType =
  | "tenancy_end"
  | "rent_review"
  | "deposit_overdue"
  | "right_to_rent";

export interface Tenancy {
  id: string;
  user_id: string;
  tenant_names: string;
  property_address: string;
  property_id: string | null;
  tenancy_type: TenancyType;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  rent_review_date: string | null;
  deposit_amount: number | null;
  deposit_scheme: DepositScheme | null;
  deposit_reference: string | null;
  deposit_protection_date: string | null;
  right_to_rent_checked: boolean;
  right_to_rent_expiry: string | null;
  notes: string | null;
  agreement_path: string | null;
  deposit_cert_path: string | null;
  right_to_rent_path: string | null;
  created_at: string;
  updated_at: string;
}

export const TENANCY_TYPE_LABELS: Record<TenancyType, string> = {
  assured_shorthold: "Assured Shorthold Tenancy",
  periodic: "Periodic Tenancy",
  fixed_term: "Fixed Term",
  student_let: "Student Let",
  hmo_room: "HMO Room",
};

export const TENANCY_TYPES: TenancyType[] = [
  "assured_shorthold",
  "periodic",
  "fixed_term",
  "student_let",
  "hmo_room",
];

/** Simplified options for the add-tenancy wizard */
export const ADD_TENANCY_TYPE_OPTIONS: {
  value: TenancyType;
  label: string;
}[] = [
  { value: "assured_shorthold", label: "AST" },
  { value: "periodic", label: "Periodic" },
  { value: "student_let", label: "Student" },
  { value: "hmo_room", label: "HMO Room" },
];

export const DEPOSIT_SCHEME_LABELS: Record<DepositScheme, string> = {
  dps: "DPS",
  mydeposits: "MyDeposits",
  tds: "TDS",
  none: "None",
};

export const DEPOSIT_SCHEMES: DepositScheme[] = [
  "dps",
  "mydeposits",
  "tds",
  "none",
];

export const TENANCY_STATUS_LABELS: Record<TenancyStatus, string> = {
  active: "Active",
  renewal_due: "Renewal Due",
  expired: "Expired",
};

export function getDaysUntilDate(dateString: string): number {
  const [year, month, day] = dateString.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatTenancyDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getTenancyStatus(tenancy: Pick<
  Tenancy,
  "end_date" | "rent_review_date"
>): TenancyStatus {
  const daysUntilEnd = getDaysUntilDate(tenancy.end_date);

  if (daysUntilEnd < 0) {
    return "expired";
  }

  if (daysUntilEnd <= 60) {
    return "renewal_due";
  }

  if (tenancy.rent_review_date) {
    const daysUntilReview = getDaysUntilDate(tenancy.rent_review_date);
    if (daysUntilReview <= 60 && daysUntilReview >= 0) {
      return "renewal_due";
    }
  }

  return "active";
}

export function isDepositProtectionOverdue(
  tenancy: Pick<
    Tenancy,
    | "start_date"
    | "deposit_amount"
    | "deposit_scheme"
    | "deposit_protection_date"
  >
): boolean {
  if (!tenancy.deposit_amount || tenancy.deposit_scheme === "none") {
    return false;
  }

  if (!tenancy.deposit_protection_date) {
    const daysSinceStart = -getDaysUntilDate(tenancy.start_date);
    return daysSinceStart > 30;
  }

  const daysBetween =
    -getDaysUntilDate(tenancy.start_date) +
    getDaysUntilDate(tenancy.deposit_protection_date);

  return daysBetween > 30;
}

export function getTenancyEndAlertTiers(daysUntilEnd: number): number[] {
  if (daysUntilEnd < 0) return [];
  const tiers = [90, 60, 30];
  return tiers.filter((tier) => daysUntilEnd <= tier);
}

export function getRentReviewAlertTiers(daysUntilReview: number): number[] {
  if (daysUntilReview < 0) return [];
  const tiers = [60, 30];
  return tiers.filter((tier) => daysUntilReview <= tier);
}

export function getRightToRentAlertTiers(daysUntilExpiry: number): number[] {
  if (daysUntilExpiry < 0) return [];
  const tiers = [60, 30, 7];
  return tiers.filter((tier) => daysUntilExpiry <= tier);
}

export function getDateCardStatus(
  daysRemaining: number
): "green" | "amber" | "red" {
  if (daysRemaining < 0) return "red";
  if (daysRemaining <= 30) return "amber";
  return "green";
}

/** True when deposit or right-to-rent optional details were never added */
export function hasMissingTenancyOptionalDetails(
  tenancy: Pick<
    Tenancy,
    | "deposit_amount"
    | "deposit_reference"
    | "deposit_protection_date"
    | "right_to_rent_checked"
    | "right_to_rent_expiry"
  >
): boolean {
  const missingDeposit =
    tenancy.deposit_amount == null &&
    !tenancy.deposit_reference?.trim() &&
    !tenancy.deposit_protection_date;

  const missingRightToRent =
    !tenancy.right_to_rent_checked && !tenancy.right_to_rent_expiry;

  return missingDeposit || missingRightToRent;
}
