import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import TrafficLight from "@/components/TrafficLight";
import {
  formatDate,
  getCertificateStatus,
  getPropertyStatus,
} from "@/lib/compliance";
import {
  cardClassName,
  mutedTextClassName,
  tableHeaderClassName,
  tableRowClassName,
} from "@/lib/ui";
import { createAdminClient } from "@/lib/supabase/admin";
import { BRAND_NAME } from "@/lib/brand";
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
    return { title: `Portal Not Found — ${BRAND_NAME}` };
  }

  return {
    title: `${property.address} — Landlord Portal | ${BRAND_NAME}`,
    description: `Read-only compliance overview shared via ${BRAND_NAME}.`,
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
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-gold/20 bg-burgundy">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-12">
          <span className="font-serif text-2xl font-medium text-gold sm:text-3xl">
            {BRAND_NAME}
          </span>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-cream/60">
            Landlord Portal
          </p>
          <div className="mt-8 border-t border-gold/20 pt-8">
            <p className="text-sm text-cream/70">Property compliance overview</p>
            <h1 className="mt-2 font-serif text-2xl font-medium leading-snug text-cream sm:text-3xl">
              {typedProperty.address}
            </h1>
            <p className="mt-2 text-sm text-cream/70">
              {PROPERTY_TYPE_LABELS[typedProperty.property_type]} ·{" "}
              {typedProperty.bedrooms}{" "}
              {typedProperty.bedrooms === 1 ? "bedroom" : "bedrooms"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-12">
        <div className={`${cardClassName} p-6 sm:p-8`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <TrafficLight status={propertyStatus} size="lg" />
            <div>
              <p className="text-sm text-charcoal-muted">Overall compliance status</p>
              <div className="mt-2">
                <StatusBadge status={propertyStatus} />
              </div>
            </div>
          </div>
          <p className={`${mutedTextClassName} mt-5 leading-relaxed`}>
            This read-only portal is shared by your property manager. Certificate
            details below are updated as records change in {BRAND_NAME}.
          </p>
        </div>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-medium text-charcoal">
            Certificates
          </h2>

          {certificateList.length === 0 ? (
            <div className={`${cardClassName} mt-5 px-6 py-14 text-center`}>
              <p className={mutedTextClassName}>
                No certificates have been recorded for this property yet.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-5 space-y-4 md:hidden">
                {certificateList.map((cert) => {
                  const status = getCertificateStatus(cert.expiry_date);
                  const dateLabels = getCertificateDateLabels(
                    cert.certificate_type
                  );

                  return (
                    <div key={cert.id} className={`${cardClassName} p-5`}>
                      <div className="flex items-start gap-3">
                        <TrafficLight status={status} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-charcoal">
                            {CERTIFICATE_LABELS[cert.certificate_type]}
                          </p>
                          <div className="mt-3 space-y-1 text-sm text-charcoal-muted">
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

              <div className={`${cardClassName} mt-5 hidden overflow-x-auto md:block`}>
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className={tableHeaderClassName}>
                      <th className="px-6 py-4">Certificate</th>
                      <th className="px-6 py-4">Issued / Completed</th>
                      <th className="px-6 py-4">Expires / Review</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificateList.map((cert) => {
                      const status = getCertificateStatus(cert.expiry_date);

                      return (
                        <tr key={cert.id} className={tableRowClassName}>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <TrafficLight status={status} />
                              <span className="font-medium text-charcoal">
                                {CERTIFICATE_LABELS[cert.certificate_type]}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-charcoal-muted">
                            {formatDate(cert.issue_date)}
                          </td>
                          <td className="px-6 py-5 text-charcoal-muted">
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

        <footer className="mt-12 border-t border-gold-light pt-8 text-center text-xs text-charcoal-muted/70">
          Powered by {BRAND_NAME}
        </footer>
      </main>
    </div>
  );
}
