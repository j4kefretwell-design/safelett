"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  btnDangerClassName,
  btnPrimaryClassName,
  btnSecondaryClassName,
  cardClassName,
  inputClassName,
  labelClassName,
  linkClassName,
  mutedTextClassName,
  sectionTitleClassName,
  selectClassName,
} from "@/lib/ui";
import {
  CERTIFICATE_LABELS,
  CERTIFICATE_TYPES,
  type CertificateType,
  type PropertyContractor,
} from "@/lib/types";

interface PropertyContractorsProps {
  propertyId: string;
  initialContractors: PropertyContractor[];
}

interface ContractorFormState {
  certificateType: CertificateType;
  name: string;
  companyName: string;
  phone: string;
  email: string;
}

const emptyForm = (certificateType: CertificateType): ContractorFormState => ({
  certificateType,
  name: "",
  companyName: "",
  phone: "",
  email: "",
});

export default function PropertyContractors({
  propertyId,
  initialContractors,
}: PropertyContractorsProps) {
  const router = useRouter();
  const [contractors, setContractors] =
    useState<PropertyContractor[]>(initialContractors);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContractorFormState>(
    emptyForm(CERTIFICATE_TYPES[0])
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usedCertificateTypes = useMemo(
    () => new Set(contractors.map((contractor) => contractor.certificate_type)),
    [contractors]
  );

  const availableCertificateTypes = useMemo(
    () =>
      CERTIFICATE_TYPES.filter(
        (type) => !usedCertificateTypes.has(type) || form.certificateType === type
      ),
    [form.certificateType, usedCertificateTypes]
  );

  const sortedContractors = useMemo(
    () =>
      [...contractors].sort((a, b) =>
        CERTIFICATE_LABELS[a.certificate_type].localeCompare(
          CERTIFICATE_LABELS[b.certificate_type]
        )
      ),
    [contractors]
  );

  function openAddForm() {
    const nextType =
      CERTIFICATE_TYPES.find((type) => !usedCertificateTypes.has(type)) ??
      CERTIFICATE_TYPES[0];

    setEditingId(null);
    setForm(emptyForm(nextType));
    setError(null);
    setShowForm(true);
  }

  function openEditForm(contractor: PropertyContractor) {
    setEditingId(contractor.id);
    setForm({
      certificateType: contractor.certificate_type,
      name: contractor.name,
      companyName: contractor.company_name,
      phone: contractor.phone,
      email: contractor.email,
    });
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  async function handleSave() {
    setError(null);

    const name = form.name.trim();
    const companyName = form.companyName.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();

    if (!name || !companyName || !phone || !email) {
      setError("Please fill in all contractor details.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const payload = {
      property_id: propertyId,
      certificate_type: form.certificateType,
      name,
      company_name: companyName,
      phone,
      email,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data, error: updateError } = await supabase
        .from("property_contractors")
        .update(payload)
        .eq("id", editingId)
        .select("*")
        .single();

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setContractors((current) =>
        current.map((contractor) =>
          contractor.id === editingId ? (data as PropertyContractor) : contractor
        )
      );
    } else {
      const { data, error: insertError } = await supabase
        .from("property_contractors")
        .insert(payload)
        .select("*")
        .single();

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      setContractors((current) => [...current, data as PropertyContractor]);
    }

    setLoading(false);
    closeForm();
    router.refresh();
  }

  async function handleDelete() {
    if (!editingId) {
      return;
    }

    if (
      !window.confirm(
        "Remove this contractor from the property? You can add them again later."
      )
    ) {
      return;
    }

    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("property_contractors")
      .delete()
      .eq("id", editingId);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return;
    }

    setContractors((current) =>
      current.filter((contractor) => contractor.id !== editingId)
    );
    setLoading(false);
    closeForm();
    router.refresh();
  }

  const canAddMore = usedCertificateTypes.size < CERTIFICATE_TYPES.length;

  return (
    <div className="mt-14">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className={sectionTitleClassName}>Contractors</h2>
          <p className={`${mutedTextClassName} mt-2 max-w-2xl`}>
            Save a contractor for each certificate type — for example, a gas
            engineer for Gas Safety or an electrician for EICR. Their details
            are included in expiry alert emails.
          </p>
        </div>
        {canAddMore && !showForm && (
          <button
            type="button"
            onClick={openAddForm}
            className={btnSecondaryClassName}
          >
            Add Contractor
          </button>
        )}
      </div>

      {showForm && (
        <div className={`${cardClassName} mb-6 p-6 sm:p-8`}>
          <h3 className="font-serif text-lg font-medium text-charcoal">
            {editingId ? "Edit Contractor" : "Add Contractor"}
          </h3>

          <div className="mt-6 space-y-6">
            <div>
              <label htmlFor="contractor-certificate-type" className={labelClassName}>
                Certificate type
              </label>
              <select
                id="contractor-certificate-type"
                value={form.certificateType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    certificateType: event.target.value as CertificateType,
                  }))
                }
                disabled={Boolean(editingId)}
                className={selectClassName}
              >
                {(editingId ? CERTIFICATE_TYPES : availableCertificateTypes).map(
                  (type) => (
                    <option key={type} value={type}>
                      {CERTIFICATE_LABELS[type]}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label htmlFor="contractor-name" className={labelClassName}>
                Contact name
              </label>
              <input
                id="contractor-name"
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className={inputClassName}
                placeholder="e.g. James Mitchell"
              />
            </div>

            <div>
              <label htmlFor="contractor-company" className={labelClassName}>
                Company name
              </label>
              <input
                id="contractor-company"
                type="text"
                value={form.companyName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    companyName: event.target.value,
                  }))
                }
                className={inputClassName}
                placeholder="e.g. Mitchell Gas Services Ltd"
              />
            </div>

            <div>
              <label htmlFor="contractor-phone" className={labelClassName}>
                Phone number
              </label>
              <input
                id="contractor-phone"
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                className={inputClassName}
                placeholder="e.g. 07700 900123"
              />
            </div>

            <div>
              <label htmlFor="contractor-email" className={labelClassName}>
                Email address
              </label>
              <input
                id="contractor-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className={inputClassName}
                placeholder="e.g. james@mitchellgas.co.uk"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-[6px] border border-urgent/30 bg-urgent-light px-4 py-3 text-sm text-urgent">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className={btnPrimaryClassName}
            >
              {loading ? "Saving..." : "Save Contractor"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={loading}
              className={btnSecondaryClassName}
            >
              Cancel
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className={btnDangerClassName}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      {sortedContractors.length === 0 ? (
        <div className={`${cardClassName} px-6 py-12 text-center sm:px-8`}>
          <p className={mutedTextClassName}>
            No contractors saved yet. Add a contractor for each certificate type
            you work with regularly.
          </p>
          {canAddMore && !showForm && (
            <button
              type="button"
              onClick={openAddForm}
              className={`${btnPrimaryClassName} mt-6`}
            >
              Add Contractor
            </button>
          )}
        </div>
      ) : (
        <div className={`${cardClassName} divide-y divide-gold-light/40`}>
          {sortedContractors.map((contractor) => (
            <div
              key={contractor.id}
              className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-gold">
                  {CERTIFICATE_LABELS[contractor.certificate_type]}
                </p>
                <p className="mt-2 font-medium text-charcoal">
                  {contractor.name}
                  <span className="font-normal text-charcoal-muted">
                    {" "}
                    · {contractor.company_name}
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-charcoal-muted">
                  <a
                    href={`tel:${contractor.phone.replace(/\s/g, "")}`}
                    className={`${linkClassName} text-charcoal-muted hover:text-burgundy`}
                  >
                    {contractor.phone}
                  </a>
                  <a
                    href={`mailto:${contractor.email}`}
                    className={`${linkClassName} text-charcoal-muted hover:text-burgundy`}
                  >
                    {contractor.email}
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openEditForm(contractor)}
                className={`${btnSecondaryClassName} shrink-0`}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
