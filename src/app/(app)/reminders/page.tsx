import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import TrafficLight from "@/components/TrafficLight";
import { CertificateTypeIcon } from "@/lib/icons";
import {
  formatDate,
  getCertificateStatus,
  getDaysUntilExpiry,
} from "@/lib/compliance";
import { cardClassName, mutedTextClassName, tableHeaderClassName, tableRowClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import {
  CERTIFICATE_LABELS,
  type Certificate,
  type Property,
} from "@/lib/types";

interface ReminderRow {
  certificate: Certificate;
  property: Property;
  daysUntilExpiry: number;
  status: ReturnType<typeof getCertificateStatus>;
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
      <PageHeader
        title="Reminders"
        description="All certificate expiries due within the next 90 days, sorted by urgency."
      />

      {reminders.length === 0 ? (
        <div className={`${cardClassName} px-8 py-16 text-center`}>
          <p className="font-serif text-xl font-medium text-charcoal">
            No upcoming reminders
          </p>
          <p className={`${mutedTextClassName} mt-3`}>
            Nothing is due within the next 90 days across your portfolio.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 md:hidden">
            {reminders.map((reminder) => (
              <div
                key={reminder.certificate.id}
                className={`${cardClassName} p-5`}
              >
                <div className="flex items-start gap-3">
                  <TrafficLight status={reminder.status} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-charcoal">
                      {reminder.daysUntilExpiry < 0
                        ? `${Math.abs(reminder.daysUntilExpiry)} days overdue`
                        : reminder.daysUntilExpiry === 0
                          ? "Due today"
                          : `${reminder.daysUntilExpiry} days`}
                    </p>
                    <Link
                      href={`/properties/${reminder.property.id}`}
                      className="mt-2 block text-sm font-medium text-burgundy hover:underline"
                    >
                      {reminder.property.address}
                    </Link>
                    <p className="mt-2 flex items-center gap-2 text-sm text-charcoal-muted">
                      <CertificateTypeIcon
                        type={reminder.certificate.certificate_type}
                        className="h-3.5 w-3.5 shrink-0 text-burgundy/60"
                      />
                      {CERTIFICATE_LABELS[reminder.certificate.certificate_type]}
                    </p>
                    <p className="mt-1 text-sm text-charcoal-muted">
                      Expires {formatDate(reminder.certificate.expiry_date)}
                    </p>
                    <div className="mt-3">
                      <StatusBadge status={reminder.status} size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`${cardClassName} hidden overflow-x-auto md:block`}>
            <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className={tableHeaderClassName}>
                <th className="px-6 py-4">Due</th>
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Certificate</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder) => (
                <tr
                  key={reminder.certificate.id}
                  className={tableRowClassName}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <TrafficLight status={reminder.status} />
                      <span className="font-medium text-charcoal">
                        {reminder.daysUntilExpiry < 0
                          ? `${Math.abs(reminder.daysUntilExpiry)} days overdue`
                          : reminder.daysUntilExpiry === 0
                            ? "Due today"
                            : `${reminder.daysUntilExpiry} days`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Link
                      href={`/properties/${reminder.property.id}`}
                      className="font-medium text-burgundy hover:underline"
                    >
                      {reminder.property.address}
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-charcoal-muted">
                    <span className="flex items-center gap-2">
                      <CertificateTypeIcon
                        type={reminder.certificate.certificate_type}
                        className="h-3.5 w-3.5 shrink-0 text-burgundy/60"
                      />
                      {CERTIFICATE_LABELS[reminder.certificate.certificate_type]}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-charcoal-muted">
                    {formatDate(reminder.certificate.expiry_date)}
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={reminder.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {reminders.length > 0 && (
        <p className={`${mutedTextClassName} mt-6`}>
          Showing {reminders.length}{" "}
          {reminders.length === 1 ? "certificate" : "certificates"} due within
          90 days.
        </p>
      )}
    </>
  );
}
