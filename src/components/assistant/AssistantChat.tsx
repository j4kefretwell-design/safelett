"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ASSISTANT_DISCLAIMER,
  ASSISTANT_DOCUMENTS,
  getAssistantDocument,
  type AssistantDocumentType,
} from "@/lib/assistant";
import {
  addAssistantHistoryEntry,
  readAssistantHistory,
  type AssistantHistoryEntry,
} from "@/lib/assistant-history";
import {
  buildGmailComposeUrl,
  buildMailtoUrl,
  formatNoticeForCopy,
} from "@/lib/tenancy-notices";
import type { Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

interface AssistantChatProps {
  properties: Property[];
  tenancies: Tenancy[];
  initialAction?: "draft" | "compliance" | "expiry" | null;
}

type NavId = "new" | "draft" | "compliance" | "history";

type ChatDocument = {
  id: string;
  documentName: string;
  subject: string;
  body: string;
  documentType: AssistantDocumentType;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  chips?: Array<{ id: string; label: string }>;
  chipKind?: "document" | "property" | "tenancy" | "suggestion";
  document?: ChatDocument;
};

type DraftSession = {
  documentType: AssistantDocumentType | null;
  propertyId: string | null;
  tenancyId: string | null;
  fields: Record<string, string>;
  awaiting: "type" | "property" | "tenancy" | "field" | null;
  fieldIndex: number;
};

const WELCOME_CHIPS = [
  { id: "compliance", label: "Check my compliance status" },
  { id: "draft", label: "Draft a document" },
  { id: "expiry", label: "Which certificates expire soon?" },
  { id: "tenancies", label: "Review my tenancies" },
] as const;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function uid() {
  return crypto.randomUUID();
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 border-l-2 border-forest pl-4 py-2">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="assistant-typing-dot h-1.5 w-1.5 bg-forest"
          style={{ animationDelay: `${dot * 160}ms` }}
        />
      ))}
    </div>
  );
}

function ForestMonogram() {
  return (
    <div className="relative mx-auto flex h-[60px] w-[60px] items-center justify-center border border-gold/50">
      <span className="font-serif text-lg leading-none tracking-tight text-forest">
        F
        <span className="mx-px align-baseline font-serif italic text-gold text-sm">
          &amp;
        </span>
        Co
      </span>
    </div>
  );
}

function DocumentCard({ document }: { document: ChatDocument }) {
  const [copied, setCopied] = useState(false);
  const draft = { subject: document.subject, body: document.body };

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatNoticeForCopy(draft));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-4 max-w-2xl">
      <p className="font-serif text-xl tracking-wide text-[#1A0A0C]">
        {document.documentName}
      </p>
      <p className="mt-1 text-xs font-normal uppercase tracking-[0.14em] text-gold">
        {document.subject}
      </p>
      <pre className="mt-5 max-h-80 overflow-y-auto whitespace-pre-wrap font-sans text-[15px] font-light leading-[1.7] text-[#1A0A0C]">
        {document.body}
      </pre>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="border border-forest px-3 py-1.5 text-[11px] font-normal uppercase tracking-[0.12em] text-forest transition hover:bg-[rgba(26,46,26,0.04)]"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <a
          href={buildMailtoUrl(draft)}
          className="border border-forest px-3 py-1.5 text-[11px] font-normal uppercase tracking-[0.12em] text-forest transition hover:bg-[rgba(26,46,26,0.04)]"
        >
          Open in Mail
        </a>
        <a
          href={buildGmailComposeUrl(draft)}
          target="_blank"
          rel="noreferrer"
          className="border border-forest px-3 py-1.5 text-[11px] font-normal uppercase tracking-[0.12em] text-forest transition hover:bg-[rgba(26,46,26,0.04)]"
        >
          Open in Gmail
        </a>
      </div>
    </div>
  );
}

const emptyDraftSession = (): DraftSession => ({
  documentType: null,
  propertyId: null,
  tenancyId: null,
  fields: {},
  awaiting: null,
  fieldIndex: 0,
});

