"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import ContractorEmailDraftModal from "@/components/ContractorEmailDraftModal";
import PropertyContractors from "@/components/PropertyContractors";
import PropertyNotes from "@/components/PropertyNotes";
import { useToast } from "@/components/toast/ToastProvider";
import { deleteCertificateDocuments } from "@/lib/certificate-documents";
import type { ContractorEmailDraft } from "@/lib/contractor-email";
import {
  formatDate,
  getCertificateStatus,
} from "@/lib/compliance";
import { appUnderNavClassName } from "@/lib/ui";
import {
  formatCurrency,
  formatTenancyDate,
  getDaysUntilDate,
  getTenancyStatus,
  isDepositProtectionOverdue,
  type Tenancy,
} from "@/lib/tenancy";
import { createClient } from "@/lib/supabase/client";
import {
  CERTIFICATE_LABELS,
  PROPERTY_TYPE_LABELS,
  type Certificate,
  type CertificateType,
  type ComplianceStatus,
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
  tenancies: Tenancy[];
}

function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-[10px] font-normal uppercase tracking-[0.28em] text-leather">
          {title}
        </h2>
        <div className="mt-3 h-px w-16 bg-gold/80" aria-hidden />
      </div>
      {action}
    </div>
  );
}

function statusBadgeLabel(status: ComplianceStatus) {
  if (status === "green") return "Compliant";
  if (status === "amber") return "Expiring Soon";
  return "Overdue";
}

function statusBadgeClass(status: ComplianceStatus) {
  if (status === "green") return "bg-compliant/15 text-compliant";
  if (status === "amber") return "bg-attention/15 text-attention";
  return "bg-urgent/15 text-urgent";
}

function documentFilename(path: string | null) {
  if (!path) return "Certificate document";
  const name = path.split("/").pop();
  return name?.replace(/^\d+-/, "") ?? "Certificate document";
}

function pickFeaturedTenancy(tenancies: Tenancy[]): Tenancy | null {
  const eligible = tenancies.filter((tenancy) => {
    const status = getTenancyStatus(tenancy);
    return status === "active" || status === "renewal_due";
  });

  if (eligible.length === 0) return null;

  return [...eligible].sort(
    (a, b) => getDaysUntilDate(a.end_date) - getDaysUntilDate(b.end_date)
  )[0];
}

function depositLabel(tenancy: Tenancy): string {
  if (tenancy.deposit_scheme === "none" || !tenancy.deposit_amount) {
    return "Not applicable";
  }
  if (isDepositProtectionOverdue(tenancy)) return "Unprotected";
  if (tenancy.deposit_protection_date) return "Protected";
  return "Unprotected";
}

