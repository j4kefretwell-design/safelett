import { AnimateIn } from "@/components/AnimateIn";
import PageHeader from "@/components/layout/PageHeader";
import RemindersList from "@/components/RemindersList";
import {
  getCertificateStatus,
  getDaysUntilExpiry,
} from "@/lib/compliance";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Property } from "@/lib/types";
import type { ComplianceStatus } from "@/lib/types";

interface ReminderRow {
  certificate: Certificate;
  property: Property;
  daysUntilExpiry: number;
  status: ComplianceStatus;
}

export default async function RemindersPage() {
  const supabase = await createClient();

  const { data: properties } = await supabase.from("properties").select("*");

  const propertyList = (properties ?? []) as Property[];
  const reminders: ReminderRow[] = [];

  for (const property of propertyList) {
    const { data: certificates } = await supabase
      .from("certificates")
      .select("*")
      .eq("property_id", property.id);

    for (const certificate of (certificates ?? []) as Certificate[]) {
      const daysUntilExpiry = getDaysUntilExpiry(certificate.expiry_date);

      if (daysUntilExpiry <= 90) {
        reminders.push({
          certificate,
          property,
          daysUntilExpiry,
          status: getCertificateStatus(certificate.expiry_date),
        });
      }
    }
  }

  reminders.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  return (
    <>
      <AnimateIn>
        <PageHeader
          title="Reminders"
          description="Certificate expiries due within the next 90 days."
        />
      </AnimateIn>

      <RemindersList reminders={reminders} />
    </>
  );
}
