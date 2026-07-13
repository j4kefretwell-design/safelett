import Link from "next/link";
import { ASSISTANT_DISCLAIMER } from "@/lib/assistant";
import { buildAssistantInsights } from "@/lib/assistant-insights";
import { formatDate } from "@/lib/compliance";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

export default async function AssistantExpiryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const emptyInsights = buildAssistantInsights({
    properties: [],
    certificates: [],
    tenancies: [],
  });

  let insights = emptyInsights;

  if (user) {
    const [{ data: properties }, { data: tenancies }] = await Promise.all([
      supabase.from("properties").select("*").eq("user_id", user.id),
      supabase.from("tenancies").select("*").eq("user_id", user.id),
    ]);

    const propertyList = (properties ?? []) as Property[];
    const propertyIds = propertyList.map((property) => property.id);
    let certificates: Certificate[] = [];

    if (propertyIds.length > 0) {
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .in("property_id", propertyIds);
      certificates = (data ?? []) as Certificate[];
    }

    insights = buildAssistantInsights({
      properties: propertyList,
      certificates,
      tenancies: (tenancies ?? []) as Tenancy[],
    });
  }

  const items = insights.expiringThisMonth;

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-greige">
      <div className="bg-forest px-5 py-8 sm:px-12 lg:px-16">
        <p className="text-[11px] font-normal uppercase tracking-[0.22em] text-dusty-cream/90">
          Expiring This Month
        </p>
        <p className="mt-3 max-w-2xl text-base font-light leading-relaxed text-dusty-cream/85">
          Certificates due to expire in the current calendar month.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-12 sm:py-16 lg:px-0">
        <Link
          href="/assistant"
          className="text-sm font-light text-cocoa transition hover:text-text"
        >
          ← Assistant home
        </Link>

        <p className="mt-10 text-[11px] font-normal uppercase tracking-[0.2em] text-forest">
          Summary
        </p>
        <div className="mt-3 h-px w-full bg-gold/55" aria-hidden="true" />

        {items.length === 0 ? (
          <p className="mt-8 text-sm font-light italic leading-relaxed text-[#97795D]">
            No certificates are recorded as expiring this month.
          </p>
        ) : (
          <>
            <p className="mt-8 font-serif text-2xl tracking-wide text-text">
              {items.length} certificate{items.length === 1 ? "" : "s"} expiring
              this month
            </p>
            <ul className="mt-6">
              {items.map((item) => (
                <li
                  key={item.certificateId}
                  className="border-t border-gold/35 py-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-serif text-lg tracking-wide text-text">
                      {item.certificateLabel}
                    </p>
                    <p className="text-xs font-light uppercase tracking-[0.12em] text-forest">
                      {item.daysUntilExpiry} day
                      {item.daysUntilExpiry === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="mt-1 text-sm font-light text-cocoa">
                    {item.propertyAddress}
                  </p>
                  <p className="mt-1 text-sm font-light text-[#97795D]">
                    Expires {formatDate(item.expiryDate)}
                  </p>
                  <Link
                    href={`/properties/${item.propertyId}`}
                    className="mt-3 inline-block text-xs font-normal uppercase tracking-[0.12em] text-forest transition hover:text-forest-dark"
                  >
                    View property →
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/reminders"
              className="mt-10 inline-flex h-12 items-center justify-center bg-forest px-6 text-sm font-normal uppercase tracking-[0.12em] text-dusty-cream transition hover:bg-forest-dark"
            >
              Open reminders &amp; draft emails →
            </Link>
          </>
        )}

        <p className="mx-auto mt-20 max-w-2xl text-center text-[11px] italic leading-relaxed text-[#97795D]">
          {ASSISTANT_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
