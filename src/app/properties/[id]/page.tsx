import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteCertificateButton from "@/components/DeleteCertificateButton";
import DeletePropertyButton from "@/components/DeletePropertyButton";
import NavBar from "@/components/NavBar";
import PropertyNotes from "@/components/PropertyNotes";
import TrafficLight from "@/components/TrafficLight";
import { getCertificateDocumentUrl } from "@/lib/certificate-documents";
import {
  formatDate,
  getCertificateStatus,
  getPropertyStatus,
  getStatusLabel,
} from "@/lib/compliance";
import { createClient } from "@/lib/supabase/server";
import {
  CERTIFICATE_LABELS,
  getCertificateDateLabels,
  PROPERTY_TYPE_LABELS,
  type Certificate,
  type Property,
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

  const statusBadgeClasses = {
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link
          href="/dashboard"
          className="text-sm text-slate-600 transition hover:text-slate-900"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-4 flex items-start gap-4">
          <TrafficLight status={propertyStatus} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {typedProperty.address}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {PROPERTY_TYPE_LABELS[typedProperty.property_type]} ·{" "}
              {typedProperty.bedrooms}{" "}
              {typedProperty.bedrooms === 1 ? "bedroom" : "bedrooms"}
            </p>
          </div>
        </div>

        <PropertyNotes
          propertyId={id}
          initialNotes={typedProperty.notes}
        />

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Compliance Certificates
          </h2>
          <Link
            href={`/properties/${id}/certificates/new`}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Add Certificate
          </Link>
        </div>

        {certificateList.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-slate-600">
              No certificates added yet. Add certificates to track compliance
              status.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 font-medium text-slate-700">
                    Certificate
                  </th>
                  <th className="px-5 py-3 font-medium text-slate-700">
                    Issued / Completed
                  </th>
                  <th className="px-5 py-3 font-medium text-slate-700">
                    Expires / Review
                  </th>
                  <th className="px-5 py-3 font-medium text-slate-700">
                    Status
                  </th>
                  <th className="px-5 py-3 font-medium text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {certificateList.map((cert, index) => {
                  const status = getCertificateStatus(cert.expiry_date);
                  const documentUrl = documentUrls[index];
                  const dateLabels = getCertificateDateLabels(cert.certificate_type);

                  return (
                    <tr
                      key={cert.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <TrafficLight status={status} />
                          <span className="font-medium text-slate-900">
                            {CERTIFICATE_LABELS[cert.certificate_type]}
                          </span>
                          {documentUrl && (
                            <a
                              href={documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-900"
                            >
                              View Certificate
                            </a>
                          )}
                        </div>
                        {cert.notes && (
                          <p className="mt-1 pl-7 text-xs text-slate-500">
                            {cert.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <span className="sr-only">{dateLabels.issue}: </span>
                        {formatDate(cert.issue_date)}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <span className="sr-only">{dateLabels.expiry}: </span>
                        {formatDate(cert.expiry_date)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses[status]}`}
                        >
                          {getStatusLabel(status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
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

        <DeletePropertyButton
          propertyId={id}
          propertyAddress={typedProperty.address}
          documentPaths={documentPaths}
        />
      </main>
    </div>
  );
}