export default function AssistantChat({
  properties,
  tenancies,
  initialAction = null,
}: AssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeNav, setActiveNav] = useState<NavId>("new");
  const [history, setHistory] = useState<AssistantHistoryEntry[]>([]);
  const [draftSession, setDraftSession] = useState<DraftSession>(emptyDraftSession());
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);
  const conversationStarted = messages.length > 0;

  useEffect(() => {
    setHistory(readAssistantHistory());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const append = useCallback((message: Omit<ChatMessage, "id"> & { id?: string }) => {
    const next = { ...message, id: message.id ?? uid() };
    setMessages((prev) => [...prev, next]);
    return next;
  }, []);

  const refreshHistory = useCallback(() => {
    setHistory(readAssistantHistory());
  }, []);

  async function askPortfolio(question: string, priorMessages?: ChatMessage[]) {
    const source = priorMessages ?? messages;
    const historyPayload = source
      .filter((message) => message.role === "user" || message.role === "assistant")
      .filter((message) => message.content.trim() && !message.document)
      .slice(-12)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    const response = await fetch("/api/assistant/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: question,
        history: historyPayload,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unable to get a response.");
    }

    return data.reply as string;
  }

  async function runComplianceCheck() {
    setActiveNav("compliance");
    setError(null);
    append({
      role: "assistant",
      content: "Checking your portfolio…",
    });
    setLoading(true);

    try {
      const response = await fetch("/api/assistant/compliance", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to run compliance check.");
      }

      append({
        role: "assistant",
        content: data.summary as string,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to run compliance check.";
      setError(message);
      append({
        role: "assistant",
        content: `I couldn't complete the compliance check. ${message}`,
      });
    } finally {
      setLoading(false);
    }
  }

  function startDraftFlow() {
    setActiveNav("draft");
    setDraftSession({
      ...emptyDraftSession(),
      awaiting: "type",
    });
    append({
      role: "assistant",
      content: "What would you like to draft?",
      chipKind: "document",
      chips: ASSISTANT_DOCUMENTS.map((document) => ({
        id: document.id,
        label: document.name,
      })),
    });
  }

  function askNextDraftStep(session: DraftSession) {
    const definition = session.documentType
      ? getAssistantDocument(session.documentType)
      : null;

    if (!session.propertyId) {
      if (properties.length === 0) {
        append({
          role: "assistant",
          content:
            "You don't have any properties yet. Add a property in Compliance first, then we can draft.",
        });
        setDraftSession(emptyDraftSession());
        return;
      }

      setDraftSession({ ...session, awaiting: "property" });
      append({
        role: "assistant",
        content: "Which property is this for?",
        chipKind: "property",
        chips: properties.map((property) => ({
          id: property.id,
          label: property.address,
        })),
      });
      return;
    }

    if (definition?.requiresTenancy && !session.tenancyId) {
      const linked = tenancies.filter((tenancy) => {
        const property = properties.find((item) => item.id === session.propertyId);
        return (
          tenancy.property_id === session.propertyId ||
          (property &&
            tenancy.property_address.trim().toLowerCase() ===
              property.address.trim().toLowerCase())
        );
      });

      if (linked.length === 0) {
        append({
          role: "assistant",
          content:
            "I couldn't find a tenancy for that property. Add a tenancy first, or choose a different property.",
        });
        setDraftSession({ ...session, propertyId: null, awaiting: "property" });
        return;
      }

      setDraftSession({ ...session, awaiting: "tenancy" });
      append({
        role: "assistant",
        content: "Which tenancy should this relate to?",
        chipKind: "tenancy",
        chips: linked.map((tenancy) => ({
          id: tenancy.id,
          label: `${tenancy.tenant_names} — ends ${tenancy.end_date}`,
        })),
      });
      return;
    }

    const fields = definition?.fields ?? [];
    if (session.fieldIndex < fields.length) {
      const field = fields[session.fieldIndex];
      setDraftSession({ ...session, awaiting: "field" });
      append({
        role: "assistant",
        content: field.required
          ? `${field.label}?`
          : `${field.label}? (optional — press send blank to skip)`,
      });
      return;
    }

    void completeDraft(session);
  }

  async function completeDraft(session: DraftSession) {
    const definition = session.documentType
      ? getAssistantDocument(session.documentType)
      : null;
    if (!definition || !session.propertyId) return;

    setLoading(true);
    setDraftSession({ ...session, awaiting: null });
    append({
      role: "assistant",
      content: `Drafting your ${definition.name}…`,
    });

    try {
      const response = await fetch("/api/assistant/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: definition.id,
          propertyId: session.propertyId,
          tenancyId: session.tenancyId,
          fields: session.fields,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to draft document.");
      }

      const entry = addAssistantHistoryEntry({
        title: data.subject || data.documentName,
        documentType: definition.id,
        documentName: data.documentName,
        subject: data.subject,
        body: data.body,
      });
      refreshHistory();

      append({
        role: "assistant",
        content: "Here is your draft. Review it carefully before use.",
        document: {
          id: entry.id,
          documentName: data.documentName,
          subject: data.subject,
          body: data.body,
          documentType: definition.id,
        },
      });
      setDraftSession(emptyDraftSession());
      setActiveNav("history");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to draft document.";
      setError(message);
      append({
        role: "assistant",
        content: `I couldn't draft that document. ${message}`,
      });
      setDraftSession(emptyDraftSession());
    } finally {
      setLoading(false);
    }
  }

  async function sendFreeform(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    if (draftSession.awaiting === "field" && draftSession.documentType) {
      const definition = getAssistantDocument(draftSession.documentType);
      const field = definition?.fields[draftSession.fieldIndex];
      if (field) {
        if (field.required && !trimmed) return;
        append({ role: "user", content: trimmed || "(skipped)" });
        const nextFields = { ...draftSession.fields };
        if (trimmed) nextFields[field.id] = trimmed;
        const nextSession = {
          ...draftSession,
          fields: nextFields,
          fieldIndex: draftSession.fieldIndex + 1,
          awaiting: null as DraftSession["awaiting"],
        };
        setDraftSession(nextSession);
        setInput("");
        askNextDraftStep(nextSession);
        return;
      }
    }

    if (draftSession.awaiting) {
      append({ role: "user", content: trimmed });
      setInput("");
      append({
        role: "assistant",
        content:
          "Please use one of the options above, or start a new conversation to ask something else.",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: uid(),
      role: "user",
      content: trimmed,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);
    setActiveNav("new");

    try {
      const reply = await askPortfolio(trimmed, nextMessages);
      append({ role: "assistant", content: reply });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to get a response.";
      setError(message);
      append({
        role: "assistant",
        content: `I ran into a problem. ${message}`,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleChip(message: ChatMessage, chipId: string, label: string) {
    if (loading) return;

    if (message.chipKind === "suggestion" || !message.chipKind) {
      void handleWelcomeChip(chipId);
      return;
    }

    append({ role: "user", content: label });

    if (message.chipKind === "document") {
      const next = {
        ...draftSession,
        documentType: chipId as AssistantDocumentType,
        awaiting: null as DraftSession["awaiting"],
      };
      setDraftSession(next);
      askNextDraftStep(next);
      return;
    }

    if (message.chipKind === "property") {
      const next = {
        ...draftSession,
        propertyId: chipId,
        tenancyId: null,
        awaiting: null as DraftSession["awaiting"],
      };
      setDraftSession(next);
      askNextDraftStep(next);
      return;
    }

    if (message.chipKind === "tenancy") {
      const next = {
        ...draftSession,
        tenancyId: chipId,
        awaiting: null as DraftSession["awaiting"],
      };
      setDraftSession(next);
      askNextDraftStep(next);
    }
  }

  async function handleWelcomeChip(id: string) {
    if (id === "compliance") {
      append({ role: "user", content: "Check my compliance status" });
      await runComplianceCheck();
      return;
    }
    if (id === "draft") {
      append({ role: "user", content: "Draft a document" });
      startDraftFlow();
      return;
    }
    if (id === "expiry") {
      await sendFreeform("Which certificates expire soon?");
      return;
    }
    if (id === "tenancies") {
      await sendFreeform("Review my tenancies — summarise upcoming renewals and any risks.");
    }
  }

  function handleNav(id: NavId) {
    if (id === "new") {
      setMessages([]);
      setDraftSession(emptyDraftSession());
      setError(null);
      setActiveNav("new");
      setInput("");
      return;
    }

    if (id === "draft") {
      append({ role: "user", content: "Draft a document" });
      startDraftFlow();
      return;
    }

    if (id === "compliance") {
      append({
        role: "user",
        content: conversationStarted
          ? "Run a compliance check"
          : "Check my compliance status",
      });
      void runComplianceCheck();
      return;
    }

    if (id === "history") {
      setActiveNav("history");
      const historyEl = document.getElementById("assistant-history");
      historyEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function loadHistoryEntry(entry: AssistantHistoryEntry) {
    setActiveNav("history");
    setDraftSession(emptyDraftSession());
    append({
      role: "assistant",
      content: "Here's the draft from earlier in this session.",
      document: {
        id: entry.id,
        documentName: entry.documentName,
        subject: entry.subject,
        body: entry.body,
        documentType: entry.documentType,
      },
    });
  }

  useEffect(() => {
    if (startedRef.current || !initialAction) return;
    startedRef.current = true;

    if (initialAction === "draft") {
      handleNav("draft");
    } else if (initialAction === "compliance") {
      handleNav("compliance");
    } else if (initialAction === "expiry") {
      void sendFreeform("Which certificates expire soon?");
    }
    // intentionally once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction]);

  const navItems: Array<{ id: NavId; label: string }> = [
    { id: "new", label: "New Conversation" },
    { id: "draft", label: "Draft a Document" },
    { id: "compliance", label: "Compliance Check" },
    { id: "history", label: "Document History" },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden lg:flex-row">
      <aside className="flex max-h-[40vh] w-full shrink-0 flex-col overflow-y-auto bg-forest lg:max-h-none lg:w-[30%] lg:min-w-[16rem] lg:max-w-sm">
        <div className="px-6 pt-8 pb-4 sm:px-8">
          <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-dusty-cream/90">
            Assistant
          </p>
          <div className="mt-3 h-px w-full bg-gold/55" aria-hidden="true" />
        </div>

        <nav className="px-3 sm:px-5" aria-label="Assistant navigation">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNav(item.id)}
                    className={`block w-full border-l-2 py-3.5 pl-5 text-left text-sm font-light tracking-wide text-dusty-cream/85 transition ${
                      isActive
                        ? "border-gold text-dusty-cream"
                        : "border-transparent hover:text-dusty-cream"
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div id="assistant-history" className="mt-8 flex-1 px-6 sm:px-8">
          <p className="text-[10px] font-normal uppercase tracking-[0.18em] text-dusty-cream/50">
            Recent drafts
          </p>
          {history.length === 0 ? (
            <p className="mt-4 text-xs font-light leading-relaxed text-dusty-cream/40">
              Drafts from this session appear here.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {history.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => loadHistoryEntry(entry)}
                    className="w-full text-left transition hover:opacity-90"
                  >
                    <span className="block truncate text-sm font-light text-dusty-cream/85">
                      {entry.title}
                    </span>
                    <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-dusty-cream/45">
                      {entry.documentName}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-auto px-6 py-6 text-[10px] font-light leading-relaxed text-dusty-cream/40 sm:px-8">
          {ASSISTANT_DISCLAIMER}
        </p>
      </aside>

      <section className="relative flex min-h-0 flex-1 flex-col bg-greige">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-10 lg:px-14">
          {!conversationStarted ? (
            <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center pb-28 text-center">
              <ForestMonogram />
              <p className="mt-8 text-sm italic text-gold">{greeting()}</p>
              <h1 className="mt-3 font-serif text-3xl tracking-wide text-[#1A0A0C] sm:text-4xl">
                How can I help you today?
              </h1>

              <div className="mt-10 grid w-full gap-3 sm:grid-cols-2">
                {WELCOME_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    disabled={loading}
                    onClick={() => void handleWelcomeChip(chip.id)}
                    className="border border-forest px-4 py-3 text-left text-sm font-light leading-snug text-forest transition hover:bg-[rgba(26,46,26,0.04)] disabled:opacity-50"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 pb-28">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "user" ? (
                    <div className="max-w-[80%] rounded-full bg-forest px-4 py-2 text-sm font-light leading-relaxed text-dusty-cream">
                      {message.content}
                    </div>
                  ) : (
                    <div className="max-w-[92%] border-l-2 border-forest pl-4">
                      <p className="whitespace-pre-wrap font-sans text-[15px] font-light leading-relaxed text-[#1A0A0C]">
                        {message.content}
                      </p>
                      {message.chips && message.chips.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {message.chips.map((chip) => (
                            <button
                              key={chip.id}
                              type="button"
                              disabled={loading}
                              onClick={() =>
                                handleChip(message, chip.id, chip.label)
                              }
                              className="border border-forest px-3 py-1.5 text-left text-xs font-light text-forest transition hover:bg-[rgba(26,46,26,0.04)] disabled:opacity-50"
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      )}
                      {message.document && (
                        <DocumentCard document={message.document} />
                      )}
                    </div>
                  )}
                </div>
              ))}

              {loading && <TypingDots />}
              {error && (
                <p className="text-sm font-light text-urgent">{error}</p>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-greige/95 px-5 pb-5 pt-3 sm:px-10 lg:px-14">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendFreeform(input);
            }}
            className="mx-auto flex max-w-3xl items-center gap-3 border border-forest bg-[#FAF8F5] px-4 py-3"
          >
            <label htmlFor="assistant-chat-input" className="sr-only">
              Ask anything about your portfolio
            </label>
            <input
              id="assistant-chat-input"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask anything about your portfolio..."
              disabled={loading}
              className="min-w-0 flex-1 border-0 bg-transparent text-[15px] font-light text-[#1A0A0C] outline-none placeholder:text-[#97795D]/70"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="shrink-0 text-forest transition hover:text-forest-dark disabled:opacity-40"
            >
              <span className="text-lg leading-none" aria-hidden="true">
                →
              </span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
