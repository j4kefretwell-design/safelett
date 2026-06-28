"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  btnPrimaryClassName,
  inputClassName,
  labelClassName,
  selectClassName,
} from "@/lib/ui";
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
  type PropertyType,
} from "@/lib/types";

export default function PropertyForm() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("standard_rental");
  const [bedrooms, setBedrooms] = useState(1);
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
      setError("You must be signed in to add a property.");
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("properties")
      .insert({
        user_id: user.id,
        address,
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
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {error && (
        <p className="rounded-lg border border-red-200 bg-urgent-light px-4 py-3 text-sm text-urgent">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className={btnPrimaryClassName}>
        {loading ? "Saving..." : "Add Property"}
      </button>
    </form>
  );
}
