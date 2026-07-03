"use client";

import Link from "next/link";
import { AnimateIn } from "@/components/AnimateIn";
import BrandMonogram from "@/components/BrandMonogram";
import { ScrollRevealGroup } from "@/components/ScrollReveal";
import { formatDate } from "@/lib/compliance";
import {
  editorialBleedClassName,
  editorialContentClassName,
  mutedTextClassName,
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
    bandClass: "bg-[#4a2428] text-dusty-cream",
    match: (days: number) => days < 0,
  },
  {
    key: "7days",
    label: "Due Within 7 Days",
    bandClass: "bg-[#6b5344] text-dusty-cream",
    match: (days: number) => days >= 0 && days <= 7,
  },
  {
    key: "30days",
    label: "Due Within 30 Days",
    bandClass: "bg-[#5a4838] text-dusty-cream/90",
    match: (days: number) => days > 7 && days <= 30,
  },
  {
    key: "60days",
    label: "Due Within 60 Days",
    bandClass: "bg-raspberry text-dusty-cream/85",
    match: (days: number) => days > 30 && days <= 60,
  },
  {
    key: "90days",
    label: "Due Within 90 Days",
    bandClass: "bg-[#2a1418] text-dusty-cream/80",
    match: (days: number) => days > 60 && days <= 90,
  },
] as const;

function groupReminders(reminders: ReminderRow[]) {
  return URGENCY_GROUPS.map((group) => ({
    ...group,
    items: reminders.filter((r) => group.match(r.daysUntilExpiry)),
  })).filter((group) => group.items.length > 0);
}

function formatTimelineDate(dateString: string): string {
  return formatDate(dateString);
}

function formatHeaderDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function RemindersList({ reminders }: RemindersListProps) {
  const headerDate = formatHeaderDate();

  if (reminders.length === 0) {
    return (
      <>
        <AnimateIn>
          <header className={`bg-raspberry px-8 py-16 sm:px-12 lg:px-16 lg:py-20 ${editorialBleedClassName}`}>
            <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-dusty-cream/60">
              Compliance Reminders
            </p>
            <p className="mt-4 font-serif text-2xl italic tracking-wide text-gold sm:text-3xl">
              {headerDate}
            </p>
          </header>
        </AnimateIn>

        <AnimateIn delay={100}>
          <div className={`${editorialContentClassName} py-20 text-center`}>
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

  return (
    <>
      <AnimateIn>
        <header className={`bg-raspberry px-8 py-16 sm:px-12 lg:px-16 lg:py-20 ${editorialBleedClassName}`}>
          <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-dusty-cream/60">
            Compliance Reminders
          </p>
          <p className="mt-4 font-serif text-2xl italic tracking-wide text-gold sm:text-3xl lg:text-4xl">
            {headerDate}
          </p>
          <p className="mt-6 text-sm font-light text-dusty-cream/50">
            {reminders.length}{" "}
            {reminders.length === 1 ? "certificate" : "certificates"} due within
            90 days
          </p>
        </header>
      </AnimateIn>

      <div className="space-y-0">
        {groups.map((group) => (
          <div key={group.key}>
            <p
              className={`px-8 py-4 text-[10px] font-normal uppercase tracking-[0.28em] sm:px-12 lg:px-16 ${group.bandClass} ${editorialBleedClassName}`}
            >
              {group.label}
            </p>

            <ScrollRevealGroup>
              <div className="divide-y divide-cocoa/10 bg-dusty-cream">
                {group.items.map((reminder) => (
                  <div
                    key={reminder.certificate.id}
                    className={`${editorialContentClassName} grid gap-6 py-10 sm:grid-cols-[140px_1fr] sm:gap-12 sm:py-12`}
                  >
                    <div>
                      <p className="font-serif text-3xl tracking-wide text-cocoa sm:text-4xl">
                        {formatTimelineDate(reminder.certificate.expiry_date)}
                      </p>
                      <p className="mt-3 text-[10px] font-normal uppercase tracking-[0.16em] text-cocoa/50">
                        {reminder.daysUntilExpiry < 0
                          ? `${Math.abs(reminder.daysUntilExpiry)} days overdue`
                          : `${reminder.daysUntilExpiry} days remaining`}
                      </p>
                    </div>

                    <div className="min-w-0 border-l border-gold/30 pl-0 sm:pl-10">
                      <Link
                        href={`/properties/${reminder.property.id}`}
                        className="block font-serif text-xl tracking-wide text-text transition hover:text-raspberry sm:text-2xl"
                      >
                        {reminder.property.address}
                      </Link>
                      <p className="mt-4 text-[10px] font-normal uppercase tracking-[0.18em] text-cocoa">
                        {CERTIFICATE_LABELS[reminder.certificate.certificate_type]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollRevealGroup>
          </div>
        ))}
      </div>
    </>
  );
}
