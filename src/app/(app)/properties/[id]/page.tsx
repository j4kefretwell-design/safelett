import { notFound } from "next/navigation";
import DeleteCertificateButton from "@/components/DeleteCertificateButton";
import DeletePropertyButton from "@/components/DeletePropertyButton";
import PageHeader from "@/components/layout/PageHeader";
import PropertyNotes from "@/components/PropertyNotes";
import ShareWithLandlordButton from "@/components/ShareWithLandlordButton";
import StatusBadge from "@/components/StatusBadge";
import TrafficLight from "@/components/TrafficLight";
import { getCertificateDocumentUrl } from "@/lib/certificate-documents";
import {
  formatDate,
  getCertificateStatus,
  getPropertyStatus,
} from "@/lib/compliance";
import {
  btnPrimaryClassName,
  btnSecondaryClassName,
  cardClassName,
} from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import {
  CERTIFICATE_LABELS,
  getCertificateDateLabels,
  PROPERTY_TYPE_LABELS,
  type Certificate,
  type Property,
} from "@/lib/types";
import Link from "next/link";

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!property) {
    notFound();
  }

  const typedProperty = property as Property;

  const { data: certificates } = await supabase
    .from("certificates")
    .select("*")
    .eq("property_id", id)
    .order("expiry_date", { ascending: true });

  const certificateList = (certificates ?? []) as Certificate[];
  const propertyStatus = getPropertyStatus(certificateList);

  const documentUrls = await Promise.all(
    certificateList.map(async (cert) => {
      if (!cert.document_path) {
        return null;
      }

      return getCertificateDocumentUrl(supabase, cert.document_path);
    })
  );

  const documentPaths = certificateList
    .map((cert) => cert.document_path)
    .filter((path): path is string => Boolean(path));

  return (
    <>
      <PageHeader
        title={typedProperty.address}
        description={`${PROPERTY_TYPE_LABELS[typedProperty.property_type]} · ${typedProperty.bedrooms} ${typedProperty.bedrooms === 1 ? "bedroom" : "bedrooms"}`}
        backHref="/dashboard"
        backLabel="Back to Dashboard"
        actionHref={`/properties/${id}/certificates/new`}
        actionLabel="Add Certificate"
        secondaryAction={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/properties/${id}/edit`}
              className={btnSecondaryClassName}
            >
              Edit Property
            </Link>
            <ShareWithLandlordButton
              propertyId={id}
              shareToken={typedProperty.share_token}
            />
          </div>
        }
      />

      <div className={`${cardClassName} mb-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center`}>
        <TrafficLight status={propertyStatus} size="lg" />
        <div>
          <p className="text-sm font-medium text-mahogany-900/60">Overall status</p>
          <div className="mt-2">
            <StatusBadge status={propertyStatus} />
          </div>
        </div>
      </div>

      <PropertyNotes propertyId={id} initialNotes={typedProperty.notes} />

      <div className="mt-10">
        <h2 className="mb-4 font-serif text-xl font-semibold text-mahogany-950">
          Compliance Certificates
        </h2>

        {certificateList.length === 0 ? (
          <div className={`${cardClassName} px-6 py-12 text-center sm:px-8`}>
            <p className="text-sm text-mahogany-900/60">
              No certificates added yet. Add certificates to track compliance
              status.
            </p>
            <Link
              href={`/properties/${id}/certificates/new`}
              className={`${btnPrimaryClassName} mt-6`}
            >
              Add Certificate
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 md:hidden">
              {certificateList.map((cert, index) => {
                const status = getCertificateStatus(cert.expiry_date);
                const documentUrl = documentUrls[index];
                const dateLabels = getCertificateDateLabels(
                  cert.certificate_type
                );

                return (
                  <div
                    key={cert.id}
                    className={`${cardClassName} p-5`}
                  >
                    <div className="flex items-start gap-3">
                      <TrafficLight status={status} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-mahogany-950">
                          {CERTIFICATE_LABELS[cert.certificate_type]}
                        </p>
                        {cert.notes && (
                          <p className="mt-1 text-xs text-mahogany-900/60">
                            {cert.notes}
                          </p>
                        )}
                        <div className="mt-3 space-y-1 text-sm text-mahogany-900/80">
                          <p>
                            {dateLabels.issue}: {formatDate(cert.issue_date)}
                          </p>
                          <p>
                            {dateLabels.expiry}: {formatDate(cert.expiry_date)}
                          </p>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <StatusBadge status={status} size="sm" />
                          {documentUrl && (
                            <a
                              href={documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-forest-900 underline decoration-gold-muted underline-offset-2"
                            >
                              View Certificate
                            </a>
                          )}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-4">
                          <Link
                            href={`/properties/${id}/certificates/${cert.id}/edit`}
                            className="text-sm font-semibold text-forest-900 hover:underline"
                          >
                            Edit
                          </Link>
                          <DeleteCertificateButton
                            certificateId={cert.id}
                            certificateLabel={
                              CERTIFICATE_LABELS[cert.certificate_type]
                            }
                            documentPath={cert.document_path}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`${cardClassName} hidden overflow-x-auto md:block`}>
              <table className="w-full min-w-[720px] text-left text-sm">
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
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-mahogany-900/60">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {certificateList.map((cert, index) => {
                    const status = getCertificateStatus(cert.expiry_date);
                    const documentUrl = documentUrls[index];
                    const dateLabels = getCertificateDateLabels(
                      cert.certificate_type
                    );

                    return (
                      <tr
                        key={cert.id}
                        className="border-b border-gold-muted/40 last:border-0"
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <TrafficLight status={status} />
                            <span className="font-medium text-mahogany-950">
                              {CERTIFICATE_LABELS[cert.certificate_type]}
                            </span>
                            {documentUrl && (
                              <a
                                href={documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-forest-900 underline decoration-gold-muted underline-offset-2 transition hover:text-mahogany-950"
                              >
                                View Certificate
                              </a>
                            )}
                          </div>
                          {cert.notes && (
                            <p className="mt-1.5 pl-6 text-xs text-mahogany-900/60">
                              {cert.notes}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-5 text-mahogany-900/80">
                          <span className="sr-only">{dateLabels.issue}: </span>
                          {formatDate(cert.issue_date)}
                        </td>
                        <td className="px-6 py-5 text-mahogany-900/80">
                          <span className="sr-only">{dateLabels.expiry}: </span>
                          {formatDate(cert.expiry_date)}
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={status} size="sm" />
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-4">
                            <Link
                              href={`/properties/${id}/certificates/${cert.id}/edit`}
                              className="text-sm font-semibold text-forest-900 transition hover:underline"
                            >
                              Edit
                            </Link>
                            <DeleteCertificateButton
                              certificateId={cert.id}
                              certificateLabel={
                                CERTIFICATE_LABELS[cert.certificate_type]
                              }
                              documentPath={cert.document_path}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <DeletePropertyButton
        propertyId={id}
        propertyAddress={typedProperty.address}
        documentPaths={documentPaths}
      />
    </>
  );
}
