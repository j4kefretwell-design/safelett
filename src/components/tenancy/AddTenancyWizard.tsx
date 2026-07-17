"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import {
  ADD_TENANCY_TYPE_OPTIONS,
  DEPOSIT_SCHEME_LABELS,
  DEPOSIT_SCHEMES,
  type DepositScheme,
  type TenancyType,
} from "@/lib/tenancy";
import type { Property } from "@/lib/types";

interface AddTenancyWizardProps {
  properties?: Property[];
}

const CUSTOM_PROPERTY = "__custom__";

const fieldLabelClassName =
  "mb-2 block text-[10px] font-normal uppercase tracking-[0.22em] text-leather";
const helperClassName = "mt-1.5 text-xs font-light leading-relaxed text-leather/75";
const inputClassName =
  "w-full border border-taupe bg-vanilla px-4 py-3.5 text-base text-text outline-none transition focus:border-navy";
const selectClassName = `${inputClassName} cursor-pointer appearance-none`;

export default function AddTenancyWizard({
  properties: initialProperties = [],
}: AddTenancyWizardProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [step, setStep] = useState<1 | 2>(1);

  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [tenantNames, setTenantNames] = useState("");
  const [propertySelection, setPropertySelection] = useState(
    initialProperties[0]?.id ?? CUSTOM_PROPERTY
  );
  const [propertyAddress, setPropertyAddress] = useState(
    initialProperties[0]?.address ?? ""
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [tenancyType, setTenancyType] = useState<TenancyType>("assured_shorthold");

  const [rentReviewDate, setRentReviewDate] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositScheme, setDepositScheme] = useState<DepositScheme>("dps");
  const [depositReference, setDepositReference] = useState("");
  const [depositProtectionDate, setDepositProtectionDate] = useState("");
  const [rightToRentChecked, setRightToRentChecked] = useState(false);
  const [rightToRentExpiry, setRightToRentExpiry] = useState("");
  const [notes, setNotes] = useState("");

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
        const list = (data ?? []) as Property[];
        setProperties(list);
        if (list[0]) {
          setPropertySelection(list[0].id);
          setPropertyAddress(list[0].address);
        }
      });
  }, [initialProperties.length]);

  useEffect(() => {
    if (propertySelection === CUSTOM_PROPERTY) return;
    const selected = properties.find((property) => property.id === propertySelection);
    if (selected) {
      setPropertyAddress(selected.address);
    }
  }, [propertySelection, properties]);

  function validateStep1(): string | null {
    if (!tenantNames.trim()) return "Tenant name(s) are required.";
    if (!propertyAddress.trim()) return "Property address is required.";
    if (!startDate) return "Tenancy start date is required.";
    if (!endDate) return "Tenancy end date is required.";
    if (!monthlyRent || Number(monthlyRent) < 0) return "Monthly rent is required.";
    if (endDate < startDate) return "End date must be on or after start date.";
    return null;
  }

  function handleContinue() {
    const validationError = validateStep1();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep(2);
  }

  async function saveTenancy(includeOptional: boolean) {
    const validationError = validateStep1();
    if (validationError) {
      setError(validationError);
      setStep(1);
      return;
    }

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

    const payload = {
      tenant_names: tenantNames.trim(),
      property_address: propertyAddress.trim(),
      property_id: propertySelection === CUSTOM_PROPERTY ? null : propertySelection,
      tenancy_type: tenancyType,
      start_date: startDate,
      end_date: endDate,
      monthly_rent: Number(monthlyRent),
      rent_review_date: includeOptional && rentReviewDate ? rentReviewDate : null,
      deposit_amount:
        includeOptional && depositAmount ? Number(depositAmount) : null,
      deposit_scheme:
        includeOptional &&
        (depositAmount || depositReference.trim() || depositProtectionDate)
          ? depositScheme
          : null,
      deposit_reference:
        includeOptional && depositReference.trim()
          ? depositReference.trim()
          : null,
      deposit_protection_date:
        includeOptional && depositProtectionDate ? depositProtectionDate : null,
      right_to_rent_checked: includeOptional ? rightToRentChecked : false,
      right_to_rent_expiry:
        includeOptional && rightToRentChecked && rightToRentExpiry
          ? rightToRentExpiry
          : null,
      notes: includeOptional && notes.trim() ? notes.trim() : null,
      updated_at: new Date().toISOString(),
    };

    const { data: created, error: insertError } = await supabase
      .from("tenancies")
      .insert({ ...payload, user_id: user.id })
      .select("id")
      .single();

    if (insertError || !created) {
      toastError();
      setError(insertError?.message ?? "Failed to create tenancy.");
      setLoading(false);
      return;
    }

    success("Tenancy added");
    router.push(`/tenancy/${created.id}`);
    router.refresh();
  }

  return (
    <div className="w-full max-w-xl">
      <nav
        aria-label="Form progress"
        className="flex flex-col gap-2 border-b border-leather/15 pb-6 sm:flex-row sm:items-center sm:gap-4"
      >
        <p
          className={`text-[11px] font-normal uppercase tracking-[0.18em] ${
            step === 1 ? "text-navy" : "text-leather/50"
          }`}
        >
          Step 1 of 2 — Essential Details
        </p>
        <span className="hidden text-leather/30 sm:inline" aria-hidden>
          |
        </span>
        <p
          className={`text-[11px] font-normal uppercase tracking-[0.18em] ${
            step === 2 ? "text-navy" : "text-leather/50"
          }`}
        >
          Step 2 of 2 — Additional Details
        </p>
      </nav>

      {step === 1 ? (
        <div key="step-1" className="tenancy-wizard-step mt-10 space-y-8">
          <div>
            <label htmlFor="tenantNames" className={fieldLabelClassName}>
              Tenant Name(s)
            </label>
            <input
              id="tenantNames"
              required
              value={tenantNames}
              onChange={(event) => setTenantNames(event.target.value)}
              className={inputClassName}
              placeholder="e.g. James & Sarah Thompson"
            />
          </div>

          <div>
            <label htmlFor="propertySelection" className={fieldLabelClassName}>
              Property
            </label>
            <select
              id="propertySelection"
              value={propertySelection}
              onChange={(event) => setPropertySelection(event.target.value)}
              className={selectClassName}
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}
                </option>
              ))}
              <option value={CUSTOM_PROPERTY}>Enter address manually</option>
            </select>
            {propertySelection === CUSTOM_PROPERTY && (
              <input
                required
                value={propertyAddress}
                onChange={(event) => setPropertyAddress(event.target.value)}
                className={`${inputClassName} mt-3`}
                placeholder="Full property address"
              />
            )}
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className={fieldLabelClassName}>
                Tenancy Start Date
              </label>
              <input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="endDate" className={fieldLabelClassName}>
                Tenancy End Date
              </label>
              <input
                id="endDate"
                type="date"
                required
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="monthlyRent" className={fieldLabelClassName}>
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
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="tenancyType" className={fieldLabelClassName}>
                Tenancy Type
              </label>
              <select
                id="tenancyType"
                value={tenancyType}
                onChange={(event) =>
                  setTenancyType(event.target.value as TenancyType)
                }
                className={selectClassName}
              >
                {ADD_TENANCY_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <p className="border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleContinue}
            className="flex h-12 w-full items-center justify-center bg-navy text-sm font-normal uppercase tracking-[0.12em] text-dusty-cream transition hover:bg-navy-dark sm:w-auto sm:min-w-[12rem] sm:px-8"
          >
            Continue →
          </button>
        </div>
      ) : (
        <div key="step-2" className="tenancy-wizard-step mt-10 space-y-8">
          <div className="border-l-4 border-navy/30 bg-navy/5 px-4 py-3">
            <p className="text-sm leading-relaxed text-tenancy-text">
              These details are <span className="font-normal">optional</span> — they
              can be added now or updated later.
            </p>
          </div>

          <div>
            <label htmlFor="rentReviewDate" className={fieldLabelClassName}>
              Rent Review Date{" "}
              <span className="normal-case tracking-normal text-leather/60">
                (optional)
              </span>
            </label>
            <input
              id="rentReviewDate"
              type="date"
              value={rentReviewDate}
              onChange={(event) => setRentReviewDate(event.target.value)}
              className={inputClassName}
            />
            <p className={helperClassName}>
              When is the next rent review due?
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="depositAmount" className={fieldLabelClassName}>
                Deposit Amount (£){" "}
                <span className="normal-case tracking-normal text-leather/60">
                  (optional)
                </span>
              </label>
              <input
                id="depositAmount"
                type="number"
                min="0"
                step="0.01"
                value={depositAmount}
                onChange={(event) => setDepositAmount(event.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="depositScheme" className={fieldLabelClassName}>
                Deposit Protection Scheme{" "}
                <span className="normal-case tracking-normal text-leather/60">
                  (optional)
                </span>
              </label>
              <select
                id="depositScheme"
                value={depositScheme}
                onChange={(event) =>
                  setDepositScheme(event.target.value as DepositScheme)
                }
                className={selectClassName}
              >
                {DEPOSIT_SCHEMES.map((scheme) => (
                  <option key={scheme} value={scheme}>
                    {DEPOSIT_SCHEME_LABELS[scheme]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="depositReference" className={fieldLabelClassName}>
                Deposit Protection Reference{" "}
                <span className="normal-case tracking-normal text-leather/60">
                  (optional)
                </span>
              </label>
              <input
                id="depositReference"
                value={depositReference}
                onChange={(event) => setDepositReference(event.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="depositProtectionDate" className={fieldLabelClassName}>
                Deposit Protection Date{" "}
                <span className="normal-case tracking-normal text-leather/60">
                  (optional)
                </span>
              </label>
              <input
                id="depositProtectionDate"
                type="date"
                value={depositProtectionDate}
                onChange={(event) => setDepositProtectionDate(event.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <p className={fieldLabelClassName}>
              Right to Rent Check{" "}
              <span className="normal-case tracking-normal text-leather/60">
                (optional)
              </span>
            </p>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setRightToRentChecked(true)}
                className={`min-h-11 flex-1 border px-4 py-2.5 text-sm transition ${
                  rightToRentChecked
                    ? "border-navy bg-navy text-dusty-cream"
                    : "border-taupe bg-vanilla text-leather hover:border-navy/40"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => {
                  setRightToRentChecked(false);
                  setRightToRentExpiry("");
                }}
                className={`min-h-11 flex-1 border px-4 py-2.5 text-sm transition ${
                  !rightToRentChecked
                    ? "border-navy bg-navy text-dusty-cream"
                    : "border-taupe bg-vanilla text-leather hover:border-navy/40"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {rightToRentChecked ? (
            <div>
              <label htmlFor="rightToRentExpiry" className={fieldLabelClassName}>
                Right to Rent Expiry Date
              </label>
              <input
                id="rightToRentExpiry"
                type="date"
                value={rightToRentExpiry}
                onChange={(event) => setRightToRentExpiry(event.target.value)}
                className={inputClassName}
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="notes" className={fieldLabelClassName}>
              Notes{" "}
              <span className="normal-case tracking-normal text-leather/60">
                (optional)
              </span>
            </label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={`${inputClassName} resize-y`}
            />
          </div>

          {error ? (
            <p className="border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
              {error}
            </p>
          ) : null}

          <div className="space-y-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => void saveTenancy(true)}
              className="flex h-12 w-full items-center justify-center bg-navy text-sm font-normal uppercase tracking-[0.12em] text-dusty-cream transition hover:bg-navy-dark disabled:opacity-50 sm:w-auto sm:min-w-[12rem] sm:px-8"
            >
              {loading ? "Saving..." : "Save Tenancy"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void saveTenancy(false)}
              className="block text-sm font-light text-navy transition hover:text-navy-dark disabled:opacity-50"
            >
              Skip optional details
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setError(null);
                setStep(1);
              }}
              className="block text-sm font-light text-leather transition hover:text-navy"
            >
              ← Back to essential details
            </button>
            <Link
              href="/tenancy/dashboard"
              className="block text-sm font-light text-leather/70 transition hover:text-leather"
            >
              Cancel
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