export default function PropertyDetailView({
  property,
  certificates,
  assignments,
  directoryContractors,
  emailDraftsByCertId,
  documentPaths,
  tenancies,
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

  const compliantCount = certificates.filter(
    (cert) => getCertificateStatus(cert.expiry_date) === "green"
  ).length;
  const expiringCount = certificates.filter(
    (cert) => getCertificateStatus(cert.expiry_date) === "amber"
  ).length;
  const overdueCount = certificates.filter(
    (cert) => getCertificateStatus(cert.expiry_date) === "red"
  ).length;
  const attentionCount = expiringCount + overdueCount;

  const overallStatus: ComplianceStatus =
    certificates.length === 0
      ? "amber"
      : overdueCount > 0
        ? "red"
        : expiringCount > 0
          ? "amber"
          : "green";

  const statusHeadline =
    certificates.length === 0
      ? "No Certificates Yet"
      : attentionCount === 0
        ? "All Compliant"
        : attentionCount === 1
          ? "1 Certificate Needs Attention"
          : `${attentionCount} Certificates Need Attention`;

  const statusBorderClass =
    overallStatus === "green"
      ? "border-l-compliant"
      : overallStatus === "amber"
        ? "border-l-attention"
        : "border-l-urgent";

  const statusTextClass =
    overallStatus === "green"
      ? "text-compliant"
      : overallStatus === "amber"
        ? "text-attention"
        : "text-urgent";

  const documentsWithCerts = certificates.filter((cert) => cert.documentUrl);
  const featuredTenancy = pickFeaturedTenancy(tenancies);

  const activeDraft = draftCertId ? emailDraftsByCertId[draftCertId] ?? null : null;
  const activeCert = draftCertId
    ? certificates.find((cert) => cert.id === draftCertId)
    : null;

  const bedroomLabel =
    property.bedrooms === 1 ? "1 bedroom" : `${property.bedrooms} bedrooms`;

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
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-vanilla">
      {/* Burgundy header band — flush under fixed nav (same raspberry as TopNav) */}
      <header
        className={`${appUnderNavClassName} bg-raspberry px-5 pb-8 sm:px-12 lg:px-16`}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl tracking-wide text-dusty-cream sm:text-3xl lg:text-4xl">
              {property.address}
            </h1>
            <p className="mt-2 text-sm italic text-dusty-cream/80">
              {PROPERTY_TYPE_LABELS[property.property_type]} · {bedroomLabel}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href={`/properties/${property.id}/edit`}
              className="inline-flex min-h-10 items-center justify-center border border-dusty-cream/50 px-5 text-[11px] font-normal uppercase tracking-[0.1em] text-dusty-cream transition hover:border-dusty-cream hover:bg-dusty-cream/10"
            >
              Edit Property
            </Link>
            <button
              type="button"
              onClick={() => setConfirmDeleteProperty(true)}
              className="inline-flex min-h-10 items-center justify-center border border-dusty-cream/50 px-5 text-[11px] font-normal uppercase tracking-[0.1em] text-dusty-cream transition hover:border-dusty-cream hover:bg-dusty-cream/10"
            >
              Delete Property
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-leather/10 bg-greige px-5 py-3 sm:px-12 lg:px-16"
      >
        <ol className="mx-auto flex max-w-6xl flex-wrap items-center gap-1.5 text-[12px] font-light text-gold-readable">
          <li>
            <Link href="/compliance" className="transition hover:text-gold">
              ← Dashboard
            </Link>
          </li>
          <li aria-hidden className="text-gold/50">
            /
          </li>
          <li>
            <Link href="/compliance" className="transition hover:text-gold">
              Properties
            </Link>
          </li>
          <li aria-hidden className="text-gold/50">
            /
          </li>
          <li className="truncate text-gold">{property.address}</li>
        </ol>
      </nav>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-12 lg:px-16">
        {/* Overall status card */}
        <section
          className={`flex flex-col gap-6 border border-taupe border-l-4 bg-dune px-6 py-6 shadow-[0_2px_8px_rgba(68,58,53,0.06)] sm:flex-row sm:items-center sm:justify-between sm:px-8 ${statusBorderClass}`}
        >
          <p className={`font-serif text-2xl tracking-wide sm:text-3xl ${statusTextClass}`}>
            {statusHeadline}
          </p>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-leather">
                Tracked
              </dt>
              <dd className="mt-1 font-serif text-xl text-umber">
                {certificates.length}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-leather">
                Compliant
              </dt>
              <dd className="mt-1 font-serif text-xl text-compliant">
                {compliantCount}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-leather">
                Expiring
              </dt>
              <dd className="mt-1 font-serif text-xl text-attention">
                {expiringCount}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.14em] text-leather">
                Overdue
              </dt>
              <dd className="mt-1 font-serif text-xl text-urgent">
                {overdueCount}
              </dd>
            </div>
          </dl>
        </section>

        {/* Certificates */}
        <section className="mt-16">
          <SectionHeading
            title="Compliance Certificates"
            action={
              <Link
                href={`/properties/${property.id}/certificates/new`}
                className="inline-flex min-h-10 items-center justify-center bg-raspberry px-5 py-2.5 text-[11px] font-normal uppercase tracking-[0.12em] text-dusty-cream transition hover:bg-raspberry-dark"
              >
                ＋ Add Certificate
              </Link>
            }
          />

          {certificates.length === 0 ? (
            <div className="mt-8 border border-taupe bg-dune px-6 py-12 text-center shadow-[0_2px_8px_rgba(68,58,53,0.06)]">
              <p className="font-serif text-xl tracking-wide text-umber">
                No certificates added yet
              </p>
              <Link
                href={`/properties/${property.id}/certificates/new`}
                className="mt-6 inline-flex min-h-11 items-center justify-center bg-raspberry px-6 py-3 text-[11px] font-normal uppercase tracking-[0.12em] text-dusty-cream transition hover:bg-raspberry-dark"
              >
                Add Your First Certificate +
              </Link>
            </div>
          ) : (
            <ul className="mt-8 space-y-4">
              {certificates.map((cert) => {
                const status = getCertificateStatus(cert.expiry_date);
                const contractor = contractorsByType.get(cert.certificate_type);
                const hasDraft = Boolean(emailDraftsByCertId[cert.id]);

                return (
                  <li
                    key={cert.id}
                    className="grid gap-5 border border-taupe bg-dune px-5 py-5 shadow-[0_2px_8px_rgba(68,58,53,0.06)] sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6 sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="font-serif text-lg tracking-wide text-text">
                        {CERTIFICATE_LABELS[cert.certificate_type]}
                      </p>
                      <p className="mt-2 text-sm text-leather">
                        Issued {formatDate(cert.issue_date)}
                        <span className="mx-2 text-leather/30">·</span>
                        Expires {formatDate(cert.expiry_date)}
                      </p>
                    </div>

                    <div className="flex sm:justify-center">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 text-[10px] font-normal uppercase tracking-[0.12em] ${statusBadgeClass(status)}`}
                      >
                        {statusBadgeLabel(status)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <Link
                        href={`/properties/${property.id}/certificates/${cert.id}/edit`}
                        className="inline-flex min-h-9 items-center justify-center border border-leather/30 px-4 text-[11px] font-normal uppercase tracking-[0.1em] text-leather transition hover:border-leather hover:text-text"
                      >
                        Edit
                      </Link>
                      {contractor && hasDraft ? (
                        <button
                          type="button"
                          onClick={() => setDraftCertId(cert.id)}
                          className="inline-flex min-h-9 items-center justify-center bg-raspberry px-4 text-[11px] font-normal uppercase tracking-[0.1em] text-dusty-cream transition hover:bg-raspberry-dark"
                        >
                          Draft Email
                        </button>
                      ) : (
                        <a
                          href="#contractors"
                          className="inline-flex min-h-9 items-center justify-center border border-gold px-4 text-[11px] font-normal uppercase tracking-[0.1em] text-gold-readable transition hover:bg-gold/10"
                        >
                          Add Contractor
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Contractors */}
        <section id="contractors" className="mt-16 scroll-mt-24">
          <PropertyContractors
            propertyId={property.id}
            initialAssignments={assignments}
            directoryContractors={directoryContractors}
          />
        </section>

        {/* Documents */}
        <section className="mt-16">
          <SectionHeading title="Documents" />

          {documentsWithCerts.length === 0 ? (
            <p className="mt-8 text-sm leading-relaxed text-leather">
              No documents uploaded. Documents are added when you create
              certificates.
            </p>
          ) : (
            <ul className="mt-8 space-y-3">
              {documentsWithCerts.map((cert) => (
                <li
                  key={cert.id}
                  className="flex flex-wrap items-center justify-between gap-4 border border-taupe bg-dune px-5 py-4 shadow-[0_2px_8px_rgba(68,58,53,0.06)] sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <FileText
                      className="h-5 w-5 shrink-0 text-leather/60"
                      strokeWidth={1.25}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="truncate font-serif text-base tracking-wide text-text">
                        {documentFilename(cert.document_path)}
                      </p>
                      <p className="mt-0.5 text-xs text-leather">
                        {CERTIFICATE_LABELS[cert.certificate_type]}
                      </p>
                    </div>
                  </div>
                  <a
                    href={cert.documentUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 items-center border border-leather/30 px-4 text-[11px] font-normal uppercase tracking-[0.1em] text-leather transition hover:border-leather hover:text-text"
                  >
                    View
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Notes */}
        <section className="mt-16 border-t border-leather/10 pt-16">
          <PropertyNotes
            propertyId={property.id}
            initialNotes={property.notes}
            compact
          />
        </section>

        {/* Tenancy */}
        <section className="mt-16 border-t border-leather/10 pt-16">
          <SectionHeading title="Tenancy" />

          {!featuredTenancy ? (
            <p className="mt-8 text-sm leading-relaxed text-leather">
              No active tenancy.{" "}
              <Link
                href="/tenancy/new"
                className="font-normal text-navy transition hover:underline"
              >
                Add Tenancy →
              </Link>
            </p>
          ) : (
            <div className="mt-8 border border-l-4 border-taupe border-l-navy bg-dune px-6 py-6 shadow-[0_2px_8px_rgba(68,58,53,0.06)] sm:px-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-xl tracking-wide text-text">
                    {featuredTenancy.tenant_names}
                  </p>
                  <p className="mt-2 text-sm text-leather">
                    Ends {formatTenancyDate(featuredTenancy.end_date)} ·{" "}
                    {formatCurrency(Number(featuredTenancy.monthly_rent))}/month
                  </p>
                  <p
                    className={`mt-2 text-sm ${
                      depositLabel(featuredTenancy) === "Unprotected"
                        ? "text-urgent"
                        : depositLabel(featuredTenancy) === "Protected"
                          ? "text-compliant"
                          : "text-leather"
                    }`}
                  >
                    Deposit: {depositLabel(featuredTenancy)}
                  </p>
                </div>
                <Link
                  href={`/tenancy/${featuredTenancy.id}`}
                  className="inline-flex min-h-9 items-center border border-navy/30 px-4 text-[11px] font-normal uppercase tracking-[0.1em] text-navy transition hover:bg-navy/5"
                >
                  View Tenancy
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>

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
        <p className="mx-auto mt-4 max-w-6xl border border-urgent/30 bg-urgent-light px-4 py-3 text-sm text-urgent sm:px-12 lg:px-16">
          {deletePropertyError}
        </p>
      ) : null}
    </div>
  );
}
