"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CERTIFICATE_LABELS,
  CERTIFICATE_TYPES,
  type CertificateType,
} from "@/lib/types";

interface CertificateFormProps {
  propertyId: string;
}

export default function CertificateForm({ propertyId }: CertificateFormProps) {
  const router = useRouter();
  const [certificateType, setCertificateType] =
    useState<CertificateType>("gas_safety");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { error: insertError } = await supabase.from("certificates").insert({
      property_id: propertyId,
      certificate_type: certificateType,
      issue_date: issueDate,
      expiry_date: expiryDate,
      notes: notes.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/properties/${propertyId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="certificateType"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Certificate Type
        </label>
        <select
          id="certificateType"
          value={certificateType}
          onChange={(e) =>
            setCertificateType(e.target.value as CertificateType)
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        >
          {CERTIFICATE_TYPES.map((type) => (
            <option key={type} value={type}>
              {CERTIFICATE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="issueDate"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Issue Date
        </label>
        <input
          id="issueDate"
          type="date"
          required
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div>
        <label
          htmlFor="expiryDate"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Expiry Date
        </label>
        <input
          id="expiryDate"
          type="date"
          required
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          placeholder="Any additional details..."
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
        {loading ? "Saving..." : "Add Certificate"}
      </button>
    </form>
  );
}
