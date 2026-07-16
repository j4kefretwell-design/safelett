"use client";

import Link from "next/link";
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
          <h2 className="font-serif text-xl tracking-wide text-text">Contractors</h2>
          <div className="mt-3 h-px w-16 bg-gold/80" aria-hidden />
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-leather">
            Link contractors from your directory to this property. Once linked,
            Fretwell &amp; Co can draft booking emails when certificates are due.
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          disabled={
            directoryContractors.length === 0 || linkableContractors.length === 0
          }
          className="text-sm text-gold-readable transition hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Add Contractor
        </button>
      </div>

      {directoryContractors.length === 0 && (
        <p className="mt-8 text-sm leading-relaxed text-leather">
          Add contractors to your directory first, then link them here.{" "}
          <Link href="/contractors/new" className="text-gold-readable transition hover:text-gold">
            Add to directory →
          </Link>
        </p>
      )}

      {groupedAssignments.size === 0 && directoryContractors.length > 0 ? (
        <p className="mt-8 text-sm leading-relaxed text-leather">
          No contractors linked yet. Click &ldquo;+ Add Contractor&rdquo; to link
          someone from your directory.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-leather/15 border border-leather/15 bg-white/50">
          {Array.from(groupedAssignments.entries()).map(([contractorId, types]) => {
            const contractor = contractorsById.get(contractorId);
            if (!contractor) return null;

            return (
              <li
                key={contractorId}
                className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0">
                  <p className="font-serif text-lg tracking-wide text-text">
                    {contractor.name}
                  </p>
                  <p className="mt-1 text-sm text-leather">{contractor.company_name}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-leather/80">
                    {types
                      .map((type) => CERTIFICATE_LABELS[type])
                      .sort((a, b) => a.localeCompare(b))
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/contractors/${contractorId}/edit`}
                    className="text-sm text-gold-readable transition hover:text-gold"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setUnlinkContractorId(contractorId)}
                    className="text-sm text-leather/70 transition hover:text-urgent"
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
            className="assistant-composer-modal relative z-[1] w-full max-w-md rounded-t-[20px] bg-[#F0ECE1] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:rounded-[20px] sm:p-8"
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
              Choose a contractor from your directory and the certificate type
              they&apos;ll handle at this property.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="link-contractor" className="mb-2 block text-[10px] font-normal uppercase tracking-[0.22em] text-leather">
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
                  className="w-full border border-leather/30 bg-white/60 px-3 py-3 text-sm text-text outline-none focus:border-gold"
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
                <label htmlFor="link-certificate-type" className="mb-2 block text-[10px] font-normal uppercase tracking-[0.22em] text-leather">
                  Certificate type
                </label>
                <select
                  id="link-certificate-type"
                  value={selectedCertificateType}
                  onChange={(event) =>
                    setSelectedCertificateType(event.target.value as CertificateType)
                  }
                  disabled={!selectedContractorId}
                  className="w-full border border-leather/30 bg-white/60 px-3 py-3 text-sm text-text outline-none focus:border-gold disabled:opacity-50"
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
                className="flex h-11 w-full items-center justify-center bg-raspberry text-sm uppercase tracking-[0.12em] text-dusty-cream transition hover:bg-raspberry-dark disabled:opacity-50"
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
