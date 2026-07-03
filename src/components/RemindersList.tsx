"use client";

import Link from "next/link";
import { AnimateIn } from "@/components/AnimateIn";
import { ScrollRevealGroup } from "@/components/ScrollReveal";
import { formatDate } from "@/lib/compliance";
import {
  cardClassName,
  editorialListRowClassName,
  mutedTextClassName,
  reminderGroupLabelClassName,
  sectionBandClassName,
  sectionBandLabelClassName,
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

const URGENCY_GROUPS = [
  {
    key: "overdue",
    label: "Overdue",
    match: (days: number) => days < 0,
  },
  {
    key: "7days",
    label: "Due Within 7 Days",
    match: (days: number) => days >= 0 && days <= 7,
  },
  {
    key: "30days",
    label: "Due Within 30 Days",
    match: (days: number) => days > 7 && days <= 30,
  },
  {
    key: "60days",
    label: "Due Within 60 Days",
    match: (days: number) => days > 30 && days <= 60,
  },
  {
    key: "90days",
    label: "Due Within 90 Days",
    match: (days: number) => days > 60 && days <= 90,
  },
] as const;

const daysRemainingColor: Record<ComplianceStatus, string> = {
  green: "text-compliant",
  amber: "text-attention",
  red: "text-urgent",
};

function groupReminders(reminders: ReminderRow[]) {
  return URGENCY_GROUPS.map((group) => ({
    ...group,
    items: reminders.filter((r) => group.match(r.daysUntilExpiry)),
  })).filter((group) => group.items.length > 0);
}

export default function RemindersList({ reminders }: RemindersListProps) {
  if (reminders.length === 0) {
    return (
      <>
        <AnimateIn>
          <div className={`-mx-6 sm:-mx-10 lg:-mx-14 ${sectionBandClassName}`}>
            <p className={sectionBandLabelClassName}>Upcoming Compliance</p>
            <p className="mt-2 font-serif text-2xl text-dusty-cream">0 items due</p>
          </div>
        </AnimateIn>

        <AnimateIn delay={100}>
          <div className={`${cardClassName} mt-10 px-8 py-20 text-center`}>
            <p className="font-serif text-2xl tracking-wide text-text">
              No upcoming reminders
            </p>
            <p className={`${mutedTextClassName} mt-4`}>
              Nothing is due within the next 90 days across your portfolio.
            </p>
          </div>
        </AnimateIn>
      </>
    );
  }

  const groups = groupReminders(reminders);
  let rowIndex = 0;

  return (
    <>
      <AnimateIn>
        <div className={`-mx-6 sm:-mx-10 lg:-mx-14 ${sectionBandClassName}`}>
          <p className={sectionBandLabelClassName}>Upcoming Compliance</p>
          <p className="mt-2 font-serif text-2xl text-dusty-cream sm:text-3xl">
            {reminders.length}{" "}
            {reminders.length === 1 ? "item" : "items"} due
          </p>
        </div>
      </AnimateIn>

      <div className="-mx-6 mt-10 sm:-mx-10 lg:-mx-14">
        {groups.map((group) => (
          <div key={group.key} className="mb-10 last:mb-0">
            <p className={reminderGroupLabelClassName}>{group.label}</p>

            <ScrollRevealGroup>
              <div className="border-x border-b border-cocoa/15">
                {group.items.map((reminder) => {
                  const isEven = rowIndex % 2 === 0;
                  rowIndex += 1;
                  const rowBg = isEven ? "bg-dusty-cream" : "bg-beige";

                  return (
                    <div
                      key={reminder.certificate.id}
                      className={`${editorialListRowClassName} ${rowBg}`}
                    >
                      <div className="w-24 shrink-0 sm:w-32">
                        <p className="font-serif text-2xl tracking-wide text-cocoa sm:text-3xl">
                          {formatDate(reminder.certificate.expiry_date).split(" ")[0]}
                        </p>
                        <p className="mt-1 text-xs font-light uppercase tracking-[0.12em] text-cocoa/60">
                          {formatDate(reminder.certificate.expiry_date).split(" ").slice(1).join(" ")}
                        </p>
                      </div>

                      <div
                        className="hidden h-12 w-px shrink-0 bg-gold/50 sm:block"
                        aria-hidden="true"
                      />

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/properties/${reminder.property.id}`}
                          className="block font-serif text-lg tracking-wide text-text transition hover:text-raspberry sm:text-xl"
                        >
                          {reminder.property.address}
                        </Link>
                        <p className="mt-2 text-xs font-normal uppercase tracking-[0.14em] text-cocoa">
                          {CERTIFICATE_LABELS[reminder.certificate.certificate_type]}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className={`font-serif text-2xl tracking-wide ${daysRemainingColor[reminder.status]}`}
                        >
                          {reminder.daysUntilExpiry < 0
                            ? Math.abs(reminder.daysUntilExpiry)
                            : reminder.daysUntilExpiry}
                        </p>
                        <p className="mt-1 text-[10px] font-normal uppercase tracking-[0.12em] text-cocoa/60">
                          {reminder.daysUntilExpiry < 0 ? "days overdue" : "days left"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollRevealGroup>
          </div>
        ))}
      </div>
    </>
  );
}
