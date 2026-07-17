"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  const [selectedTypes, setSelectedTypes] = useState<CertificateType[]>([]);
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

  const checklistTypes = useMemo(() => {
    if (!selectedContractor) return [];
    return selectedContractor.certificate_types.filter(
      (type) => !assignedTypes.has(type)
    );
  }, [assignedTypes, selectedContractor]);

  useEffect(() => {
    if (!showModal) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowModal(false);
        setError(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  function openModal() {
    setSelectedContractorId("");
    setSelectedTypes([]);
    setError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setError(null);
    setSelectedContractorId("");
    setSelectedTypes([]);
  }

  function toggleType(type: CertificateType) {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type]
    );
  }

  async function handleAdd() {
    if (!selectedContractorId) {
      setError("Select a contractor.");
      return;
    }
    if (selectedTypes.length === 0) {
      setError("Choose at least one certificate type.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const rows = selectedTypes.map((certificate_type) => ({
      property_id: propertyId,
      contractor_id: selectedContractorId,
      certificate_type,
      updated_at: new Date().toISOString(),
    }));

    const { data, error: insertError } = await supabase
      .from("property_contractors")
      .insert(rows)
      .select("*, contractors(*)");

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setAssignments((current) => [
      ...current,
      ...((data ?? []) as PropertyContractorWithDetails[]),
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
          className="inline-flex min-h-10 items-center justify-center bg-raspberry px-5 py-2.5 text-[11px] font-normal uppercase tracking-[0.12em] text-dusty-cream transition hover:bg-raspberry-dark"
        >
          ＋ Add Contractor
        </button>
      </div>

      {groupedAssignments.size === 0 ? (
        <p className="mt-8 text-sm leading-relaxed text-leather">
          No contractors linked yet. Click &ldquo;＋ Add Contractor&rdquo; to get
          started.
        </p>
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
            aria-labelledby="add-contractor-title"
            className="assistant-composer-modal relative z-[1] max-h-[92dvh] w-full max-w-lg overflow-y-auto bg-[#F0ECE1] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:p-8"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={closeModal}
              className="absolute right-5 top-5 text-xl font-light leading-none text-gold-readable transition hover:text-gold"
            >
              ×
            </button>

            {directoryContractors.length === 0 ? (
              <>
                <h3
                  id="add-contractor-title"
                  className="pr-8 font-serif text-2xl tracking-wide text-umber"
                >
                  You haven&apos;t added any contractors yet.
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-leather">
                  Go to the Contractors section to add your gas engineer,
                  electrician or other tradespeople first. Then come back here to
                  link them to this property.
                </p>
                <div className="mt-8 flex flex-col gap-4">
                  <Link
                    href="/contractors"
                    className="flex h-11 w-full items-center justify-center bg-navy text-sm uppercase tracking-[0.12em] text-dusty-cream transition hover:bg-navy-dark"
                  >
                    Go to Contractors →
                  </Link>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-center text-sm font-light text-gold-readable transition hover:text-gold"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3
                  id="add-contractor-title"
                  className="pr-8 font-serif text-2xl tracking-wide text-umber"
                >
                  Add a Contractor to This Property
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-leather">
                  Select a contractor and choose which certificate types they
                  handle for this property. When a certificate is due, Fretwell
                  &amp; Co will use their details to draft a booking email.
                </p>

                <div className="mt-6 space-y-6">
                  <div>
                    <label
                      htmlFor="select-contractor"
                      className="mb-2 block text-[10px] font-normal uppercase tracking-[0.22em] text-leather"
                    >
                      Select Contractor
                    </label>
                    <select
                      id="select-contractor"
                      value={selectedContractorId}
                      onChange={(event) => {
                        setSelectedContractorId(event.target.value);
                        setSelectedTypes([]);
                        setError(null);
                      }}
                      className="w-full border border-leather/30 bg-white px-3 py-3 text-sm text-text outline-none focus:border-gold"
                    >
                      <option value="">Select Contractor</option>
                      {directoryContractors.map((contractor) => (
                        <option key={contractor.id} value={contractor.id}>
                          {contractor.name} · {contractor.company_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedContractorId ? (
                    <div>
                      <p className="mb-3 text-[10px] font-normal uppercase tracking-[0.22em] text-leather">
                        Which certificates do they handle at this property?
                      </p>
                      {checklistTypes.length === 0 ? (
                        <p className="text-sm leading-relaxed text-leather">
                          All of this contractor&apos;s certificate types are
                          already linked on this property.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {checklistTypes.map((type) => {
                            const checked = selectedTypes.includes(type);
                            return (
                              <li key={type}>
                                <label className="flex min-h-11 cursor-pointer items-center gap-3 border border-leather/15 bg-white/70 px-4 py-3 transition hover:border-leather/30">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleType(type)}
                                    className="h-4 w-4 accent-raspberry"
                                  />
                                  <span className="text-sm text-text">
                                    {CERTIFICATE_LABELS[type]}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </div>

                {error ? (
                  <p className="mt-4 border border-urgent/30 bg-urgent-light px-4 py-3 text-sm text-urgent">
                    {error}
                  </p>
                ) : null}

                <div className="mt-8 flex flex-col gap-4">
                  <button
                    type="button"
                    onClick={() => void handleAdd()}
                    disabled={
                      loading ||
                      !selectedContractorId ||
                      selectedTypes.length === 0
                    }
                    className="flex h-11 w-full items-center justify-center bg-raspberry text-sm uppercase tracking-[0.12em] text-dusty-cream transition hover:bg-raspberry-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add Contractor"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    className="text-center text-sm font-light text-gold-readable transition hover:text-gold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
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
