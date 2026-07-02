"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CERTIFICATE_LABELS,
  CERTIFICATE_TYPE_HINTS,
  CERTIFICATE_TYPES,
  getCertificateDateLabels,
  type Certificate,
  type CertificateType,
} from "@/lib/types";
import {
  buildCertificateDocumentPath,
  CERTIFICATE_DOCUMENTS_BUCKET,
  validateCertificateFile,
} from "@/lib/storage";
import {
  btnPrimaryClassName,
  btnSecondaryClassName,
  fileInputClassName,
  formSectionRuleClassName,
  formSectionTitleClassName,
  inputClassName,
  labelClassName,
  mutedTextClassName,
  selectClassName,
  textareaClassName,
} from "@/lib/ui";
import Link from "next/link";

interface CertificateFormProps {
  propertyId: string;
  certificate?: Certificate;
}

export default function CertificateForm({
  propertyId,
  certificate,
}: CertificateFormProps) {
  const router = useRouter();
  const isEditing = Boolean(certificate);
  const [certificateType, setCertificateType] = useState<CertificateType>(
    certificate?.certificate_type ?? "gas_safety"
  );
  const [issueDate, setIssueDate] = useState(certificate?.issue_date ?? "");
  const [expiryDate, setExpiryDate] = useState(certificate?.expiry_date ?? "");
  const [notes, setNotes] = useState(certificate?.notes ?? "");
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
      setError("You must be signed in.");
      setLoading(false);
      return;
    }

    if (isEditing && certificate) {
      const { error: updateError } = await supabase
        .from("certificates")
        .update({
          certificate_type: certificateType,
          issue_date: issueDate,
          expiry_date: expiryDate,
          notes: notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", certificate.id);

      if (updateError) {
        setError(updateError.message);
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

        if (certificate.document_path) {
          await supabase.storage
            .from(CERTIFICATE_DOCUMENTS_BUCKET)
            .remove([certificate.document_path]);
        }

        const { error: uploadError } = await supabase.storage
          .from(CERTIFICATE_DOCUMENTS_BUCKET)
          .upload(documentPath, document, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          setError(uploadError.message);
          setLoading(false);
          return;
        }

        await supabase
          .from("certificates")
          .update({ document_path: documentPath })
          .eq("id", certificate.id);
      }

      router.push(`/properties/${propertyId}`);
      router.refresh();
      return;
    }

    const { data: newCertificate, error: insertError } = await supabase
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

    if (insertError || !newCertificate) {
      setError(insertError?.message ?? "Failed to add certificate.");
      setLoading(false);
      return;
    }

    if (document) {
      const documentPath = buildCertificateDocumentPath(
        user.id,
        propertyId,
        newCertificate.id,
        document.name
      );

      const { error: uploadError } = await supabase.storage
        .from(CERTIFICATE_DOCUMENTS_BUCKET)
        .upload(documentPath, document, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        await supabase.from("certificates").delete().eq("id", newCertificate.id);
        setError(uploadError.message);
        setLoading(false);
        return;
      }

      await supabase
        .from("certificates")
        .update({ document_path: documentPath })
        .eq("id", newCertificate.id);
    }

    router.push(`/properties/${propertyId}`);
    router.refresh();
  }

  const dateLabels = getCertificateDateLabels(certificateType);
  const typeHint = CERTIFICATE_TYPE_HINTS[certificateType];

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <section>
        <h2 className={formSectionTitleClassName}>Certificate Type</h2>
        <div className={formSectionRuleClassName} aria-hidden="true" />
        <div className="mt-8">
          <label htmlFor="certificateType" className={labelClassName}>
            Type
          </label>
          <select
            id="certificateType"
            value={certificateType}
            onChange={(e) =>
              setCertificateType(e.target.value as CertificateType)
            }
            className={selectClassName}
          >
            {CERTIFICATE_TYPES.map((type) => (
              <option key={type} value={type}>
                {CERTIFICATE_LABELS[type]}
              </option>
            ))}
          </select>
          {typeHint && (
            <p className={`${mutedTextClassName} mt-3`}>{typeHint}</p>
          )}
        </div>
      </section>

      <section>
        <h2 className={formSectionTitleClassName}>Dates</h2>
        <div className={formSectionRuleClassName} aria-hidden="true" />
        <div className="mt-8 space-y-8">
          <div>
            <label htmlFor="issueDate" className={labelClassName}>
              {dateLabels.issue}
            </label>
            <input
              id="issueDate"
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="expiryDate" className={labelClassName}>
              {dateLabels.expiry}
            </label>
            <input
              id="expiryDate"
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={inputClassName}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className={formSectionTitleClassName}>Additional Details</h2>
        <div className={formSectionRuleClassName} aria-hidden="true" />
        <div className="mt-8 space-y-8">
          <div>
            <label htmlFor="notes" className={labelClassName}>
              Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={textareaClassName}
              placeholder="Any additional details..."
            />
          </div>

          <div>
            <label htmlFor="document" className={labelClassName}>
              Certificate Document (optional)
            </label>
            <input
              id="document"
              type="file"
              accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
              onChange={(e) => setDocument(e.target.files?.[0] ?? null)}
              className={fileInputClassName}
            />
            <p className={`${mutedTextClassName} mt-3`}>
              PDF or JPEG, up to 10 MB.
              {isEditing && certificate?.document_path
                ? " Upload a new file to replace the existing document."
                : ""}
            </p>
          </div>
        </div>
      </section>

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
              : "Add Certificate"}
        </button>
        {isEditing && (
          <Link
            href={`/properties/${propertyId}`}
            className={btnSecondaryClassName}
          >
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
