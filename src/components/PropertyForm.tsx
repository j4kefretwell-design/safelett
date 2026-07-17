"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UpgradeOverlay from "@/components/subscription/UpgradeOverlay";
import { useToast } from "@/components/toast/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import {
  btnPrimaryClassName,
  editorialFormCancelClassName,
  editorialFormInputClassName,
  editorialFormLabelClassName,
  editorialFormSectionRuleClassName,
  editorialFormSelectClassName,
  editorialFormSubmitClassName,
  editorialFormTextareaClassName,
  formSectionRuleClassName,
  formSectionTitleClassName,
  inputClassName,
  labelClassName,
  selectClassName,
  textareaClassName,
} from "@/lib/ui";
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
  type Property,
  type PropertyType,
} from "@/lib/types";

interface PropertyFormProps {
  property?: Property;
  fullWidthSubmit?: boolean;
  hideSectionHeader?: boolean;
  editorial?: boolean;
}

export default function PropertyForm({
  property,
  fullWidthSubmit = false,
  hideSectionHeader = false,
  editorial = false,
}: PropertyFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const isEditing = Boolean(property);
  const [address, setAddress] = useState(property?.address ?? "");
  const [propertyType, setPropertyType] = useState<PropertyType>(
    property?.property_type ?? "standard_rental"
  );
  const [bedrooms, setBedrooms] = useState(property?.bedrooms ?? 1);
  const [notes, setNotes] = useState(property?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [upgradePrompt, setUpgradePrompt] = useState<{
    title: string;
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

    if (isEditing && property) {
      const { error: updateError } = await supabase
        .from("properties")
        .update({
          address: address.trim(),
          property_type: propertyType,
          bedrooms,
          notes: notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", property.id);

      if (updateError) {
        setError(updateError.message);
        toastError();
        setLoading(false);
        return;
      }

      success("Property saved successfully");
      router.push(`/properties/${property.id}`);
      router.refresh();
      return;
    }

    const response = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        propertyType,
        bedrooms,
        notes,
      }),
    });
    const data = await response.json();

    if (!response.ok && data.code === "UPGRADE_REQUIRED") {
      setUpgradePrompt({
        title: data.title || "You've reached the 15 property limit",
        message:
          data.message ||
          "Upgrade to Professional for unlimited properties.",
      });
      setLoading(false);
      return;
    }

    if (!response.ok) {
      setError(data.error || "Unable to create property.");
      toastError();
      setLoading(false);
      return;
    }

    success("Property saved successfully");
    router.push(`/properties/${data.id}`);
    router.refresh();
  }

  const labelClass = editorial ? editorialFormLabelClassName : labelClassName;
  const inputClass = editorial ? editorialFormInputClassName : inputClassName;
  const selectClass = editorial ? editorialFormSelectClassName : selectClassName;
  const textareaClass = editorial
    ? editorialFormTextareaClassName
    : textareaClassName;

  if (editorial && isEditing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-0">
        <div>
          <label htmlFor="address" className={labelClass}>
            Address
          </label>
          <input
            id="address"
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputClass}
            placeholder="123 High Street, London, SW1A 1AA"
          />
        </div>

        <div className={editorialFormSectionRuleClassName} aria-hidden="true" />

        <div>
          <label htmlFor="propertyType" className={labelClass}>
            Property Type
          </label>
          <select
            id="propertyType"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as PropertyType)}
            className={selectClass}
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {PROPERTY_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div className={editorialFormSectionRuleClassName} aria-hidden="true" />

        <div>
          <label htmlFor="bedrooms" className={labelClass}>
            Number of Bedrooms
          </label>
          <input
            id="bedrooms"
            type="number"
            required
            min={1}
            value={bedrooms}
            onChange={(e) => setBedrooms(parseInt(e.target.value, 10))}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="mt-8 border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
            {error}
          </p>
        )}

        <div className="mt-12">
          <button
            type="submit"
            disabled={loading}
            className={editorialFormSubmitClassName}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href={property ? `/properties/${property.id}` : "/compliance"}
            className={editorialFormCancelClassName}
          >
            Cancel
          </Link>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {upgradePrompt ? (
        <UpgradeOverlay
          title={upgradePrompt.title}
          message={upgradePrompt.message}
          onDismiss={() => setUpgradePrompt(null)}
        />
      ) : null}
      <section>
        {!hideSectionHeader && (
          <>
            <h2 className="text-xs font-normal uppercase tracking-[0.22em] text-heading">
              Property Details
            </h2>
            <div className={formSectionRuleClassName} aria-hidden="true" />
          </>
        )}
        <div className={hideSectionHeader ? "space-y-10" : "mt-8 space-y-8"}>
          <div>
            <label htmlFor="address" className={labelClass}>
              Property Address
            </label>
            <input
              id="address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
              placeholder="123 High Street, London, SW1A 1AA"
            />
          </div>

          <div>
            <label htmlFor="propertyType" className={labelClass}>
              Property Type
            </label>
            <select
              id="propertyType"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className={selectClass}
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {PROPERTY_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bedrooms" className={labelClass}>
              Number of Bedrooms
            </label>
            <input
              id="bedrooms"
              type="number"
              required
              min={1}
              value={bedrooms}
              onChange={(e) => setBedrooms(parseInt(e.target.value, 10))}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {isEditing && (
        <section>
          <h2 className={formSectionTitleClassName}>Notes</h2>
          <div className={formSectionRuleClassName} aria-hidden="true" />
          <div className="mt-8">
            <label htmlFor="notes" className={labelClass}>
              Property Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={textareaClass}
              placeholder='e.g. "Boiler located in kitchen cupboard"'
            />
          </div>
        </section>
      )}

      {error && (
        <p className="border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
          {error}
        </p>
      )}

      <div className={fullWidthSubmit ? "pt-2" : "pt-2"}>
        <button
          type="submit"
          disabled={loading}
          className={`${btnPrimaryClassName}${fullWidthSubmit ? " w-full" : ""}`}
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Add Property"}
        </button>
        <Link
          href={property ? `/properties/${property.id}` : "/compliance"}
          className={editorialFormCancelClassName}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
