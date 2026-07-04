import RemindersList from "@/components/RemindersList";
import {
  getCertificateStatus,
  getDaysUntilExpiry,
} from "@/lib/compliance";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, CertificateType, Property } from "@/lib/types";
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

  const { data: assignments } = await supabase
    .from("property_contractors")
    .select(
      "property_id, certificate_type, contractors(name, company_name, phone, email)"
    );

  const contractorContacts = (assignments ?? [])
    .map((row) => {
      const contractor = Array.isArray(row.contractors)
        ? row.contractors[0]
        : row.contractors;

      if (!contractor) return null;

      return {
        property_id: row.property_id as string,
        certificate_type: row.certificate_type as CertificateType,
        name: contractor.name as string,
        company_name: contractor.company_name as string,
        phone: contractor.phone as string,
        email: contractor.email as string,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  return (
    <RemindersList
      reminders={reminders}
      contractors={contractorContacts}
    />
  );
}
