import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteCertificateButton from "@/components/DeleteCertificateButton";
import DeletePropertyButton from "@/components/DeletePropertyButton";
import PropertyContractors from "@/components/PropertyContractors";
import PropertyNotes from "@/components/PropertyNotes";
import ShareWithLandlordButton from "@/components/ShareWithLandlordButton";
import StatusDot from "@/components/StatusDot";
import PropertyPageHeader from "@/components/layout/PropertyPageHeader";
import { getCertificateDocumentUrl } from "@/lib/certificate-documents";
import { CertificateTypeIcon } from "@/lib/icons";
import {
  formatDate,
  getCertificateStatus,
  getPropertyStatus,
} from "@/lib/compliance";
import {
  btnPrimaryClassName,
  btnSecondaryClassName,
  cardClassName,
  formSectionRuleClassName,
  formSectionTitleClassName,
  goldLabelClassName,
  linkClassName,
  mutedTextClassName,
  tableHeaderClassName,
  tableRowEvenClassName,
  tableRowOddClassName,
} from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import {
  CERTIFICATE_LABELS,
  getCertificateDateLabels,
  PROPERTY_TYPE_LABELS,
  type Certificate,
  type Property,
  type PropertyContractor,
} from "@/lib/types";

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

  const { data: contractors } = await supabase
    .from("property_contractors")
    .select("*")
    .eq("property_id", id)
    .order("certificate_type", { ascending: true });

  const contractorList = (contractors ?? []) as PropertyContractor[];

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
      <PropertyPageHeader
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
              className="inline-flex items-center justify-center border border-dusty-cream/30 px-5 py-2.5 text-xs font-light uppercase tracking-[0.1em] text-dusty-cream transition hover:border-dusty-cream/60"
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

      <div className={`${cardClassName} mb-10 flex items-center justify-between p-6`}>
        <div>
          <p className={goldLabelClassName}>Overall Status</p>
          <p className="mt-3 font-serif text-lg tracking-wide text-text">
            Portfolio compliance for this property
          </p>
        </div>
        <StatusDot status={propertyStatus} showLabel />
      </div>

      <PropertyNotes propertyId={id} initialNotes={typedProperty.notes} />

      <div className="mt-14">
        <h2 className={formSectionTitleClassName}>Compliance Certificates</h2>
        <div className={formSectionRuleClassName} aria-hidden="true" />

        {certificateList.length === 0 ? (
          <div className={`${cardClassName} mt-8 px-8 py-16 text-center`}>
            <p className={mutedTextClassName}>
              No certificates added yet. Add certificates to track compliance
              status.
            </p>
            <Link
              href={`/properties/${id}/certificates/new`}
              className={`${btnPrimaryClassName} mt-8`}
            >
              Add Certificate
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden border border-cocoa/15">
            <div className="space-y-0 md:hidden">
              {certificateList.map((cert, index) => {
                const status = getCertificateStatus(cert.expiry_date);
                const documentUrl = documentUrls[index];
                const dateLabels = getCertificateDateLabels(
                  cert.certificate_type
                );
                const rowClass =
                  index % 2 === 0 ? tableRowEvenClassName : tableRowOddClassName;

                return (
                  <div key={cert.id} className={`${rowClass} p-6`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 font-serif text-lg text-text">
                          <CertificateTypeIcon
                            type={cert.certificate_type}
                            className="h-4 w-4 shrink-0 text-cocoa/60"
                          />
                          {CERTIFICATE_LABELS[cert.certificate_type]}
                        </p>
                        <div className="mt-4 space-y-1 text-sm font-light text-cocoa">
                          <p>
                            {dateLabels.issue}: {formatDate(cert.issue_date)}
                          </p>
                          <p>
                            {dateLabels.expiry}: {formatDate(cert.expiry_date)}
                          </p>
                        </div>
                        {documentUrl && (
                          <a
                            href={documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${linkClassName} mt-4 inline-block`}
                          >
                            View document
                          </a>
                        )}
                        <div className="mt-5 flex flex-wrap gap-4">
                          <Link
                            href={`/properties/${id}/certificates/${cert.id}/edit`}
                            className={linkClassName}
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
                      <StatusDot status={status} />
                    </div>
                  </div>
                );
              })}
            </div>

            <table className="hidden w-full min-w-[720px] text-left text-sm md:table">
              <thead>
                <tr className={tableHeaderClassName}>
                  <th className="px-8 py-5">Certificate</th>
                  <th className="px-8 py-5">Issued</th>
                  <th className="px-8 py-5">Expires</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificateList.map((cert, index) => {
                  const status = getCertificateStatus(cert.expiry_date);
                  const documentUrl = documentUrls[index];
                  const dateLabels = getCertificateDateLabels(
                    cert.certificate_type
                  );
                  const rowClass =
                    index % 2 === 0 ? tableRowEvenClassName : tableRowOddClassName;

                  return (
                    <tr key={cert.id} className={rowClass}>
                      <td className="px-8 py-6">
                        <span className="flex items-center gap-3 font-serif text-base text-text">
                          <CertificateTypeIcon
                            type={cert.certificate_type}
                            className="h-4 w-4 shrink-0 text-cocoa/60"
                          />
                          {CERTIFICATE_LABELS[cert.certificate_type]}
                        </span>
                        {cert.notes && (
                          <p className="mt-2 pl-7 text-xs font-light text-cocoa">
                            {cert.notes}
                          </p>
                        )}
                        {documentUrl && (
                          <a
                            href={documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${linkClassName} mt-2 inline-block pl-7`}
                          >
                            View document
                          </a>
                        )}
                      </td>
                      <td className="px-8 py-6 font-light text-cocoa">
                        {formatDate(cert.issue_date)}
                      </td>
                      <td className="px-8 py-6 font-light text-cocoa">
                        {formatDate(cert.expiry_date)}
                      </td>
                      <td className="px-8 py-6">
                        <StatusDot status={status} />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-4">
                          <Link
                            href={`/properties/${id}/certificates/${cert.id}/edit`}
                            className={linkClassName}
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
        )}
      </div>

      <PropertyContractors
        propertyId={id}
        initialContractors={contractorList}
      />

      <DeletePropertyButton
        propertyId={id}
        propertyAddress={typedProperty.address}
        documentPaths={documentPaths}
      />
    </>
  );
}
