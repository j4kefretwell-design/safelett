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
  getAssistantSession,
  readAssistantSessions,
  sessionKindLabel,
  upsertAssistantSession,
  type AssistantSession,
  type AssistantSessionKind,
  type AssistantSessionMessage,
} from "@/lib/assistant-sessions";
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
  initialAction?: "draft" | "compliance" | "expiry" | "ask" | null;
}

type View =
  | { screen: "menu" }
  | { screen: "ask"; sessionId: string }
  | { screen: "draft-pick"; sessionId: string }
  | {
      screen: "draft";
      sessionId: string;
      documentType: AssistantDocumentType;
    }
  | { screen: "compliance"; sessionId: string };

type DraftAwaiting = "property" | "tenancy" | "field" | null;

type DraftState = {
  propertyId: string | null;
  tenancyId: string | null;
  fields: Record<string, string>;
  awaiting: DraftAwaiting;
  fieldIndex: number;
};

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
    <div className="flex items-center gap-1.5 border-l-2 border-forest py-2 pl-4">
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

function ForestMonogram({ size = 60 }: { size?: number }) {
  return (
    <div
      className="relative mx-auto flex items-center justify-center border border-gold/50"
      style={{ width: size, height: size }}
    >
      <span className="font-serif text-lg leading-none tracking-tight text-forest">
        F
        <span className="mx-px align-baseline font-serif text-sm italic text-gold">
          &amp;
        </span>
        Co
      </span>
    </div>
  );
}

