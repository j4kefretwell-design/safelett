"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  btnOutlineClassName,
  btnPrimaryClassName,
  btnSecondaryClassName,
  capsLabelClassName,
  cardClassName,
  labelClassName,
  linkClassName,
  mutedTextClassName,
  sectionTitleClassName,
  selectClassName,
} from "@/lib/ui";
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
  const [showForm, setShowForm] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState("");
  const [selectedCertificateType, setSelectedCertificateType] =
    useState<CertificateType | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignedTypes = useMemo(
    () => new Set(assignments.map((assignment) => assignment.certificate_type)),
    [assignments]
  );

  const sortedAssignments = useMemo(
    () =>
      [...assignments].sort((a, b) =>
        CERTIFICATE_LABELS[a.certificate_type].localeCompare(
          CERTIFICATE_LABELS[b.certificate_type]
        )
      ),
    [assignments]
  );

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

  function openForm() {
    const firstContractor = linkableContractors[0];
    setSelectedContractorId(firstContractor?.id ?? "");
    const firstType = firstContractor?.certificate_types.find(
      (type) => !assignedTypes.has(type)
    );
    setSelectedCertificateType(firstType ?? "");
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
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
    closeForm();
    router.refresh();
  }

  async function handleUnlink(assignmentId: string) {
    if (!window.confirm("Remove this contractor link from the property?")) {
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("property_contractors")
      .delete()
      .eq("id", assignmentId);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return;
    }

    setAssignments((current) =>
      current.filter((assignment) => assignment.id !== assignmentId)
    );
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-14">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={sectionTitleClassName}>Contractors</h2>
          <p className={`${mutedTextClassName} mt-2 max-w-2xl`}>
            Link contractors from your directory to this property. Their details
            are included in expiry alerts and email drafts.
          </p>
        </div>
        {linkableContractors.length > 0 && !showForm && (
          <button
            type="button"
            onClick={openForm}
            className={btnSecondaryClassName}
          >
            Link Contractor
          </button>
        )}
      </div>

      {directoryContractors.length === 0 && (
        <div className={`${cardClassName} mb-6 px-6 py-8 sm:px-8`}>
          <p className={mutedTextClassName}>
            Add contractors to your directory first, then link them here.
          </p>
          <Link href="/contractors/new" className={`${linkClassName} mt-4 inline-block`}>
            Add Contractor to Directory →
          </Link>
        </div>
      )}

      {showForm && (
        <div className={`${cardClassName} mb-6 p-6 sm:p-8`}>
          <h3 className="font-serif text-lg tracking-wide text-text">
            Link a Contractor
          </h3>

          <div className="mt-6 space-y-6">
            <div>
              <label htmlFor="link-contractor" className={labelClassName}>
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
                className={selectClassName}
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
              <label htmlFor="link-certificate-type" className={labelClassName}>
                Certificate type
              </label>
              <select
                id="link-certificate-type"
                value={selectedCertificateType}
                onChange={(event) =>
                  setSelectedCertificateType(
                    event.target.value as CertificateType
                  )
                }
                disabled={!selectedContractorId}
                className={selectClassName}
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

          {error && (
            <p className="mt-4 border border-urgent/30 bg-urgent-light px-4 py-3 text-sm text-urgent">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={handleLink}
              disabled={loading}
              className={`${btnPrimaryClassName} w-full sm:w-auto`}
            >
              {loading ? "Linking..." : "Link Contractor"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={loading}
              className={`${btnOutlineClassName} w-full sm:w-auto`}
            >
              Cancel
            </button>
            <Link
              href="/contractors/new"
              className={`${linkClassName} self-center text-sm`}
            >
              Add new to directory →
            </Link>
          </div>
        </div>
      )}

      {sortedAssignments.length === 0 ? (
        <div className={`${cardClassName} px-6 py-12 text-center sm:px-8`}>
          <p className={mutedTextClassName}>
            No contractors linked to this property yet.
          </p>
        </div>
      ) : (
        <div className={`${cardClassName} divide-y divide-leather/15`}>
          {sortedAssignments.map((assignment) => {
            const contractor = assignment.contractors;
            return (
              <div
                key={assignment.id}
                className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"
              >
                <div className="min-w-0">
                  <p className={capsLabelClassName}>
                    {CERTIFICATE_LABELS[assignment.certificate_type]}
                  </p>
                  <p className="mt-2 font-serif text-lg tracking-wide text-text">
                    {contractor.name}
                  </p>
                  <p className="mt-1 text-base leading-relaxed text-leather">
                    {contractor.company_name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <a
                      href={`tel:${contractor.phone.replace(/\s/g, "")}`}
                      className={linkClassName}
                    >
                      {contractor.phone}
                    </a>
                    <a href={`mailto:${contractor.email}`} className={linkClassName}>
                      {contractor.email}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnlink(assignment.id)}
                  disabled={loading}
                  className={`${btnOutlineClassName} shrink-0 px-4 py-2 text-sm`}
                >
                  Unlink
                </button>
              </div>
            );
          })}
        </div>
      )}

      {error && !showForm && (
        <p className="mt-4 border border-urgent/30 bg-urgent-light px-4 py-3 text-sm text-urgent">
          {error}
        </p>
      )}
    </div>
  );
}
