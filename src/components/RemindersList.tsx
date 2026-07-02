"use client";

import Link from "next/link";
import StatusDot from "@/components/StatusDot";
import { AnimateIn } from "@/components/AnimateIn";
import { ScrollRevealGroup } from "@/components/ScrollReveal";
import { formatDate } from "@/lib/compliance";
import {
  cardClassName,
  editorialListRowClassName,
  goldLabelClassName,
  mutedTextClassName,
  tableRowEvenClassName,
  tableRowOddClassName,
} from "@/lib/ui";
import { CERTIFICATE_LABELS, type Certificate, type Property } from "@/lib/types";
import type { ComplianceStatus } from "@/lib/types";

interface ReminderRow {
  certificate: Certificate;
  property: Property;
  daysUntilExpiry: number;
  status: ComplianceStatus;
}

interface RemindersListProps {
  reminders: ReminderRow[];
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

export default function RemindersList({ reminders }: RemindersListProps) {
  if (reminders.length === 0) {
    return (
      <AnimateIn>
        <div className={`${cardClassName} px-8 py-20 text-center`}>
          <p className="font-serif text-2xl tracking-wide text-text">
            No upcoming reminders
          </p>
          <p className={`${mutedTextClassName} mt-4`}>
            Nothing is due within the next 90 days across your portfolio.
          </p>
        </div>
      </AnimateIn>
    );
  }

  return (
    <>
      <ScrollRevealGroup>
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
      </ScrollRevealGroup>

      <AnimateIn delay={100}>
        <p className={`${mutedTextClassName} mt-8`}>
          <span className={goldLabelClassName}>
            {reminders.length}{" "}
            {reminders.length === 1 ? "certificate" : "certificates"}
          </span>{" "}
          due within 90 days.
        </p>
      </AnimateIn>
    </>
  );
}