function DocumentCard({
  document,
}: {
  document: NonNullable<AssistantSessionMessage["document"]>;
}) {
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

function createSession(
  kind: AssistantSessionKind,
  title: string,
  extras: Partial<AssistantSession> = {}
): AssistantSession {
  const now = new Date().toISOString();
  return {
    id: uid(),
    kind,
    title,
    createdAt: now,
    updatedAt: now,
    messages: [],
    ...extras,
  };
}

const ASK_EXAMPLES = [
  "Which certificates expire this month?",
  "Are any deposits unprotected?",
  "Which tenancies are up for renewal?",
  "Which properties are fully compliant?",
] as const;

const emptyDraftState = (): DraftState => ({
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
  const [view, setView] = useState<View>({ screen: "menu" });
  const [sessions, setSessions] = useState<AssistantSession[]>([]);
  const [documentHistory, setDocumentHistory] = useState<
    AssistantHistoryEntry[]
  >([]);
  const [messages, setMessages] = useState<AssistantSessionMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftState, setDraftState] = useState<DraftState>(emptyDraftState());
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);
  const sessionId =
    view.screen === "menu" ? null : "sessionId" in view ? view.sessionId : null;

  const refreshLists = useCallback(() => {
    setSessions(readAssistantSessions());
    setDocumentHistory(readAssistantHistory());
  }, []);

  useEffect(() => {
    refreshLists();
  }, [refreshLists]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, view.screen]);

  const persistSession = useCallback(
    (
      id: string,
      patch: Partial<AssistantSession> & {
        messages?: AssistantSessionMessage[];
      }
    ) => {
      const existing = getAssistantSession(id);
      if (!existing) return;
      const next: AssistantSession = {
        ...existing,
        ...patch,
        messages: patch.messages ?? existing.messages,
        updatedAt: new Date().toISOString(),
      };
      upsertAssistantSession(next);
      refreshLists();
    },
    [refreshLists]
  );

  const appendMessage = useCallback(
    (
      id: string | null,
      message: Omit<AssistantSessionMessage, "id"> & { id?: string }
    ) => {
      const nextMessage: AssistantSessionMessage = {
        ...message,
        id: message.id ?? uid(),
      };
      setMessages((prev) => {
        const next = [...prev, nextMessage];
        if (id) {
          const existing = getAssistantSession(id);
          if (existing) {
            upsertAssistantSession({
              ...existing,
              messages: next,
              updatedAt: new Date().toISOString(),
            });
            queueMicrotask(refreshLists);
          }
        }
        return next;
      });
      return nextMessage;
    },
    [refreshLists]
  );

  function goToMenu() {
    setView({ screen: "menu" });
    setMessages([]);
    setInput("");
    setError(null);
    setLoading(false);
    setDraftState(emptyDraftState());
  }

  function openAskSession(existing?: AssistantSession) {
    const session =
      existing ??
      (() => {
        const created = createSession("ask", "Portfolio questions");
        upsertAssistantSession(created);
        refreshLists();
        return created;
      })();

    setMessages(session.messages);
    setDraftState(emptyDraftState());
    setError(null);
    setInput("");
    setView({ screen: "ask", sessionId: session.id });
    return session;
  }

  function openDraftPicker(existing?: AssistantSession) {
    const session =
      existing ??
      (() => {
        const created = createSession("draft", "New draft");
        upsertAssistantSession(created);
        refreshLists();
        return created;
      })();

    setMessages(session.messages);
    setDraftState(emptyDraftState());
    setError(null);
    setInput("");
    setView({ screen: "draft-pick", sessionId: session.id });
  }

  function openComplianceSession(existing?: AssistantSession) {
    const session =
      existing ??
      (() => {
        const created = createSession("compliance", "Compliance check");
        upsertAssistantSession(created);
        refreshLists();
        return created;
      })();

    setMessages(session.messages);
    setError(null);
    setInput("");
    setView({ screen: "compliance", sessionId: session.id });

    if (session.messages.length === 0) {
      void runCompliance(session.id, []);
    }
  }

  function restoreSession(session: AssistantSession) {
    if (session.kind === "ask") {
      openAskSession(session);
      return;
    }
    if (session.kind === "compliance") {
      openComplianceSession(session);
      return;
    }
    if (session.documentType) {
      setMessages(session.messages);
      setDraftState(emptyDraftState());
      setError(null);
      setInput("");
      setView({
        screen: "draft",
        sessionId: session.id,
        documentType: session.documentType,
      });
      return;
    }
    openDraftPicker(session);
  }

  async function askPortfolio(
    question: string,
    id: string,
    prior: AssistantSessionMessage[]
  ) {
    const historyPayload = prior
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

  async function sendAskToSession(
    id: string,
    question: string,
    priorMessages: AssistantSessionMessage[]
  ) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userMessage: AssistantSessionMessage = {
      id: uid(),
      role: "user",
      content: trimmed,
    };
    const nextMessages = [...priorMessages, userMessage];
    setMessages(nextMessages);
    persistSession(id, {
      messages: nextMessages,
      title:
        priorMessages.length === 0
          ? trimmed.slice(0, 48)
          : getAssistantSession(id)?.title,
    });
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const reply = await askPortfolio(trimmed, id, nextMessages);
      appendMessage(id, { role: "assistant", content: reply });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to get a response.";
      setError(message);
      appendMessage(id, {
        role: "assistant",
        content: `I ran into a problem. ${message}`,
      });
    } finally {
      setLoading(false);
    }
  }

  async function sendAsk(question: string) {
    if (view.screen !== "ask" || !sessionId) return;
    await sendAskToSession(sessionId, question, messages);
  }

  async function runCompliance(
    id: string,
    priorMessages: AssistantSessionMessage[]
  ) {
    setLoading(true);
    setError(null);

    const checking: AssistantSessionMessage = {
      id: uid(),
      role: "assistant",
      content: "Checking your portfolio…",
    };
    const withChecking = [...priorMessages, checking];
    setMessages(withChecking);
    persistSession(id, { messages: withChecking });

    try {
      const response = await fetch("/api/assistant/compliance", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to run compliance check.");
      }

      const summary: AssistantSessionMessage = {
        id: uid(),
        role: "assistant",
        content: data.summary as string,
      };
      const next = [...withChecking, summary];
      setMessages(next);
      persistSession(id, { messages: next, title: "Compliance check" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to run compliance check.";
      setError(message);
      const fail: AssistantSessionMessage = {
        id: uid(),
        role: "assistant",
        content: `I couldn't complete the compliance check. ${message}`,
      };
      const next = [...withChecking, fail];
      setMessages(next);
      persistSession(id, { messages: next });
    } finally {
      setLoading(false);
    }
  }

  function beginDraftType(documentType: AssistantDocumentType) {
    if (view.screen !== "draft-pick" && view.screen !== "draft") return;
    const id = sessionId;
    if (!id) return;

    const definition = getAssistantDocument(documentType);
    if (!definition) return;

    const intro: AssistantSessionMessage = {
      id: uid(),
      role: "assistant",
      content: `We'll draft a ${definition.name}. Let's gather the details.`,
    };

    const opening: AssistantSessionMessage[] = [intro];
    let nextState = emptyDraftState();

    if (properties.length === 0) {
      opening.push({
        id: uid(),
        role: "assistant",
        content:
          "You don't have any properties yet. Add a property in Compliance first, then start a new Draft session.",
      });
    } else {
      nextState = { ...nextState, awaiting: "property" };
      opening.push({
        id: uid(),
        role: "assistant",
        content: "Which property is this for?",
        chipKind: "property",
        chips: properties.map((property) => ({
          id: property.id,
          label: property.address,
        })),
      });
    }

    setMessages(opening);
    setDraftState(nextState);
    persistSession(id, {
      messages: opening,
      title: definition.name,
      documentType,
      documentName: definition.name,
    });
    setView({ screen: "draft", sessionId: id, documentType });
  }

  function askNextDraftStep(
    id: string,
    documentType: AssistantDocumentType,
    state: DraftState,
    currentMessages: AssistantSessionMessage[]
  ) {
    const definition = getAssistantDocument(documentType);
    if (!definition) return;

    if (!state.propertyId) {
      if (properties.length === 0) {
        appendMessage(id, {
          role: "assistant",
          content:
            "You don't have any properties yet. Add a property in Compliance first, then start a new Draft session.",
        });
        setDraftState(emptyDraftState());
        return;
      }

      setDraftState({ ...state, awaiting: "property" });
      appendMessage(id, {
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

    if (definition.requiresTenancy && !state.tenancyId) {
      const property = properties.find((item) => item.id === state.propertyId);
      const linked = tenancies.filter(
        (tenancy) =>
          tenancy.property_id === state.propertyId ||
          (property &&
            tenancy.property_address.trim().toLowerCase() ===
              property.address.trim().toLowerCase())
      );

      if (linked.length === 0) {
        appendMessage(id, {
          role: "assistant",
          content:
            "I couldn't find a tenancy for that property. Add a tenancy first, or choose another property.",
        });
        const reset = { ...state, propertyId: null, awaiting: "property" as const };
        setDraftState(reset);
        return;
      }

      setDraftState({ ...state, awaiting: "tenancy" });
      appendMessage(id, {
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

    const fields = definition.fields;
    if (state.fieldIndex < fields.length) {
      const field = fields[state.fieldIndex];
      setDraftState({ ...state, awaiting: "field" });
      appendMessage(id, {
        role: "assistant",
        content: field.required
          ? `${field.label}?`
          : `${field.label}? (optional — leave blank and send to skip)`,
      });
      return;
    }

    void completeDraft(id, documentType, state, currentMessages);
  }

  async function completeDraft(
    id: string,
    documentType: AssistantDocumentType,
    state: DraftState,
    _currentMessages: AssistantSessionMessage[]
  ) {
    const definition = getAssistantDocument(documentType);
    if (!definition || !state.propertyId) return;

    setLoading(true);
    setDraftState({ ...state, awaiting: null });
    appendMessage(id, {
      role: "assistant",
      content: `Drafting your ${definition.name}…`,
    });

    try {
      const response = await fetch("/api/assistant/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: definition.id,
          propertyId: state.propertyId,
          tenancyId: state.tenancyId,
          fields: state.fields,
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
      refreshLists();

      appendMessage(id, {
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
      setDraftState(emptyDraftState());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to draft document.";
      setError(message);
      appendMessage(id, {
        role: "assistant",
        content: `I couldn't draft that document. ${message}`,
      });
      setDraftState(emptyDraftState());
    } finally {
      setLoading(false);
    }
  }

  function handleDraftChip(
    chipKind: "property" | "tenancy",
    chipId: string,
    label: string
  ) {
    if (view.screen !== "draft" || !sessionId || loading) return;

    appendMessage(sessionId, { role: "user", content: label });

    if (chipKind === "property") {
      const next = {
        ...draftState,
        propertyId: chipId,
        tenancyId: null,
        awaiting: null as DraftAwaiting,
      };
      setDraftState(next);
      askNextDraftStep(sessionId, view.documentType, next, messages);
      return;
    }

    const next = {
      ...draftState,
      tenancyId: chipId,
      awaiting: null as DraftAwaiting,
    };
    setDraftState(next);
    askNextDraftStep(sessionId, view.documentType, next, messages);
  }

  function sendDraftInput(value: string) {
    if (view.screen !== "draft" || !sessionId) return;
    const trimmed = value.trim();

    if (draftState.awaiting === "field") {
      const definition = getAssistantDocument(view.documentType);
      const field = definition?.fields[draftState.fieldIndex];
      if (!field) return;
      if (field.required && !trimmed) return;

      appendMessage(sessionId, {
        role: "user",
        content: trimmed || "(skipped)",
      });
      const nextFields = { ...draftState.fields };
      if (trimmed) nextFields[field.id] = trimmed;
      const next = {
        ...draftState,
        fields: nextFields,
        fieldIndex: draftState.fieldIndex + 1,
        awaiting: null as DraftAwaiting,
      };
      setDraftState(next);
      setInput("");
      askNextDraftStep(sessionId, view.documentType, next, messages);
      return;
    }

    if (draftState.awaiting) {
      appendMessage(sessionId, { role: "user", content: trimmed });
      setInput("");
      appendMessage(sessionId, {
        role: "assistant",
        content: "Please choose one of the options above to continue this draft.",
      });
      return;
    }

    appendMessage(sessionId, { role: "user", content: trimmed });
    setInput("");
    appendMessage(sessionId, {
      role: "assistant",
      content:
        "This session is for drafting only. Use the steps above, or go back to the menu to Ask Your Portfolio.",
    });
  }

  function loadDocumentIntoDraftView(entry: AssistantHistoryEntry) {
    const session = createSession("draft", entry.documentName, {
      documentType: entry.documentType,
      documentName: entry.documentName,
      messages: [
        {
          id: uid(),
          role: "assistant",
          content: "Here's a draft from earlier in this session.",
          document: {
            id: entry.id,
            documentName: entry.documentName,
            subject: entry.subject,
            body: entry.body,
            documentType: entry.documentType,
          },
        },
      ],
    });
    upsertAssistantSession(session);
    refreshLists();
    setMessages(session.messages);
    setDraftState(emptyDraftState());
    setView({
      screen: "draft",
      sessionId: session.id,
      documentType: entry.documentType,
    });
  }

  useEffect(() => {
    if (startedRef.current || !initialAction) return;
    startedRef.current = true;

    if (initialAction === "ask" || initialAction === "expiry") {
      const session = openAskSession();
      if (initialAction === "expiry") {
        void sendAskToSession(
          session.id,
          "Which certificates expire soon?",
          session.messages
        );
      }
      return;
    }
    if (initialAction === "draft") {
      openDraftPicker();
      return;
    }
    if (initialAction === "compliance") {
      openComplianceSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction]);

  const showChatShell =
    view.screen === "ask" ||
    view.screen === "draft" ||
    view.screen === "compliance";

  const inputPlaceholder =
    view.screen === "ask"
      ? "Ask anything about your portfolio..."
      : view.screen === "draft"
        ? draftState.awaiting === "field"
          ? "Type your answer…"
          : "Answer the drafting prompts above…"
        : "Compliance check in progress…";

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden lg:flex-row">
      <aside className="flex max-h-[42vh] w-full shrink-0 flex-col overflow-y-auto bg-forest lg:max-h-none lg:w-[30%] lg:min-w-[16rem] lg:max-w-sm">
        <div className="px-6 pt-8 pb-2 sm:px-8">
          <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-dusty-cream/90">
            Assistant
          </p>
          <div className="mt-3 h-px w-full bg-gold/55" aria-hidden="true" />
        </div>

        <div className="px-3 pt-4 sm:px-5">
          <button
            type="button"
            onClick={goToMenu}
            className="block w-full border-l-2 border-transparent py-3.5 pl-5 text-left text-sm font-light tracking-wide text-dusty-cream/85 transition hover:border-gold/40 hover:text-dusty-cream"
          >
            New Session
          </button>
        </div>

        <div className="mt-6 px-6 sm:px-8">
          <p className="text-[10px] font-normal uppercase tracking-[0.18em] text-dusty-cream/50">
            Recent sessions
          </p>
          {sessions.length === 0 ? (
            <p className="mt-3 text-xs font-light leading-relaxed text-dusty-cream/40">
              Ask and Draft sessions from this browser session appear here.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {sessions.map((session) => {
                const active = sessionId === session.id;
                return (
                  <li key={session.id}>
                    <button
                      type="button"
                      onClick={() => restoreSession(session)}
                      className={`w-full border-l-2 py-1 pl-3 text-left transition ${
                        active
                          ? "border-gold text-dusty-cream"
                          : "border-transparent text-dusty-cream/80 hover:text-dusty-cream"
                      }`}
                    >
                      <span className="block text-[10px] uppercase tracking-[0.14em] text-dusty-cream/45">
                        {sessionKindLabel(session.kind)}
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-light">
                        {session.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-8 px-3 sm:px-5">
          <button
            type="button"
            onClick={() => openComplianceSession()}
            className="block w-full border-l-2 border-transparent py-3 pl-5 text-left text-sm font-light tracking-wide text-gold transition hover:border-gold/40"
          >
            Compliance Check
          </button>
        </div>

        <div className="mt-6 flex-1 px-6 sm:px-8">
          <p className="text-[10px] font-normal uppercase tracking-[0.18em] text-dusty-cream/50">
            Document history
          </p>
          {documentHistory.length === 0 ? (
            <p className="mt-3 text-xs font-light leading-relaxed text-dusty-cream/40">
              Completed drafts appear here.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {documentHistory.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => loadDocumentIntoDraftView(entry)}
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
        {view.screen === "menu" && (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-12 sm:px-10">
            <ForestMonogram />
            <p className="mt-8 text-sm italic text-gold">{greeting()}</p>
            <h1 className="mt-3 font-serif text-3xl tracking-wide text-[#1A0A0C] sm:text-4xl">
              What would you like to do?
            </h1>

            <div className="mt-12 grid w-full max-w-4xl gap-6 lg:grid-cols-2">
              <div className="border-l-[3px] border-forest bg-transparent px-6 py-8 sm:px-8">
                <h2 className="font-serif text-2xl tracking-wide text-forest">
                  Ask Your Portfolio
                </h2>
                <p className="mt-4 text-sm font-light leading-relaxed text-[#1A0A0C]/85">
                  Ask questions about your properties, tenancies, certificates
                  and compliance status. Get instant answers from your live
                  portfolio data.
                </p>
                <p className="mt-5 text-xs font-light leading-relaxed text-cocoa">
                  &ldquo;Which certificates expire this month?&rdquo; / &ldquo;Are
                  any deposits unprotected?&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => openAskSession()}
                  className="mt-8 border border-forest px-5 py-2.5 text-xs font-normal uppercase tracking-[0.14em] text-forest transition hover:bg-[rgba(26,46,26,0.04)]"
                >
                  Start Conversation
                </button>
              </div>

              <div className="border-l-[3px] border-forest bg-transparent px-6 py-8 sm:px-8">
                <h2 className="font-serif text-2xl tracking-wide text-forest">
                  Draft a Document
                </h2>
                <p className="mt-4 text-sm font-light leading-relaxed text-[#1A0A0C]/85">
                  Generate professional letters, notices and correspondence using
                  your property and tenancy data. Review and send from your own
                  email.
                </p>
                <p className="mt-5 text-xs font-light leading-relaxed text-cocoa">
                  Rent increase notice / End of tenancy letter / Maintenance
                  access
                </p>
                <button
                  type="button"
                  onClick={() => openDraftPicker()}
                  className="mt-8 border border-forest px-5 py-2.5 text-xs font-normal uppercase tracking-[0.14em] text-forest transition hover:bg-[rgba(26,46,26,0.04)]"
                >
                  Choose Document
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openComplianceSession()}
              className="mt-12 text-sm font-light text-gold transition hover:text-gold-readable"
            >
              COMPLIANCE CHECK — Run a quick compliance check across your
              portfolio →
            </button>
          </div>
        )}

        {view.screen === "draft-pick" && (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-10 lg:px-14">
            <button
              type="button"
              onClick={goToMenu}
              className="text-sm font-light text-cocoa transition hover:text-[#1A0A0C]"
            >
              ← Back to Menu
            </button>

            <div className="mx-auto mt-10 max-w-2xl">
              <p className="text-[11px] font-normal uppercase tracking-[0.2em] text-forest">
                Choose Document Type
              </p>
              <div className="mt-3 h-px w-full bg-gold/55" aria-hidden="true" />
              <ul className="mt-2">
                {ASSISTANT_DOCUMENTS.map((document) => (
                  <li key={document.id}>
                    <button
                      type="button"
                      onClick={() => beginDraftType(document.id)}
                      className="group flex w-full items-center gap-4 border-t border-gold/40 border-l-[3px] border-l-transparent py-7 text-left transition hover:border-l-forest hover:bg-[rgba(26,46,26,0.04)]"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif text-xl tracking-wide text-[#1A0A0C]">
                          {document.name}
                        </span>
                        <span className="mt-1 block text-sm font-light text-cocoa">
                          {document.description}
                        </span>
                      </span>
                      <span className="text-forest transition group-hover:translate-x-0.5">
                        →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {showChatShell && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-10 lg:px-14">
              <button
                type="button"
                onClick={goToMenu}
                className="text-sm font-light text-cocoa transition hover:text-[#1A0A0C]"
              >
                ← Back to Menu
              </button>

              <div className="mx-auto mt-8 max-w-3xl space-y-6 pb-28">
                {view.screen === "ask" && messages.length === 0 && !loading && (
                  <div className="space-y-6">
                    <p className="border-l-2 border-forest pl-4 text-[15px] font-light leading-relaxed text-[#1A0A0C]">
                      Ask anything about your properties, tenancies or certificates.
                    </p>
                    <div className="flex flex-wrap gap-2 pl-4">
                      {ASK_EXAMPLES.map((example) => (
                        <button
                          key={example}
                          type="button"
                          disabled={loading}
                          onClick={() => void sendAsk(example)}
                          className="border border-forest px-3 py-1.5 text-xs font-light text-forest transition hover:bg-[rgba(26,46,26,0.04)]"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                        {message.chips && message.chipKind && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {message.chips.map((chip) => (
                              <button
                                key={chip.id}
                                type="button"
                                disabled={loading}
                                onClick={() =>
                                  handleDraftChip(
                                    message.chipKind as "property" | "tenancy",
                                    chip.id,
                                    chip.label
                                  )
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
            </div>

            {view.screen !== "compliance" && (
              <div className="absolute inset-x-0 bottom-0 bg-greige/95 px-5 pb-5 pt-3 sm:px-10 lg:px-14">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (view.screen === "ask") void sendAsk(input);
                    else if (view.screen === "draft") sendDraftInput(input);
                  }}
                  className="mx-auto flex max-w-3xl items-center gap-3 border border-forest bg-[#FAF8F5] px-4 py-3"
                >
                  <label htmlFor="assistant-mode-input" className="sr-only">
                    Message
                  </label>
                  <input
                    id="assistant-mode-input"
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={inputPlaceholder}
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
            )}
          </>
        )}
      </section>
    </div>
  );
}
