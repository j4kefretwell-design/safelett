"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast/ToastProvider";
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
  editorialFormCancelClassName,
  editorialFormInputClassName,
  editorialFormLabelClassName,
  editorialFormSectionRuleClassName,
  editorialFormSelectClassName,
  editorialFormSubmitClassName,
  editorialFormTextareaClassName,
  fileInputClassName,
  formSectionRuleClassName,
  formSectionTitleClassName,
  inputClassName,
  labelClassName,
  mutedTextClassName,
  selectClassName,
  textareaClassName,
} from "@/lib/ui";

interface CertificateFormProps {
  propertyId: string;
  certificate?: Certificate;
  editorial?: boolean;
}

export default function CertificateForm({
  propertyId,
  certificate,
  editorial = false,
}: CertificateFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
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
        toastError();
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
          toastError();
          setLoading(false);
          return;
        }

        await supabase
          .from("certificates")
          .update({ document_path: documentPath })
          .eq("id", certificate.id);
      }

      success("Certificate saved successfully");
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
      toastError();
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
        toastError();
        setLoading(false);
        return;
      }

      await supabase
        .from("certificates")
        .update({ document_path: documentPath })
        .eq("id", newCertificate.id);
    }

    success("Certificate added");
    router.push(`/properties/${propertyId}`);
    router.refresh();
  }

  const dateLabels = getCertificateDateLabels(certificateType);
  const typeHint = CERTIFICATE_TYPE_HINTS[certificateType];

  const labelClass = editorial ? editorialFormLabelClassName : labelClassName;
  const inputClass = editorial ? editorialFormInputClassName : inputClassName;
  const selectClass = editorial ? editorialFormSelectClassName : selectClassName;
  const textareaClass = editorial
    ? editorialFormTextareaClassName
    : textareaClassName;

  if (editorial) {
    return (
      <form onSubmit={handleSubmit} className="space-y-0">
        <div>
          <label htmlFor="certificateType" className={labelClass}>
            Certificate Type
          </label>
          <select
            id="certificateType"
            value={certificateType}
            onChange={(e) =>
              setCertificateType(e.target.value as CertificateType)
            }
            className={`${selectClass} mt-2 font-serif text-xl tracking-wide`}
          >
            {CERTIFICATE_TYPES.map((type) => (
              <option key={type} value={type}>
                {CERTIFICATE_LABELS[type]}
              </option>
            ))}
          </select>
          {typeHint && (
            <p className="mt-3 text-sm font-light italic leading-relaxed text-leather/75">
              {typeHint}
            </p>
          )}
        </div>

        <div className={editorialFormSectionRuleClassName} aria-hidden="true" />

        <div className="space-y-8">
          <div>
            <label htmlFor="issueDate" className={labelClass}>
              Issue Date
            </label>
            <input
              id="issueDate"
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="expiryDate" className={labelClass}>
              Expiry Date
            </label>
            <input
              id="expiryDate"
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className={editorialFormSectionRuleClassName} aria-hidden="true" />

        <div>
          <label
            htmlFor="document"
            className="flex cursor-pointer flex-col items-center border border-dashed border-leather bg-parchment px-6 py-12 text-center transition hover:border-gold"
          >
            <Upload
              className="mb-4 h-6 w-6 text-leather"
              strokeWidth={1.25}
              aria-hidden="true"
            />
            <span className="text-sm font-normal uppercase tracking-[0.12em] text-leather">
              Upload Certificate (Optional)
            </span>
            <span className="mt-2 text-xs font-light italic text-leather/70">
              PDF or JPEG accepted
            </span>
            {document && (
              <span className="mt-4 text-sm font-light text-text">
                {document.name}
              </span>
            )}
            {isEditing && certificate?.document_path && !document && (
              <span className="mt-4 text-sm font-light text-leather">
                Document on file — upload to replace
              </span>
            )}
            <input
              id="document"
              type="file"
              accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
              onChange={(e) => setDocument(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>
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
            {loading ? "Saving..." : isEditing ? "Save Changes" : "Save Certificate"}
          </button>
          <Link
            href={`/properties/${propertyId}`}
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
      <section>
        <h2 className={formSectionTitleClassName}>Certificate Type</h2>
        <div className={formSectionRuleClassName} aria-hidden="true" />
        <div className="mt-8">
          <label htmlFor="certificateType" className={labelClass}>
            Type
          </label>
          <select
            id="certificateType"
            value={certificateType}
            onChange={(e) =>
              setCertificateType(e.target.value as CertificateType)
            }
            className={selectClass}
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
            <label htmlFor="issueDate" className={labelClass}>
              {dateLabels.issue}
            </label>
            <input
              id="issueDate"
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="expiryDate" className={labelClass}>
              {dateLabels.expiry}
            </label>
            <input
              id="expiryDate"
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className={formSectionTitleClassName}>Additional Details</h2>
        <div className={formSectionRuleClassName} aria-hidden="true" />
        <div className="mt-8 space-y-8">
          <div>
            <label htmlFor="notes" className={labelClass}>
              Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={textareaClass}
              placeholder="Any additional details..."
            />
          </div>

          <div>
            <label htmlFor="document" className={labelClass}>
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

      <div className="pt-2">
        <button type="submit" disabled={loading} className={`${btnPrimaryClassName} w-full sm:w-auto`}>
          {loading
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Add Certificate"}
        </button>
        <Link
          href={`/properties/${propertyId}`}
          className={editorialFormCancelClassName}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
