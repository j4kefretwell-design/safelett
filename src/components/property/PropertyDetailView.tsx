"use client";

import Link from "next/link";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import ContractorEmailDraftModal from "@/components/ContractorEmailDraftModal";
import PropertyContractors from "@/components/PropertyContractors";
import PropertyNotes from "@/components/PropertyNotes";
import StatusDot from "@/components/StatusDot";
import { useToast } from "@/components/toast/ToastProvider";
import { deleteCertificateDocuments } from "@/lib/certificate-documents";
import type { ContractorEmailDraft } from "@/lib/contractor-email";
import {
  formatDate,
  getCertificateStatus,
  getDaysUntilExpiry,
} from "@/lib/compliance";
import { createClient } from "@/lib/supabase/client";
import {
  CERTIFICATE_LABELS,
  type Certificate,
  type CertificateType,
  type Contractor,
  type Property,
  type PropertyContractorWithDetails,
} from "@/lib/types";
import { useRouter } from "next/navigation";

interface CertificateWithDocument extends Certificate {
  documentUrl: string | null;
}

interface PropertyDetailViewProps {
  property: Property;
  certificates: CertificateWithDocument[];
  assignments: PropertyContractorWithDetails[];
  directoryContractors: Contractor[];
  emailDraftsByCertId: Record<string, ContractorEmailDraft>;
  documentPaths: string[];
}

function sectionHeading(title: string, action?: React.ReactNode) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-serif text-xl tracking-wide text-text">{title}</h2>
        <div className="mt-3 h-px w-16 bg-gold/80" aria-hidden />
      </div>
      {action}
    </div>
  );
}

function formatDaysRemaining(days: number) {
  if (days < 0) {
    return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  }
  if (days === 0) return "Expires today";
  return `${days} day${days === 1 ? "" : "s"} remaining`;
}

