"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import {
  buildTenancyDocumentPath,
  getTenancyDocumentColumn,
  TENANCY_DOCUMENTS_BUCKET,
  validateTenancyFile,
  type TenancyDocumentField,
} from "@/lib/tenancy-documents";
import {
  DEPOSIT_SCHEME_LABELS,
  DEPOSIT_SCHEMES,
  TENANCY_TYPE_LABELS,
  TENANCY_TYPES,
  type DepositScheme,
  type Tenancy,
  type TenancyType,
} from "@/lib/tenancy";
import type { Property } from "@/lib/types";
import {
  btnPrimaryClassName,
  editorialFormCancelClassName,
  fileInputClassName,
  inputClassName,
  labelClassName,
  selectClassName,
  textareaClassName,
} from "@/lib/ui";

interface TenancyFormProps {
  tenancy?: Tenancy;
  properties?: Property[];
}

const CUSTOM_PROPERTY = "__custom__";

export default function TenancyForm({
  tenancy,
  properties: initialProperties = [],
}: TenancyFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const isEditing = Boolean(tenancy);

  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [tenantNames, setTenantNames] = useState(tenancy?.tenant_names ?? "");
  const [propertySelection, setPropertySelection] = useState(
    tenancy?.property_id ?? CUSTOM_PROPERTY
  );
  const [propertyAddress, setPropertyAddress] = useState(
    tenancy?.property_address ?? ""
  );
  const [tenancyType, setTenancyType] = useState<TenancyType>(
    tenancy?.tenancy_type ?? "assured_shorthold"
  );
  const [startDate, setStartDate] = useState(tenancy?.start_date ?? "");
  const [endDate, setEndDate] = useState(tenancy?.end_date ?? "");
  const [monthlyRent, setMonthlyRent] = useState(
    tenancy ? String(tenancy.monthly_rent) : ""
  );
  const [rentReviewDate, setRentReviewDate] = useState(
    tenancy?.rent_review_date ?? ""
  );
  const [depositAmount, setDepositAmount] = useState(
    tenancy?.deposit_amount != null ? String(tenancy.deposit_amount) : ""
  );
  const [depositScheme, setDepositScheme] = useState<DepositScheme>(
    tenancy?.deposit_scheme ?? "dps"
  );
  const [depositReference, setDepositReference] = useState(
    tenancy?.deposit_reference ?? ""
  );
  const [depositProtectionDate, setDepositProtectionDate] = useState(
    tenancy?.deposit_protection_date ?? ""
  );
  const [rightToRentChecked, setRightToRentChecked] = useState(
    tenancy?.right_to_rent_checked ?? false
  );
  const [rightToRentExpiry, setRightToRentExpiry] = useState(
    tenancy?.right_to_rent_expiry ?? ""
  );
  const [notes, setNotes] = useState(tenancy?.notes ?? "");
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [depositCertFile, setDepositCertFile] = useState<File | null>(null);
  const [rightToRentFile, setRightToRentFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialProperties.length > 0) return;

    const supabase = createClient();
    supabase
      .from("properties")
      .select("*")
      .order("address")
      .then(({ data }) => {
        setProperties((data ?? []) as Property[]);
      });
  }, [initialProperties.length]);

  useEffect(() => {
    if (propertySelection === CUSTOM_PROPERTY) return;
    const selected = properties.find((property) => property.id === propertySelection);
    if (selected) {
      setPropertyAddress(selected.address);
    }
  }, [propertySelection, properties]);

  async function uploadDocument(
    userId: string,
    tenancyId: string,
    field: TenancyDocumentField,
    file: File
  ) {
    const validationError = validateTenancyFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const supabase = createClient();
    const documentPath = buildTenancyDocumentPath(
      userId,
      tenancyId,
      field,
      file.name
    );

    const { error: uploadError } = await supabase.storage
      .from(TENANCY_DOCUMENTS_BUCKET)
      .upload(documentPath, file, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const column = getTenancyDocumentColumn(field);
    const { error: updateError } = await supabase
      .from("tenancies")
      .update({ [column]: documentPath, updated_at: new Date().toISOString() })
      .eq("id", tenancyId);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in.");
      setLoading(false);
      return;
    }

    if (!propertyAddress.trim()) {
      setError("Property address is required.");
      setLoading(false);
      return;
    }

    const payload = {
      tenant_names: tenantNames.trim(),
      property_address: propertyAddress.trim(),
      property_id: propertySelection === CUSTOM_PROPERTY ? null : propertySelection,
      tenancy_type: tenancyType,
      start_date: startDate,
      end_date: endDate,
      monthly_rent: Number(monthlyRent),
      rent_review_date: rentReviewDate || null,
      deposit_amount: depositAmount ? Number(depositAmount) : null,
      deposit_scheme: depositScheme,
      deposit_reference: depositReference.trim() || null,
      deposit_protection_date: depositProtectionDate || null,
      right_to_rent_checked: rightToRentChecked,
      right_to_rent_expiry: rightToRentExpiry || null,
      notes: notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    try {
      let tenancyId = tenancy?.id;

      if (isEditing && tenancy) {
        const { error: updateError } = await supabase
          .from("tenancies")
          .update(payload)
          .eq("id", tenancy.id);

        if (updateError) {
          throw new Error(updateError.message);
        }
      } else {
        const { data: created, error: insertError } = await supabase
          .from("tenancies")
          .insert({ ...payload, user_id: user.id })
          .select("id")
          .single();

        if (insertError || !created) {
          throw new Error(insertError?.message ?? "Failed to create tenancy.");
        }

        tenancyId = created.id;
      }

      if (!tenancyId) {
        throw new Error("Tenancy could not be saved.");
      }

      const uploads: Array<[TenancyDocumentField, File | null]> = [
        ["agreement", agreementFile],
        ["deposit_cert", depositCertFile],
        ["right_to_rent", rightToRentFile],
      ];

      for (const [field, file] of uploads) {
        if (file) {
          await uploadDocument(user.id, tenancyId, field, file);
        }
      }

      success(isEditing ? "Tenancy updated" : "Tenancy added");
      router.push(`/tenancy/${tenancyId}`);
      router.refresh();
    } catch (submitError) {
      toastError();
      setError(
        submitError instanceof Error ? submitError.message : "Unable to save tenancy."
      );
      setLoading(false);
    }
  }

  const inputTenancyClass = `${inputClassName} focus:border-navy`;
  const selectTenancyClass = `${selectClassName} focus:border-navy`;
  const textareaTenancyClass = `${textareaClassName} focus:border-navy`;

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="tenantNames" className={labelClassName}>
            Tenant Full Name(s)
          </label>
          <input
            id="tenantNames"
            required
            value={tenantNames}
            onChange={(event) => setTenantNames(event.target.value)}
            className={inputTenancyClass}
            placeholder="e.g. James & Sarah Thompson"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="propertySelection" className={labelClassName}>
            Property Address
          </label>
          <select
            id="propertySelection"
            value={propertySelection}
            onChange={(event) => setPropertySelection(event.target.value)}
            className={selectTenancyClass}
          >
            <option value={CUSTOM_PROPERTY}>Enter address manually</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.address}
              </option>
            ))}
          </select>
          {propertySelection === CUSTOM_PROPERTY && (
            <input
              required
              value={propertyAddress}
              onChange={(event) => setPropertyAddress(event.target.value)}
              className={`${inputTenancyClass} mt-4`}
              placeholder="Full property address"
            />
          )}
        </div>

        <div>
          <label htmlFor="tenancyType" className={labelClassName}>
            Tenancy Type
          </label>
          <select
            id="tenancyType"
            value={tenancyType}
            onChange={(event) => setTenancyType(event.target.value as TenancyType)}
            className={selectTenancyClass}
          >
            {TENANCY_TYPES.map((type) => (
              <option key={type} value={type}>
                {TENANCY_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="monthlyRent" className={labelClassName}>
            Monthly Rent (£)
          </label>
          <input
            id="monthlyRent"
            type="number"
            min="0"
            step="0.01"
            required
            value={monthlyRent}
            onChange={(event) => setMonthlyRent(event.target.value)}
            className={inputTenancyClass}
          />
        </div>

        <div>
          <label htmlFor="startDate" className={labelClassName}>
            Tenancy Start Date
          </label>
          <input
            id="startDate"
            type="date"
            required
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className={inputTenancyClass}
          />
        </div>

        <div>
          <label htmlFor="endDate" className={labelClassName}>
            Tenancy End Date
          </label>
          <input
            id="endDate"
            type="date"
            required
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className={inputTenancyClass}
          />
        </div>

        <div>
          <label htmlFor="rentReviewDate" className={labelClassName}>
            Rent Review Date
          </label>
          <input
            id="rentReviewDate"
            type="date"
            value={rentReviewDate}
            onChange={(event) => setRentReviewDate(event.target.value)}
            className={inputTenancyClass}
          />
        </div>

        <div>
          <label htmlFor="depositAmount" className={labelClassName}>
            Deposit Amount (£)
          </label>
          <input
            id="depositAmount"
            type="number"
            min="0"
            step="0.01"
            value={depositAmount}
            onChange={(event) => setDepositAmount(event.target.value)}
            className={inputTenancyClass}
          />
        </div>

        <div>
          <label htmlFor="depositScheme" className={labelClassName}>
            Deposit Protection Scheme
          </label>
          <select
            id="depositScheme"
            value={depositScheme}
            onChange={(event) =>
              setDepositScheme(event.target.value as DepositScheme)
            }
            className={selectTenancyClass}
          >
            {DEPOSIT_SCHEMES.map((scheme) => (
              <option key={scheme} value={scheme}>
                {DEPOSIT_SCHEME_LABELS[scheme]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="depositReference" className={labelClassName}>
            Deposit Protection Reference
          </label>
          <input
            id="depositReference"
            value={depositReference}
            onChange={(event) => setDepositReference(event.target.value)}
            className={inputTenancyClass}
          />
        </div>

        <div>
          <label htmlFor="depositProtectionDate" className={labelClassName}>
            Deposit Protection Date
          </label>
          <input
            id="depositProtectionDate"
            type="date"
            value={depositProtectionDate}
            onChange={(event) => setDepositProtectionDate(event.target.value)}
            className={inputTenancyClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClassName}>Right to Rent Check Completed</label>
          <div className="mt-3 flex gap-4">
            <label className="flex items-center gap-2 text-sm text-tenancy-text">
              <input
                type="radio"
                checked={rightToRentChecked}
                onChange={() => setRightToRentChecked(true)}
              />
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm text-tenancy-text">
              <input
                type="radio"
                checked={!rightToRentChecked}
                onChange={() => setRightToRentChecked(false)}
              />
              No
            </label>
          </div>
        </div>

        {rightToRentChecked && (
          <div className="sm:col-span-2">
            <label htmlFor="rightToRentExpiry" className={labelClassName}>
              Right to Rent Expiry Date
            </label>
            <input
              id="rightToRentExpiry"
              type="date"
              value={rightToRentExpiry}
              onChange={(event) => setRightToRentExpiry(event.target.value)}
              className={inputTenancyClass}
            />
          </div>
        )}

        <div className="sm:col-span-2">
          <label htmlFor="notes" className={labelClassName}>
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className={textareaTenancyClass}
          />
        </div>
      </div>

      <div className="space-y-6 border-t border-steel/15 pt-8">
        <p className="text-[10px] font-normal uppercase tracking-[0.24em] text-steel">
          Documents
        </p>

        {(
          [
            ["agreement", "Tenancy Agreement", agreementFile, setAgreementFile],
            ["deposit_cert", "Deposit Certificate", depositCertFile, setDepositCertFile],
            ["right_to_rent", "Right to Rent Documents", rightToRentFile, setRightToRentFile],
          ] as const
        ).map(([id, label, file, setter]) => (
          <div key={id}>
            <label htmlFor={id} className={labelClassName}>
              {label}
            </label>
            <input
              id={id}
              type="file"
              accept=".pdf,.jpg,.jpeg"
              onChange={(event) => setter(event.target.files?.[0] ?? null)}
              className={`${fileInputClassName} file:bg-navy hover:file:bg-navy-dark`}
            />
            {isEditing && !file && (
              <p className="mt-2 text-xs text-steel">
                Upload to replace existing document on file.
              </p>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className={`${btnPrimaryClassName} w-full bg-navy hover:bg-navy-dark sm:w-auto`}
        >
          {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Tenancy"}
        </button>
        <Link
          href={isEditing && tenancy ? `/tenancy/${tenancy.id}` : "/tenancy/dashboard"}
          className={editorialFormCancelClassName}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
