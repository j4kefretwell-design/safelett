"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  btnPrimaryClassName,
  btnSecondaryClassName,
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
}

export default function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter();
  const isEditing = Boolean(property);
  const [address, setAddress] = useState(property?.address ?? "");
  const [propertyType, setPropertyType] = useState<PropertyType>(
    property?.property_type ?? "standard_rental"
  );
  const [bedrooms, setBedrooms] = useState(property?.bedrooms ?? 1);
  const [notes, setNotes] = useState(property?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        setLoading(false);
        return;
      }

      router.push(`/properties/${property.id}`);
      router.refresh();
      return;
    }

    const { data, error: insertError } = await supabase
      .from("properties")
      .insert({
        user_id: user.id,
        address: address.trim(),
        property_type: propertyType,
        bedrooms,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/properties/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <section>
        <h2 className={formSectionTitleClassName}>Property Details</h2>
        <div className={formSectionRuleClassName} aria-hidden="true" />
        <div className="mt-8 space-y-8">
          <div>
            <label htmlFor="address" className={labelClassName}>
              Property Address
            </label>
            <input
              id="address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClassName}
              placeholder="123 High Street, London, SW1A 1AA"
            />
          </div>

          <div>
            <label htmlFor="propertyType" className={labelClassName}>
              Property Type
            </label>
            <select
              id="propertyType"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className={selectClassName}
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {PROPERTY_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bedrooms" className={labelClassName}>
              Number of Bedrooms
            </label>
            <input
              id="bedrooms"
              type="number"
              required
              min={1}
              value={bedrooms}
              onChange={(e) => setBedrooms(parseInt(e.target.value, 10))}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      {isEditing && (
        <section>
          <h2 className={formSectionTitleClassName}>Notes</h2>
          <div className={formSectionRuleClassName} aria-hidden="true" />
          <div className="mt-8">
            <label htmlFor="notes" className={labelClassName}>
              Property Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={textareaClassName}
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

      <div className="flex flex-wrap gap-4 pt-2">
        <button type="submit" disabled={loading} className={btnPrimaryClassName}>
          {loading
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Add Property"}
        </button>
        {isEditing && property && (
          <Link href={`/properties/${property.id}`} className={btnSecondaryClassName}>
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
