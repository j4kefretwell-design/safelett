"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ASSISTANT_DISCLAIMER,
  ASSISTANT_DOCUMENTS,
  getAssistantDocument,
  type AssistantDocumentType,
} from "@/lib/assistant";
import {
  addAssistantHistoryEntry,
  getAssistantHistoryEntry,
  updateAssistantHistoryEntry,
} from "@/lib/assistant-history";
import {
  buildGmailComposeUrl,
  buildMailtoUrl,
  formatNoticeForCopy,
} from "@/lib/tenancy-notices";
import {
  inputClassName,
  labelClassName,
  selectClassName,
  textareaClassName,
} from "@/lib/ui";
import type { Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

interface AssistantDraftClientProps {
  properties: Property[];
  tenancies: Tenancy[];
  initialType?: string | null;
  historyId?: string | null;
}

const forestSubmitClassName =
  "flex h-12 w-full items-center justify-center bg-forest text-sm font-normal uppercase tracking-[0.12em] text-dusty-cream transition duration-200 hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-50";

const secondaryActionClassName =
  "flex h-10 w-full items-center justify-center border border-forest/35 bg-transparent text-xs font-normal uppercase tracking-[0.1em] text-forest transition duration-200 hover:border-forest hover:bg-forest/5";

const disclaimerClassName =
  "mx-auto mt-20 max-w-2xl text-center text-[11px] italic leading-relaxed text-[#97795D]";

function notifyHistoryUpdated() {
  window.dispatchEvent(new Event("fretwell-assistant-history"));
}

export default function AssistantDraftClient({
  properties,
  tenancies,
  initialType = null,
  historyId = null,
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
    id?: string;
    subject: string;
    body: string;
    documentName: string;
    documentType?: AssistantDocumentType;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [hydratedHistory, setHydratedHistory] = useState(false);

  const document = selectedType ? getAssistantDocument(selectedType) : null;

  useEffect(() => {
    if (historyId) {
      const entry = getAssistantHistoryEntry(historyId);
      if (entry) {
        setSelectedType(entry.documentType);
        setDraft({
          id: entry.id,
          subject: entry.subject,
          body: entry.body,
          documentName: entry.documentName,
          documentType: entry.documentType,
        });
      }
      setHydratedHistory(true);
      return;
    }

    if (initialType) {
      const match = getAssistantDocument(initialType);
      if (match) {
        setSelectedType(match.id);
      }
    }
    setHydratedHistory(true);
  }, [historyId, initialType]);

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

      const entry = addAssistantHistoryEntry({
        title: data.subject || data.documentName,
        documentType: document.id,
        documentName: data.documentName,
        subject: data.subject,
        body: data.body,
      });
      notifyHistoryUpdated();

      setDraft({
        id: entry.id,
        subject: data.subject,
        body: data.body,
        documentName: data.documentName,
        documentType: document.id,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to draft document.");
    } finally {
      setLoading(false);
    }
  }

  function handleDraftBodyChange(body: string) {
    setDraft((prev) => {
      if (!prev) return prev;
      if (prev.id) {
        updateAssistantHistoryEntry(prev.id, { body });
        notifyHistoryUpdated();
      }
      return { ...prev, body };
    });
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

  if (!hydratedHistory) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full bg-greige px-5 py-12 sm:px-12">
        <p className="text-sm font-light italic text-[#97795D]">Loading…</p>
      </div>
    );
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

      <div className="px-5 py-12 sm:px-12 sm:py-16 lg:px-16">
        <Link
          href="/assistant"
          className="mb-10 inline-block text-sm font-light text-cocoa transition hover:text-text"
        >
          ← Assistant home
        </Link>

        {!selectedType ? (
          <div className="mx-auto max-w-3xl">
            <div className="mb-10">
              <p className="text-[11px] font-normal uppercase tracking-[0.2em] text-forest">
                Select Document Type
              </p>
              <div className="mt-3 h-px w-full bg-gold/55" aria-hidden="true" />
            </div>

            <ul>
              {ASSISTANT_DOCUMENTS.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectType(item.id)}
                    className="group flex w-full items-center gap-4 border-t border-gold/45 border-l-[3px] border-l-transparent py-7 text-left transition-colors duration-300 hover:border-l-forest hover:bg-[rgba(26,46,26,0.04)] sm:gap-8 sm:py-8"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-serif text-xl tracking-wide text-text sm:text-[1.35rem]">
                        {item.name}
                      </span>
                      <span className="mt-1.5 block text-sm font-light leading-snug text-cocoa sm:hidden">
                        {item.description}
                      </span>
                    </span>
                    <span className="hidden max-w-[14rem] shrink-0 text-right text-sm font-light leading-snug text-cocoa sm:block md:max-w-xs">
                      {item.description}
                    </span>
                    <span
                      className="shrink-0 text-base text-forest transition-transform duration-300 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
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

            <h2 className="mt-8 font-serif text-2xl tracking-wide text-forest sm:text-3xl">
              {document?.name}
            </h2>
            <p className="mt-2 text-base font-light leading-relaxed text-cocoa">
              {document?.description}
            </p>

            {!draft ? (
              <form onSubmit={handleDraft} className="mt-12 space-y-8">
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
                <div className="email-composition bg-greige-alt/40">
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
                      handleDraftBodyChange(event.target.value)
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

        <p className={disclaimerClassName}>{ASSISTANT_DISCLAIMER}</p>
      </div>
    </div>
  );
}
