"use client";

import { useAppMode } from "@/lib/app-mode";
import RemindersList from "@/components/RemindersList";
import TenancyRemindersList from "@/components/tenancy/TenancyRemindersList";
import type { Certificate, CertificateType, ComplianceStatus, Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

interface ReminderRow {
  certificate: Certificate;
  property: Property;
  daysUntilExpiry: number;
  status: ComplianceStatus;
}

interface ReminderContractor {
  property_id: string;
  certificate_type: CertificateType;
  name: string;
  company_name: string;
  phone: string;
  email: string;
}

export interface TenancyReminderRow {
  id: string;
  tenancy: Tenancy;
  label: string;
  dueDate: string;
  daysRemaining: number;
  urgency: "overdue" | "urgent" | "upcoming";
}

interface RemindersPageClientProps {
  complianceReminders: ReminderRow[];
  contractors: ReminderContractor[];
  tenancyReminders: TenancyReminderRow[];
}

export default function RemindersPageClient({
  complianceReminders,
  contractors,
  tenancyReminders,
}: RemindersPageClientProps) {
  const { mode } = useAppMode();

  if (mode === "tenancy") {
    return <TenancyRemindersList reminders={tenancyReminders} />;
  }

  return (
    <RemindersList reminders={complianceReminders} contractors={contractors} />
  );
}
