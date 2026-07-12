import Link from "next/link";
import { notFound } from "next/navigation";
import { formatTenancyDate, type Tenancy } from "@/lib/tenancy";
import { btnPrimaryClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";

export default async function TenancyNoticesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: tenancies } = await supabase
    .from("tenancies")
    .select("*")
    .order("end_date", { ascending: true });

  const tenancyList = (tenancies ?? []) as Tenancy[];

  return (
    <div className="tenancy-slate-bg min-h-[calc(100vh-4rem)] px-5 py-12 sm:px-12 lg:px-16">
      <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-gold">
        Tenancy Notices
      </p>
      <h1 className="mt-5 font-serif text-3xl tracking-wide text-tenancy-text sm:text-4xl">
        Generate Tenancy Notices
      </h1>
      <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-steel">
        Select a tenancy to draft a renewal offer, Section 13 rent increase
        notice, end of tenancy letter, or right to rent reminder.
      </p>

      {tenancyList.length === 0 ? (
        <div className="mt-12 border border-steel/15 bg-white p-8 text-center">
          <p className="text-sm text-steel">
            Add a tenancy first to generate notices.
          </p>
          <Link
            href="/tenancy/new"
            className={`${btnPrimaryClassName} mt-6 inline-flex bg-navy hover:bg-navy-dark`}
          >
            Add Tenancy
          </Link>
        </div>
      ) : (
        <ul className="mt-12 divide-y divide-steel/10 border border-steel/15 bg-white">
          {tenancyList.map((tenancy) => (
            <li
              key={tenancy.id}
              className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8"
            >
              <div>
                <p className="font-serif text-lg tracking-wide text-tenancy-text">
                  {tenancy.tenant_names}
                </p>
                <p className="mt-1 text-sm text-steel">{tenancy.property_address}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-steel/70">
                  Ends {formatTenancyDate(tenancy.end_date)}
                </p>
              </div>
              <Link
                href={`/tenancy/${tenancy.id}/draft-notice`}
                className={`${btnPrimaryClassName} bg-navy hover:bg-navy-dark sm:shrink-0`}
              >
                Generate Notice
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