export default function PropertyDetailView({
  property,
  certificates,
  assignments,
  directoryContractors,
  emailDraftsByCertId,
  documentPaths,
}: PropertyDetailViewProps) {
  const router = useRouter();
  const { deleted, error: toastError } = useToast();
  const [draftCertId, setDraftCertId] = useState<string | null>(null);
  const [confirmDeleteProperty, setConfirmDeleteProperty] = useState(false);
  const [deletingProperty, setDeletingProperty] = useState(false);
  const [deletePropertyError, setDeletePropertyError] = useState<string | null>(
    null
  );

  const contractorsByType = new Map<CertificateType, Contractor>();
  for (const assignment of assignments) {
    if (assignment.contractors) {
      contractorsByType.set(assignment.certificate_type, assignment.contractors);
    }
  }

  const attentionCount = certificates.filter(
    (cert) => getCertificateStatus(cert.expiry_date) !== "green"
  ).length;

  const hasOverdue = certificates.some(
    (cert) => getCertificateStatus(cert.expiry_date) === "red"
  );

  const statusMessage =
    certificates.length === 0
      ? "No certificates added yet"
      : attentionCount === 0
        ? "All certificates compliant"
        : attentionCount === 1
          ? "1 certificate needs attention"
          : `${attentionCount} certificates need attention`;

  const statusColour =
    certificates.length === 0
      ? "border-attention bg-attention/5 text-attention"
      : attentionCount === 0
        ? "border-compliant bg-compliant/5 text-compliant"
        : hasOverdue
          ? "border-urgent bg-urgent/5 text-urgent"
          : "border-attention bg-attention/5 text-attention";

  const documentsWithCerts = certificates.filter((cert) => cert.documentUrl);

  const activeDraft = draftCertId ? emailDraftsByCertId[draftCertId] ?? null : null;
  const activeCert = draftCertId
    ? certificates.find((cert) => cert.id === draftCertId)
    : null;

  async function handleDeleteProperty() {
    setDeletePropertyError(null);
    setDeletingProperty(true);

    const supabase = createClient();
    const [{ data: propertyRow }, { data: certificateRows }] = await Promise.all([
      supabase.from("properties").select("*").eq("id", property.id).maybeSingle(),
      supabase.from("certificates").select("*").eq("property_id", property.id),
    ]);

    await deleteCertificateDocuments(supabase, documentPaths);

    const { error: deleteError } = await supabase
      .from("properties")
      .delete()
      .eq("id", property.id);

    if (deleteError) {
      setDeletePropertyError(deleteError.message);
      toastError();
      setDeletingProperty(false);
      setConfirmDeleteProperty(false);
      return;
    }

    setConfirmDeleteProperty(false);
    deleted("Property deleted", async () => {
      if (!propertyRow) return;
      await supabase.from("properties").insert(propertyRow);
      if (certificateRows?.length) {
        await supabase.from("certificates").insert(certificateRows);
      }
      router.refresh();
    });
    router.push("/compliance");
    router.refresh();
  }

  return (
    <div className="dashboard-parchment-bg min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden px-5 pb-16 pt-8 sm:px-12 lg:px-16">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-[12px] font-light text-leather">
          <li>
            <Link href="/compliance" className="transition hover:text-gold-readable">
              Dashboard
            </Link>
          </li>
          <li aria-hidden className="text-leather/50">
            →
          </li>
          <li className="truncate text-umber">{property.address}</li>
        </ol>
      </nav>

      <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl tracking-wide text-text sm:text-3xl">
            {property.address}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-sm font-light">
          <Link
            href={`/properties/${property.id}/edit`}
            className="text-gold-readable transition hover:text-gold"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setConfirmDeleteProperty(true)}
            className="text-leather/70 transition hover:text-urgent"
          >
            Delete
          </button>
        </div>
      </header>

      {/* Section 1 — Compliance Status */}
      <section className="mt-10">
        <div className={`border-l-4 px-4 py-3 ${statusColour}`}>
          <p className="font-serif text-lg tracking-wide">{statusMessage}</p>
        </div>
      </section>

      {/* Section 2 — Certificates */}
      <section className="mt-14">
        {sectionHeading(
          "Certificates",
          <Link
            href={`/properties/${property.id}/certificates/new`}
            className="text-sm text-gold-readable transition hover:text-gold"
          >
            + Add Certificate
          </Link>
        )}

        {certificates.length === 0 ? (
          <p className="mt-8 text-sm leading-relaxed text-leather">
            No certificates yet.{" "}
            <Link
              href={`/properties/${property.id}/certificates/new`}
              className="text-gold-readable transition hover:text-gold"
            >
              Add your first certificate →
            </Link>
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-leather/15 border border-leather/15 bg-white/50">
            {certificates.map((cert) => {
              const status = getCertificateStatus(cert.expiry_date);
              const days = getDaysUntilExpiry(cert.expiry_date);
              const contractor = contractorsByType.get(cert.certificate_type);
              const hasDraft = Boolean(emailDraftsByCertId[cert.id]);

              return (
                <li
                  key={cert.id}
                  className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-serif text-lg tracking-wide text-text">
                        {CERTIFICATE_LABELS[cert.certificate_type]}
                      </p>
                      <StatusDot status={status} />
                    </div>
                    <p className="mt-2 text-sm text-leather">
                      Expires {formatDate(cert.expiry_date)}
                      <span className="mx-2 text-leather/40">·</span>
                      <span
                        className={
                          status === "red"
                            ? "text-urgent"
                            : status === "amber"
                              ? "text-attention"
                              : "text-compliant"
                        }
                      >
                        {formatDaysRemaining(days)}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:shrink-0">
                    <Link
                      href={`/properties/${property.id}/certificates/${cert.id}/edit`}
                      className="text-sm text-gold-readable transition hover:text-gold"
                    >
                      Edit
                    </Link>
                    {contractor && hasDraft ? (
                      <button
                        type="button"
                        onClick={() => setDraftCertId(cert.id)}
                        className="text-sm text-raspberry transition hover:text-raspberry-dark"
                      >
                        Draft Email
                      </button>
                    ) : (
                      <a
                        href="#contractors"
                        className="text-sm text-gold-readable transition hover:text-gold"
                      >
                        Add Contractor →
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Section 3 — Contractors */}
      <section id="contractors" className="mt-14 scroll-mt-24">
        <PropertyContractors
          propertyId={property.id}
          initialAssignments={assignments}
          directoryContractors={directoryContractors}
        />
      </section>

      {/* Section 4 — Documents */}
      <section className="mt-14">
        {sectionHeading("Documents")}

        {documentsWithCerts.length === 0 ? (
          <p className="mt-8 text-sm leading-relaxed text-leather">
            No certificate documents uploaded yet.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-leather/15 border border-leather/15 bg-white/50">
            {documentsWithCerts.map((cert) => (
              <li
                key={cert.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6"
              >
                <div>
                  <p className="font-serif text-base tracking-wide text-text">
                    {CERTIFICATE_LABELS[cert.certificate_type]}
                  </p>
                  <p className="mt-1 text-xs text-leather">
                    Expires {formatDate(cert.expiry_date)}
                  </p>
                </div>
                <a
                  href={cert.documentUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gold-readable transition hover:text-gold"
                >
                  View →
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Section 5 — Notes */}
      <section className="mt-14">
        <PropertyNotes propertyId={property.id} initialNotes={property.notes} compact />
      </section>

      <ContractorEmailDraftModal
        open={draftCertId != null}
        onClose={() => setDraftCertId(null)}
        draft={activeDraft}
        certificateLabel={
          activeCert ? CERTIFICATE_LABELS[activeCert.certificate_type] : ""
        }
        propertyAddress={property.address}
      />

      <ConfirmDialog
        open={confirmDeleteProperty}
        title="Delete property?"
        message={`Are you sure you want to delete "${property.address}"? This will permanently remove the property and all its certificates.`}
        confirmLabel="Confirm Delete"
        loading={deletingProperty}
        onConfirm={() => void handleDeleteProperty()}
        onCancel={() => setConfirmDeleteProperty(false)}
      />

      {deletePropertyError ? (
        <p className="mt-4 border border-urgent/30 bg-urgent-light px-4 py-3 text-sm text-urgent">
          {deletePropertyError}
        </p>
      ) : null}
    </div>
  );
}
