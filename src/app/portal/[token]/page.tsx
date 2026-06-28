import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import TrafficLight from "@/components/TrafficLight";
import {
  formatDate,
  getCertificateStatus,
  getPropertyStatus,
} from "@/lib/compliance";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CERTIFICATE_LABELS,
  getCertificateDateLabels,
  PROPERTY_TYPE_LABELS,
  type Certificate,
  type Property,
} from "@/lib/types";

interface PortalPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({
  params,
}: PortalPageProps): Promise<Metadata> {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: property } = await supabase
    .from("properties")
    .select("address")
    .eq("share_token", token)
    .single();

  if (!property) {
    return { title: "Portal Not Found — SafeLett" };
  }

  return {
    title: `${property.address} — Landlord Portal | SafeLett`,
    description: "Read-only compliance overview shared via SafeLett.",
  };
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("share_token", token)
    .single();

  if (!property) {
    notFound();
  }

  const typedProperty = property as Property;

  const { data: certificates } = await supabase
    .from("certificates")
    .select("*")
    .eq("property_id", typedProperty.id)
    .order("expiry_date", { ascending: true });

  const certificateList = (certificates ?? []) as Certificate[];
  const propertyStatus = getPropertyStatus(certificateList);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-gold-muted/60 bg-forest-950 text-ivory">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6 sm:py-10">
          <div>
            <span className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              Safe<span className="text-gold-light">Lett</span>
            </span>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-light/70">
              Landlord Compliance Portal
            </p>
          </div>
          <div>
            <p className="text-sm text-ivory/70">Property compliance overview</p>
            <h1 className="mt-2 font-serif text-2xl font-semibold leading-snug sm:text-3xl">
              {typedProperty.address}
            </h1>
            <p className="mt-2 text-sm text-ivory/80">
              {PROPERTY_TYPE_LABELS[typedProperty.property_type]} ·{" "}
              {typedProperty.bedrooms}{" "}
              {typedProperty.bedrooms === 1 ? "bedroom" : "bedrooms"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-xl border border-gold-muted/60 bg-ivory p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <TrafficLight status={propertyStatus} size="lg" />
            <div>
              <p className="text-sm font-medium text-mahogany-900/60">
                Overall compliance status
              </p>
              <div className="mt-2">
                <StatusBadge status={propertyStatus} />
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-mahogany-900/60">
            This read-only portal is shared by your property manager. Certificate
            details below are updated as records change in SafeLett.
          </p>
        </div>

        <section className="mt-8">
          <h2 className="font-serif text-xl font-semibold text-mahogany-950">
            Certificates
          </h2>

          {certificateList.length === 0 ? (
            <div className="mt-4 rounded-xl border border-gold-muted/60 bg-ivory px-6 py-12 text-center shadow-sm">
              <p className="text-sm text-mahogany-900/60">
                No certificates have been recorded for this property yet.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 space-y-4 md:hidden">
                {certificateList.map((cert) => {
                  const status = getCertificateStatus(cert.expiry_date);
                  const dateLabels = getCertificateDateLabels(
                    cert.certificate_type
                  );

                  return (
                    <div
                      key={cert.id}
                      className="rounded-xl border border-gold-muted/60 bg-ivory p-5 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <TrafficLight status={status} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-mahogany-950">
                            {CERTIFICATE_LABELS[cert.certificate_type]}
                          </p>
                          <div className="mt-3 space-y-1 text-sm text-mahogany-900/80">
                            <p>
                              {dateLabels.issue}: {formatDate(cert.issue_date)}
                            </p>
                            <p>
                              {dateLabels.expiry}: {formatDate(cert.expiry_date)}
                            </p>
                          </div>
                          <div className="mt-3">
                            <StatusBadge status={status} size="sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 hidden overflow-x-auto rounded-xl border border-gold-muted/60 bg-ivory shadow-sm md:block">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gold-muted/40 bg-cream/80">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-mahogany-900/60">
                        Certificate
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-mahogany-900/60">
                        Issued / Completed
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-mahogany-900/60">
                        Expires / Review
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-mahogany-900/60">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificateList.map((cert) => {
                      const status = getCertificateStatus(cert.expiry_date);

                      return (
                        <tr
                          key={cert.id}
                          className="border-b border-gold-muted/40 last:border-0"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <TrafficLight status={status} />
                              <span className="font-medium text-mahogany-950">
                                {CERTIFICATE_LABELS[cert.certificate_type]}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-mahogany-900/80">
                            {formatDate(cert.issue_date)}
                          </td>
                          <td className="px-6 py-5 text-mahogany-900/80">
                            {formatDate(cert.expiry_date)}
                          </td>
                          <td className="px-6 py-5">
                            <StatusBadge status={status} size="sm" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <footer className="mt-10 border-t border-gold-muted/60 pt-6 text-center text-xs text-mahogany-900/50">
          Powered by SafeLett — professional property compliance tracking
        </footer>
      </main>
    </div>
  );
}
