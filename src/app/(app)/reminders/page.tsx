import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import TrafficLight from "@/components/TrafficLight";
import {
  formatDate,
  getCertificateStatus,
  getDaysUntilExpiry,
} from "@/lib/compliance";
import { cardClassName } from "@/lib/ui";
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
          <p className="font-serif text-lg font-semibold text-mahogany-950">
            No upcoming reminders
          </p>
          <p className="mt-2 text-sm text-mahogany-900/60">
            Nothing is due within the next 90 days across your portfolio.
          </p>
        </div>
      ) : (
        <div className={`${cardClassName} overflow-hidden`}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gold-muted/60 bg-cream/80">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-mahogany-900/60">
                  Due
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-mahogany-900/60">
                  Property
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-mahogany-900/60">
                  Certificate
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-mahogany-900/60">
                  Expiry Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-mahogany-900/60">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder) => (
                <tr
                  key={reminder.certificate.id}
                  className="border-b border-gold-muted/40 last:border-0"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <TrafficLight status={reminder.status} />
                      <span className="font-medium text-mahogany-950">
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
                      className="font-medium text-forest-900 hover:underline"
                    >
                      {reminder.property.address}
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-mahogany-900/80">
                    {CERTIFICATE_LABELS[reminder.certificate.certificate_type]}
                  </td>
                  <td className="px-6 py-5 text-mahogany-900/80">
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
      )}

      {reminders.length > 0 && (
        <p className="mt-4 text-sm text-mahogany-900/60">
          Showing {reminders.length}{" "}
          {reminders.length === 1 ? "certificate" : "certificates"} due within
          90 days.
        </p>
      )}
    </>
  );
}
