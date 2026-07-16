"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import {
  CERTIFICATE_LABELS,
  type CertificateType,
  type Contractor,
  type PropertyContractorWithDetails,
} from "@/lib/types";

interface PropertyContractorsProps {
  propertyId: string;
  initialAssignments: PropertyContractorWithDetails[];
  directoryContractors: Contractor[];
}

export default function PropertyContractors({
  propertyId,
  initialAssignments,
  directoryContractors,
}: PropertyContractorsProps) {
  const router = useRouter();
  const [assignments, setAssignments] =
    useState<PropertyContractorWithDetails[]>(initialAssignments);
  const [showModal, setShowModal] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState("");
  const [selectedCertificateType, setSelectedCertificateType] =
    useState<CertificateType | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlinkContractorId, setUnlinkContractorId] = useState<string | null>(
    null
  );

  const assignedTypes = useMemo(
    () => new Set(assignments.map((assignment) => assignment.certificate_type)),
    [assignments]
  );

  const contractorsById = useMemo(() => {
    const map = new Map<string, Contractor>();
    for (const contractor of directoryContractors) {
      map.set(contractor.id, contractor);
    }
    return map;
  }, [directoryContractors]);

  const groupedAssignments = useMemo(() => {
    const groups = new Map<string, CertificateType[]>();
    for (const assignment of assignments) {
      const contractorId = assignment.contractor_id;
      const existing = groups.get(contractorId) ?? [];
      existing.push(assignment.certificate_type);
      groups.set(contractorId, existing);
    }
    return groups;
  }, [assignments]);

  const selectedContractor = directoryContractors.find(
    (contractor) => contractor.id === selectedContractorId
  );

  const availableCertificateTypes = useMemo(() => {
    if (!selectedContractor) return [];
    return selectedContractor.certificate_types.filter(
      (type) => !assignedTypes.has(type)
    );
  }, [assignedTypes, selectedContractor]);

  const linkableContractors = useMemo(
    () =>
      directoryContractors.filter((contractor) =>
        contractor.certificate_types.some((type) => !assignedTypes.has(type))
      ),
    [assignedTypes, directoryContractors]
  );

  function openModal() {
    const firstContractor = linkableContractors[0];
    setSelectedContractorId(firstContractor?.id ?? "");
    const firstType = firstContractor?.certificate_types.find(
      (type) => !assignedTypes.has(type)
    );
    setSelectedCertificateType(firstType ?? "");
    setError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setError(null);
  }

  async function handleLink() {
    if (!selectedContractorId || !selectedCertificateType) {
      setError("Select a contractor and certificate type.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("property_contractors")
      .insert({
        property_id: propertyId,
        contractor_id: selectedContractorId,
        certificate_type: selectedCertificateType,
        updated_at: new Date().toISOString(),
      })
      .select("*, contractors(*)")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setAssignments((current) => [
      ...current,
      data as PropertyContractorWithDetails,
    ]);
    setLoading(false);
    closeModal();
    router.refresh();
  }

  async function handleUnlinkContractor(contractorId: string) {
    setLoading(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("property_contractors")
      .delete()
      .eq("property_id", propertyId)
      .eq("contractor_id", contractorId);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      setUnlinkContractorId(null);
      return;
    }

    setAssignments((current) =>
      current.filter((assignment) => assignment.contractor_id !== contractorId)
    );
    setLoading(false);
    setUnlinkContractorId(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[10px] font-normal uppercase tracking-[0.28em] text-leather">
            Contractors
          </h2>
          <div className="mt-3 h-px w-16 bg-gold/80" aria-hidden />
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-leather">
            Link contractors to enable automatic email drafting when certificates
            expire.
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          disabled={
            directoryContractors.length === 0 || linkableContractors.length === 0
          }
          className="inline-flex min-h-10 items-center justify-center bg-navy px-5 py-2.5 text-[11px] font-normal uppercase tracking-[0.12em] text-dusty-cream transition hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          ＋ Add Contractor
        </button>
      </div>

      {directoryContractors.length === 0 ? (
        <div className="mt-8 border border-leather/15 bg-white px-6 py-10 shadow-[0_2px_8px_rgba(61,43,31,0.06)]">
          <p className="font-serif text-lg tracking-wide text-text">
            No contractors in your directory
          </p>
          <p className="mt-2 text-sm leading-relaxed text-leather">
            Add contractors to your directory first, then link them here for email
            drafting.
          </p>
          <Link
            href="/contractors/new"
            className="mt-6 inline-flex min-h-10 items-center justify-center bg-navy px-5 py-2.5 text-[11px] font-normal uppercase tracking-[0.12em] text-dusty-cream transition hover:bg-navy-dark"
          >
            ＋ Add to Directory
          </Link>
        </div>
      ) : groupedAssignments.size === 0 ? (
        <div className="mt-8 border border-leather/15 bg-white px-6 py-10 shadow-[0_2px_8px_rgba(61,43,31,0.06)]">
          <p className="font-serif text-lg tracking-wide text-text">
            No contractors linked
          </p>
          <p className="mt-2 text-sm leading-relaxed text-leather">
            Link a contractor from your directory to draft renewal emails when
            certificates are due.
          </p>
          <button
            type="button"
            onClick={openModal}
            className="mt-6 inline-flex min-h-10 items-center justify-center bg-navy px-5 py-2.5 text-[11px] font-normal uppercase tracking-[0.12em] text-dusty-cream transition hover:bg-navy-dark"
          >
            ＋ Add Contractor
          </button>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {Array.from(groupedAssignments.entries()).map(([contractorId, types]) => {
            const contractor = contractorsById.get(contractorId);
            if (!contractor) return null;

            return (
              <li
                key={contractorId}
                className="flex flex-col gap-4 border border-leather/15 bg-white px-5 py-5 shadow-[0_2px_8px_rgba(61,43,31,0.06)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0 sm:flex-1">
                  <p className="font-serif text-lg tracking-wide text-text">
                    {contractor.name}
                  </p>
                  <p className="mt-1 text-sm font-normal text-leather">
                    {contractor.company_name}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-center">
                  {types
                    .slice()
                    .sort((a, b) =>
                      CERTIFICATE_LABELS[a].localeCompare(CERTIFICATE_LABELS[b])
                    )
                    .map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center bg-navy/8 px-2.5 py-1 text-[10px] font-normal uppercase tracking-[0.1em] text-navy"
                      >
                        {CERTIFICATE_LABELS[type]}
                      </span>
                    ))}
                </div>

                <div className="flex items-center gap-4 sm:shrink-0">
                  <Link
                    href={`/contractors/${contractorId}/edit`}
                    className="inline-flex min-h-9 items-center border border-leather/30 px-4 text-[11px] font-normal uppercase tracking-[0.1em] text-leather transition hover:border-leather hover:text-text"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setUnlinkContractorId(contractorId)}
                    className="text-[11px] font-light uppercase tracking-[0.1em] text-leather/60 transition hover:text-urgent"
                  >
                    Unlink
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error && !showModal ? (
        <p className="mt-4 border border-urgent/30 bg-urgent-light px-4 py-3 text-sm text-urgent">
          {error}
        </p>
      ) : null}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="link-contractor-title"
            className="assistant-composer-modal relative z-[1] w-full max-w-md bg-[#F0ECE1] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:p-8"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={closeModal}
              className="absolute right-5 top-5 text-xl font-light leading-none text-gold-readable transition hover:text-gold"
            >
              ×
            </button>

            <h3
              id="link-contractor-title"
              className="pr-8 font-serif text-2xl tracking-wide text-umber"
            >
              Link Contractor
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-leather">
              Choose a contractor and the certificate type they&apos;ll handle at
              this property.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="link-contractor"
                  className="mb-2 block text-[10px] font-normal uppercase tracking-[0.22em] text-leather"
                >
                  Contractor
                </label>
                <select
                  id="link-contractor"
                  value={selectedContractorId}
                  onChange={(event) => {
                    const contractorId = event.target.value;
                    setSelectedContractorId(contractorId);
                    const contractor = directoryContractors.find(
                      (item) => item.id === contractorId
                    );
                    const nextType = contractor?.certificate_types.find(
                      (type) => !assignedTypes.has(type)
                    );
                    setSelectedCertificateType(nextType ?? "");
                  }}
                  className="w-full border border-leather/30 bg-white px-3 py-3 text-sm text-text outline-none focus:border-gold"
                >
                  <option value="">Select a contractor</option>
                  {linkableContractors.map((contractor) => (
                    <option key={contractor.id} value={contractor.id}>
                      {contractor.name} · {contractor.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="link-certificate-type"
                  className="mb-2 block text-[10px] font-normal uppercase tracking-[0.22em] text-leather"
                >
                  Certificate type
                </label>
                <select
                  id="link-certificate-type"
                  value={selectedCertificateType}
                  onChange={(event) =>
                    setSelectedCertificateType(event.target.value as CertificateType)
                  }
                  disabled={!selectedContractorId}
                  className="w-full border border-leather/30 bg-white px-3 py-3 text-sm text-text outline-none focus:border-gold disabled:opacity-50"
                >
                  <option value="">Select certificate type</option>
                  {availableCertificateTypes.map((type) => (
                    <option key={type} value={type}>
                      {CERTIFICATE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error ? (
              <p className="mt-4 border border-urgent/30 bg-urgent-light px-4 py-3 text-sm text-urgent">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleLink}
                disabled={loading}
                className="flex h-11 w-full items-center justify-center bg-navy text-sm uppercase tracking-[0.12em] text-dusty-cream transition hover:bg-navy-dark disabled:opacity-50"
              >
                {loading ? "Linking..." : "Link Contractor"}
              </button>
              <Link
                href="/contractors/new"
                className="text-center text-sm text-gold-readable transition hover:text-gold"
              >
                Add new to directory →
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={unlinkContractorId != null}
        title="Unlink contractor?"
        message="Remove this contractor from the property? Email drafts for their certificate types will no longer be available."
        confirmLabel="Confirm"
        loading={loading}
        onConfirm={() => {
          if (unlinkContractorId) void handleUnlinkContractor(unlinkContractorId);
        }}
        onCancel={() => setUnlinkContractorId(null)}
      />
    </>
  );
}
