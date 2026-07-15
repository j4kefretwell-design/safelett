import {
  getTenancyStatus,
  TENANCY_STATUS_LABELS,
  TENANCY_TYPE_LABELS,
  type Tenancy,
  type TenancyStatus,
  type TenancyType,
} from "@/lib/tenancy";

export interface Tenant {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  property_id: string | null;
  tenancy_id: string | null;
  move_in_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TenantStatus = TenancyStatus | "unlinked";

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  ...TENANCY_STATUS_LABELS,
  unlinked: "Contact",
};

export function getTenantStatus(tenancy: Tenancy | null | undefined): TenantStatus {
  if (!tenancy) return "unlinked";
  return getTenancyStatus(tenancy);
}

export function getTenantTenancyTypeLabel(
  tenancy: Tenancy | null | undefined
): string {
  if (!tenancy) return "No linked tenancy";
  return TENANCY_TYPE_LABELS[tenancy.tenancy_type as TenancyType] ?? tenancy.tenancy_type;
}
