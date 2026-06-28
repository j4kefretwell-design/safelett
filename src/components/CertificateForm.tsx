"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CERTIFICATE_LABELS,
  CERTIFICATE_TYPES,
  type CertificateType,
} from "@/lib/types";
import {
  buildCertificateDocumentPath,
  CERTIFICATE_DOCUMENTS_BUCKET,
  validateCertificateFile,
} from "@/lib/storage";

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
  const [document, setDocument] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (document) {
      const validationError = validateCertificateFile(document);
      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to add a certificate.");
      setLoading(false);
      return;
    }

    const { data: certificate, error: insertError } = await supabase
      .from("certificates")
      .insert({
        property_id: propertyId,
        certificate_type: certificateType,
        issue_date: issueDate,
        expiry_date: expiryDate,
        notes: notes.trim() || null,
      })
      .select("id")
      .single();

    if (insertError || !certificate) {
      setError(insertError?.message ?? "Failed to add certificate.");
      setLoading(false);
      return;
    }

    if (document) {
      const documentPath = buildCertificateDocumentPath(
        user.id,
        propertyId,
        certificate.id,
        document.name
      );

      const { error: uploadError } = await supabase.storage
        .from(CERTIFICATE_DOCUMENTS_BUCKET)
        .upload(documentPath, document, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        await supabase.from("certificates").delete().eq("id", certificate.id);
        setError(uploadError.message);
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("certificates")
        .update({ document_path: documentPath })
        .eq("id", certificate.id);

      if (updateError) {
        await supabase.storage
          .from(CERTIFICATE_DOCUMENTS_BUCKET)
          .remove([documentPath]);
        await supabase.from("certificates").delete().eq("id", certificate.id);
        setError(updateError.message);
        setLoading(false);
        return;
      }
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

      <div>
        <label
          htmlFor="document"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Certificate Document (optional)
        </label>
        <input
          id="document"
          type="file"
          accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
          onChange={(e) => setDocument(e.target.files?.[0] ?? null)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700"
        />
        <p className="mt-1 text-xs text-slate-500">
          PDF or JPEG, up to 10 MB.
        </p>
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
