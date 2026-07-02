import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import StatusDot from "@/components/StatusDot";
import {
  formatDate,
  getCertificateStatus,
  getDaysUntilExpiry,
} from "@/lib/compliance";
import {
  cardClassName,
  editorialListRowClassName,
  goldLabelClassName,
  mutedTextClassName,
  tableRowEvenClassName,
  tableRowOddClassName,
} from "@/lib/ui";
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

function formatDueLabel(daysUntilExpiry: number): string {
  if (daysUntilExpiry < 0) {
    const days = Math.abs(daysUntilExpiry);
    return days === 1 ? "1 day overdue" : `${days} days overdue`;
  }

  if (daysUntilExpiry === 0) {
    return "Due today";
  }

  return daysUntilExpiry === 1
    ? "1 day remaining"
    : `${daysUntilExpiry} days remaining`;
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
        description="Certificate expiries due within the next 90 days."
      />

      {reminders.length === 0 ? (
        <div className={`${cardClassName} px-8 py-20 text-center`}>
          <p className="font-serif text-2xl tracking-wide text-text">
            No upcoming reminders
          </p>
          <p className={`${mutedTextClassName} mt-4`}>
            Nothing is due within the next 90 days across your portfolio.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-cocoa/15">
          {reminders.map((reminder, index) => {
            const rowClass =
              index % 2 === 0 ? tableRowEvenClassName : tableRowOddClassName;

            return (
              <div
                key={reminder.certificate.id}
                className={`${editorialListRowClassName} ${rowClass}`}
              >
                <div className="w-28 shrink-0 sm:w-36">
                  <p className="text-xs font-light uppercase tracking-[0.14em] text-cocoa">
                    {formatDueLabel(reminder.daysUntilExpiry)}
                  </p>
                  <p className="mt-2 text-xs font-light text-cocoa/70">
                    {formatDate(reminder.certificate.expiry_date)}
                  </p>
                </div>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/properties/${reminder.property.id}`}
                    className="block font-serif text-lg tracking-wide text-text transition hover:text-raspberry"
                  >
                    {reminder.property.address}
                  </Link>
                  <p className="mt-2 text-sm font-light text-cocoa">
                    {CERTIFICATE_LABELS[reminder.certificate.certificate_type]}
                  </p>
                </div>

                <div className="shrink-0">
                  <StatusDot status={reminder.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reminders.length > 0 && (
        <p className={`${mutedTextClassName} mt-8`}>
          <span className={goldLabelClassName}>
            {reminders.length}{" "}
            {reminders.length === 1 ? "certificate" : "certificates"}
          </span>{" "}
          due within 90 days.
        </p>
      )}
    </>
  );
}
