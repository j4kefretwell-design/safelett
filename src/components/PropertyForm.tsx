"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="address"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Property Address
        </label>
        <input
          id="address"
          type="text"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          placeholder="123 High Street, London, SW1A 1AA"
        />
      </div>

      <div>
        <label
          htmlFor="propertyType"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Property Type
        </label>
        <select
          id="propertyType"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value as PropertyType)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        >
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {PROPERTY_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="bedrooms"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Number of Bedrooms
        </label>
        <input
          id="bedrooms"
          type="number"
          required
          min={1}
          value={bedrooms}
          onChange={(e) => setBedrooms(parseInt(e.target.value, 10))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Property"}
      </button>
    </form>
  );
}
