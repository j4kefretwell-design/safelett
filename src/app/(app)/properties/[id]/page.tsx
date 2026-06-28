import { notFound } from "next/navigation";
import DeleteCertificateButton from "@/components/DeleteCertificateButton";
import DeletePropertyButton from "@/components/DeletePropertyButton";
import PageHeader from "@/components/layout/PageHeader";
import PropertyNotes from "@/components/PropertyNotes";
import StatusBadge from "@/components/StatusBadge";
import TrafficLight from "@/components/TrafficLight";
import { getCertificateDocumentUrl } from "@/lib/certificate-documents";
import {
  formatDate,
  getCertificateStatus,
  getPropertyStatus,
} from "@/lib/compliance";
import { btnPrimaryClassName, cardClassName } from "@/lib/ui";
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
      />

      <div className={`${cardClassName} mb-8 flex items-center gap-4 p-6`}>
        <TrafficLight status={propertyStatus} size="lg" />
        <div>
          <p className="text-sm font-medium text-slate-500">Overall status</p>
          <div className="mt-2">
            <StatusBadge status={propertyStatus} />
          </div>
        </div>
      </div>

      <PropertyNotes propertyId={id} initialNotes={typedProperty.notes} />

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-navy-950">
          Compliance Certificates
        </h2>

        {certificateList.length === 0 ? (
          <div className={`${cardClassName} px-8 py-12 text-center`}>
            <p className="text-sm text-slate-500">
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
          <div className={`${cardClassName} overflow-hidden`}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Certificate
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Issued / Completed
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Expires / Review
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <TrafficLight status={status} />
                          <span className="font-medium text-navy-950">
                            {CERTIFICATE_LABELS[cert.certificate_type]}
                          </span>
                          {documentUrl && (
                            <a
                              href={documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-navy-700 underline decoration-slate-300 underline-offset-2 transition hover:text-navy-900"
                            >
                              View Certificate
                            </a>
                          )}
                        </div>
                        {cert.notes && (
                          <p className="mt-1.5 pl-6 text-xs text-slate-500">
                            {cert.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-5 text-slate-600">
                        <span className="sr-only">{dateLabels.issue}: </span>
                        {formatDate(cert.issue_date)}
                      </td>
                      <td className="px-6 py-5 text-slate-600">
                        <span className="sr-only">{dateLabels.expiry}: </span>
                        {formatDate(cert.expiry_date)}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={status} size="sm" />
                      </td>
                      <td className="px-6 py-5">
                        <DeleteCertificateButton
                          certificateId={cert.id}
                          certificateLabel={
                            CERTIFICATE_LABELS[cert.certificate_type]
                          }
                          documentPath={cert.document_path}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
