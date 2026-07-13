"use client";

import { useMemo, useState } from "react";
import {
  ASSISTANT_DISCLAIMER,
  ASSISTANT_DOCUMENTS,
  getAssistantDocument,
  type AssistantDocumentType,
} from "@/lib/assistant";
import {
  buildGmailComposeUrl,
  buildMailtoUrl,
  formatNoticeForCopy,
} from "@/lib/tenancy-notices";
import { inputClassName, labelClassName, selectClassName, textareaClassName } from "@/lib/ui";
import type { Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

interface AssistantDraftClientProps {
  properties: Property[];
  tenancies: Tenancy[];
}

const forestSubmitClassName =
  "flex h-12 w-full items-center justify-center bg-forest text-sm font-normal uppercase tracking-[0.12em] text-dusty-cream transition duration-200 hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-50";

const secondaryActionClassName =
  "flex h-10 w-full items-center justify-center border border-forest/35 bg-transparent text-xs font-normal uppercase tracking-[0.1em] text-forest transition duration-200 hover:border-forest hover:bg-forest/5";

export default function AssistantDraftClient({
  properties,
  tenancies,
}: AssistantDraftClientProps) {
  const [selectedType, setSelectedType] = useState<AssistantDocumentType | null>(
    null
  );
  const [propertyId, setPropertyId] = useState("");
  const [tenancyId, setTenancyId] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    subject: string;
    body: string;
    documentName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const document = selectedType ? getAssistantDocument(selectedType) : null;

  const propertyTenancies = useMemo(() => {
    if (!propertyId) return [];
    const property = properties.find((item) => item.id === propertyId);
    return tenancies.filter(
      (tenancy) =>
        tenancy.property_id === propertyId ||
        (property &&
          tenancy.property_address.trim().toLowerCase() ===
            property.address.trim().toLowerCase())
    );
  }, [properties, tenancies, propertyId]);

  function handleSelectType(type: AssistantDocumentType) {
    setSelectedType(type);
    setFields({});
    setDraft(null);
    setError(null);
    setTenancyId("");
  }

  function handleBack() {
    setSelectedType(null);
    setDraft(null);
    setError(null);
    setFields({});
  }

  async function handleDraft(event: React.FormEvent) {
    event.preventDefault();
    if (!document || !propertyId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/assistant/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: document.id,
          propertyId,
          tenancyId: tenancyId || null,
          fields,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to draft document.");
      }

      setDraft({
        subject: data.subject,
        body: data.body,
        documentName: data.documentName,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to draft document.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(formatNoticeForCopy(draft));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-greige">
      <div className="bg-forest px-5 py-8 sm:px-12 lg:px-16">
        <p className="text-[11px] font-normal uppercase tracking-[0.22em] text-dusty-cream/90">
          Document Drafter
        </p>
        <p className="mt-3 max-w-2xl text-base font-light leading-relaxed text-dusty-cream/85">
          Select a document type and Fretwell &amp; Co will draft it using your
          property and tenancy data.
        </p>
      </div>

      <div className="px-5 py-10 sm:px-12 sm:py-12 lg:px-16">
        {!selectedType ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ASSISTANT_DOCUMENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectType(item.id)}
                className="border-l-[3px] border-forest bg-greige-alt px-5 py-6 text-left transition duration-200 hover:bg-[#ebe4dc]"
              >
                <h2 className="font-serif text-xl tracking-wide text-text">
                  {item.name}
                </h2>
                <p className="mt-2 text-sm font-light leading-relaxed text-cocoa">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-light text-cocoa transition hover:text-text"
            >
              ← All document types
            </button>

            <h2 className="mt-6 font-serif text-2xl tracking-wide text-forest sm:text-3xl">
              {document?.name}
            </h2>
            <p className="mt-2 text-base font-light leading-relaxed text-cocoa">
              {document?.description}
            </p>

            {!draft ? (
              <form onSubmit={handleDraft} className="mt-10 space-y-8">
                <div>
                  <label htmlFor="assistant-property" className={labelClassName}>
                    Select Property
                  </label>
                  <select
                    id="assistant-property"
                    required
                    value={propertyId}
                    onChange={(event) => {
                      setPropertyId(event.target.value);
                      setTenancyId("");
                    }}
                    className={selectClassName}
                  >
                    <option value="">Choose a property</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.address}
                      </option>
                    ))}
                  </select>
                </div>

                {document?.requiresTenancy && (
                  <div>
                    <label htmlFor="assistant-tenancy" className={labelClassName}>
                      Select Tenancy
                    </label>
                    <select
                      id="assistant-tenancy"
                      required
                      value={tenancyId}
                      onChange={(event) => setTenancyId(event.target.value)}
                      className={selectClassName}
                      disabled={!propertyId}
                    >
                      <option value="">
                        {propertyId
                          ? propertyTenancies.length === 0
                            ? "No tenancies for this property"
                            : "Choose a tenancy"
                          : "Select a property first"}
                      </option>
                      {propertyTenancies.map((tenancy) => (
                        <option key={tenancy.id} value={tenancy.id}>
                          {tenancy.tenant_names} — ends {tenancy.end_date}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {document?.fields.map((field) => (
                  <div key={field.id}>
                    <label
                      htmlFor={`field-${field.id}`}
                      className={labelClassName}
                    >
                      {field.label}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        id={`field-${field.id}`}
                        required={field.required}
                        rows={4}
                        placeholder={field.placeholder}
                        value={fields[field.id] ?? ""}
                        onChange={(event) =>
                          setFields((prev) => ({
                            ...prev,
                            [field.id]: event.target.value,
                          }))
                        }
                        className={textareaClassName}
                      />
                    ) : (
                      <input
                        id={`field-${field.id}`}
                        type={field.type}
                        required={field.required}
                        step={field.type === "number" ? "0.01" : undefined}
                        placeholder={field.placeholder}
                        value={fields[field.id] ?? ""}
                        onChange={(event) =>
                          setFields((prev) => ({
                            ...prev,
                            [field.id]: event.target.value,
                          }))
                        }
                        className={inputClassName}
                      />
                    )}
                  </div>
                ))}

                {error && (
                  <p className="text-sm leading-relaxed text-urgent">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || properties.length === 0}
                  className={forestSubmitClassName}
                >
                  {loading ? "Drafting…" : "Draft Document"}
                </button>

                {properties.length === 0 && (
                  <p className="text-sm font-light text-cocoa">
                    Add a property before drafting documents.
                  </p>
                )}
              </form>
            ) : (
              <div className="mt-10">
                <div className="email-composition bg-greige-alt/60">
                  <div className="border-b border-leather/25 px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="shrink-0 text-sm font-normal text-leather">
                        Document:
                      </span>
                      <span className="text-base leading-relaxed text-text">
                        {draft.documentName}
                      </span>
                    </div>
                  </div>
                  <div className="border-b border-leather px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="shrink-0 text-sm font-normal text-leather">
                        Subject:
                      </span>
                      <span className="text-base leading-relaxed text-text">
                        {draft.subject}
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={draft.body}
                    onChange={(event) =>
                      setDraft((prev) =>
                        prev ? { ...prev, body: event.target.value } : prev
                      )
                    }
                    rows={22}
                    spellCheck
                    className="email-composition-body block w-full cursor-text resize-y border-0 bg-transparent px-5 py-6 font-sans text-[15px] leading-[1.75] text-text outline-none focus:ring-0 sm:px-6 sm:py-8"
                    aria-label="Drafted document"
                  />
                </div>

                <p className="mt-6 text-sm leading-relaxed text-leather/80">
                  This is a draft only — no document is sent from Fretwell &amp;
                  Co. Review carefully before use.
                </p>

                <div className="mt-8 space-y-3">
                  <a
                    href={buildMailtoUrl(draft)}
                    className={forestSubmitClassName}
                  >
                    Open in Mail →
                  </a>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={secondaryActionClassName}
                  >
                    {copied ? "Copied to Clipboard" : "Copy to Clipboard"}
                  </button>
                  <a
                    href={buildGmailComposeUrl(draft)}
                    target="_blank"
                    rel="noreferrer"
                    className={secondaryActionClassName}
                  >
                    Open in Gmail
                  </a>
                  <button
                    type="button"
                    onClick={() => setDraft(null)}
                    className="pt-2 text-sm font-light text-cocoa transition hover:text-text"
                  >
                    ← Edit details and draft again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="mx-auto mt-16 max-w-3xl text-center text-xs italic leading-relaxed text-cocoa">
          {ASSISTANT_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
