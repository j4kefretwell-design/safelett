"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
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
  truncateChatTitle,
  type AssistantChatKind,
  type AssistantChatMessage,
  type AssistantChatRecord,
} from "@/lib/assistant-chats";
import {
  buildGmailComposeUrl,
  buildMailtoUrl,
  formatNoticeForCopy,
} from "@/lib/tenancy-notices";
import { siteImages } from "@/lib/site-images";
import type { Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

interface AssistantChatProps {
  properties: Property[];
  tenancies: Tenancy[];
  initialAction?:
    | "draft"
    | "compliance"
    | "expiry"
    | "ask"
    | "tenancy"
    | "property"
    | null;
}

type View =
  | { screen: "menu" }
  | { screen: "saved" }
  | { screen: "drafts" }
  | { screen: "ask"; sessionId: string }
  | { screen: "draft-pick"; sessionId: string }
  | { screen: "draft"; sessionId: string; documentType: AssistantDocumentType }
  | { screen: "compliance"; sessionId: string }
  | { screen: "tenancy-pick"; sessionId: string }
  | { screen: "tenancy"; sessionId: string; tenancyId: string }
  | { screen: "property-pick"; sessionId: string }
  | { screen: "property"; sessionId: string; propertyId: string };

type DraftState = {
  propertyId: string | null;
  tenancyId: string | null;
  fields: Record<string, string>;
  awaiting: "property" | "tenancy" | "field" | null;
  fieldIndex: number;
};

const emptyDraftState = (): DraftState => ({
  propertyId: null,
  tenancyId: null,
  fields: {},
  awaiting: null,
  fieldIndex: 0,
});

const ASK_EXAMPLES = [
  "Which certificates expire this month?",
  "Are any deposits unprotected?",
  "Which tenancies are up for renewal?",
  "Which properties are fully compliant?",
] as const;

const MODE_BOXES = [
  {
    label: "ASK",
    description: "Questions about your portfolio or property management",
    placeholder: "Ask a question about your portfolio…",
    kind: "ask" as const,
  },
  {
    label: "DRAFT",
    description: "Letters, notices and professional correspondence",
    placeholder: "What would you like to draft…",
    kind: "draft" as const,
  },
  {
    label: "TENANCY",
    description: "Review tenancy details and generate notices",
    placeholder: "Review a tenancy or generate a notice…",
    kind: "tenancy" as const,
  },
  {
    label: "REPORT",
    description: "Full property compliance and tenancy report",
    placeholder: "Run a property compliance report…",
    kind: "property" as const,
  },
] as const;

const uid = () => crypto.randomUUID();

function greeting() {
  const hour = new Date().getHours();
  return hour < 12
    ? "Good morning"
    : hour < 18
      ? "Good afternoon"
      : "Good evening";
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 border-l-2 border-study py-2 pl-4">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="assistant-typing-dot h-1.5 w-1.5 bg-study"
          style={{ animationDelay: `${dot * 160}ms` }}
        />
      ))}
    </div>
  );
}

function Monogram({ size = 50 }: { size?: number }) {
  const textSize = size <= 40 ? "text-xs" : "text-sm";
  return (
    <div
      className="flex shrink-0 items-center justify-center border border-moss"
      style={{ width: size, height: size }}
    >
      <span className={`font-serif tracking-tight text-study ${textSize}`}>
        F<span className="mx-px text-moss">&amp;</span>Co
      </span>
    </div>
  );
}

function DocumentCard({
  document,
}: {
  document: NonNullable<AssistantChatMessage["document"]>;
}) {
  const [copied, setCopied] = useState(false);
  const draft = { subject: document.subject, body: document.body };

  async function copy() {
    try {
      await navigator.clipboard.writeText(formatNoticeForCopy(draft));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const action =
    "text-[11px] uppercase tracking-[0.12em] text-study transition hover:text-moss";

  return (
    <div className="mt-6 max-w-xl border-l-2 border-study pl-5">
      <p className="font-serif text-lg text-study">{document.documentName}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-moss">
        {document.subject}
      </p>
      <p className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap text-[14px] leading-[1.75] text-[#1A0A0C]">
        {document.body}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={copy} className={action}>
          {copied ? "Copied" : "Copy"}
        </button>
        <a href={buildMailtoUrl(draft)} className={action}>
          Mail
        </a>
        <a
          href={buildGmailComposeUrl(draft)}
          target="_blank"
          rel="noreferrer"
          className={action}
        >
          Gmail
        </a>
      </div>
    </div>
  );
}

export default function AssistantChat({
  properties,
  tenancies,
  initialAction = null,
}: AssistantChatProps) {
  const [view, setView] = useState<View>({ screen: "menu" });
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftState, setDraftState] = useState<DraftState>(emptyDraftState());
  const [savedChats, setSavedChats] = useState<AssistantChatRecord[]>([]);
  const [documentHistory, setDocumentHistory] = useState<
    AssistantHistoryEntry[]
  >([]);
  const [savedChatId, setSavedChatId] = useState<string | null>(null);
  const [currentKind, setCurrentKind] = useState<AssistantChatKind>("ask");
  const [toast, setToast] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const sessionId =
    view.screen === "menu" || view.screen === "saved" || view.screen === "drafts"
      ? null
      : view.sessionId;

  const refreshSavedChats = useCallback(async () => {
    try {
      const response = await fetch("/api/assistant/chats");
      const data = await response.json();
      if (response.ok) setSavedChats(data.chats as AssistantChatRecord[]);
    } catch {
      /* saved chat list remains available on next visit */
    }
  }, []);

  useEffect(() => {
    void refreshSavedChats();
    setDocumentHistory(readAssistantHistory());
  }, [refreshSavedChats]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, view.screen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function reset(kind: AssistantChatKind = "ask") {
    setMessages([]);
    setInput("");
    setError(null);
    setLoading(false);
    setDraftState(emptyDraftState());
    setSavedChatId(null);
    setCurrentKind(kind);
  }

  function goToMenu() {
    reset();
    setView({ screen: "menu" });
  }

  function open(kind: AssistantChatKind) {
    const id = uid();
    reset(kind);
    if (kind === "ask") setView({ screen: "ask", sessionId: id });
    else if (kind === "draft") setView({ screen: "draft-pick", sessionId: id });
    else if (kind === "tenancy")
      setView({ screen: "tenancy-pick", sessionId: id });
    else if (kind === "property")
      setView({ screen: "property-pick", sessionId: id });
    else {
      setView({ screen: "compliance", sessionId: id });
      void runCompliance();
    }
    return id;
  }

  function append(message: Omit<AssistantChatMessage, "id">) {
    const next = { ...message, id: uid() };
    setMessages((previous) => [...previous, next]);
    return next;
  }

  function historyPayload(items: AssistantChatMessage[]) {
    return items
      .filter((item) => item.content.trim() && !item.document)
      .slice(-12)
      .map(({ role, content }) => ({ role, content }));
  }

  async function ask(
    question: string,
    mode: "ask" | "tenancy" | "property",
    entityId?: string,
    priorMessages?: AssistantChatMessage[]
  ) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    const prior = priorMessages ?? messages;
    const user = { id: uid(), role: "user" as const, content: trimmed };
    const next = [...prior, user];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/assistant/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload(prior),
          mode,
          tenancyId: mode === "tenancy" ? entityId : undefined,
          propertyId: mode === "property" ? entityId : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to get a response.");
      setMessages((current) => [
        ...current,
        { id: uid(), role: "assistant", content: data.reply as string },
      ]);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Unable to get a response.";
      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: uid(),
          role: "assistant",
          content: `I ran into a problem. ${message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function runCompliance() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/assistant/compliance", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to run compliance check.");
      const summary = (data.summary as string).trim();
      const followUp =
        "Would you like me to draft contractor booking emails for any of these?";
      const withFollowUp = summary.toLowerCase().includes(
        "contractor booking emails"
      )
        ? summary
        : `${summary}\n\n${followUp}`;
      append({ role: "assistant", content: withFollowUp });
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Unable to run compliance check.";
      setError(message);
      append({
        role: "assistant",
        content: `I couldn't complete the compliance check. ${message}`,
      });
    } finally {
      setLoading(false);
    }
  }

  function beginDraft(documentType: AssistantDocumentType) {
    if (!sessionId) return;
    const definition = getAssistantDocument(documentType);
    if (!definition) return;
    const opening: AssistantChatMessage[] = [
      {
        id: uid(),
        role: "assistant",
        content: `We'll draft a ${definition.name}. Let's gather the details.`,
      },
    ];
    const next = emptyDraftState();
    if (properties.length) {
      next.awaiting = "property";
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
    } else {
      opening.push({
        id: uid(),
        role: "assistant",
        content:
          "You don't have any properties yet. Add a property first, then start a new draft.",
      });
    }
    setMessages(opening);
    setDraftState(next);
    setView({ screen: "draft", sessionId, documentType });
  }

  function nextDraftStep(state: DraftState, documentType: AssistantDocumentType) {
    const definition = getAssistantDocument(documentType);
    if (!definition) return;
    if (definition.requiresTenancy && !state.tenancyId) {
      const property = properties.find((item) => item.id === state.propertyId);
      const linked = tenancies.filter(
        (item) =>
          item.property_id === state.propertyId ||
          (property &&
            item.property_address.trim().toLowerCase() ===
              property.address.trim().toLowerCase())
      );
      if (!linked.length) {
        append({
          role: "assistant",
          content:
            "I couldn't find a tenancy for that property. Please choose another property.",
        });
        setDraftState({ ...state, propertyId: null, awaiting: "property" });
        return;
      }
      setDraftState({ ...state, awaiting: "tenancy" });
      append({
        role: "assistant",
        content: "Which tenancy should this relate to?",
        chipKind: "tenancy",
        chips: linked.map((item) => ({
          id: item.id,
          label: `${item.tenant_names} — ends ${item.end_date}`,
        })),
      });
      return;
    }
    const field = definition.fields[state.fieldIndex];
    if (field) {
      setDraftState({ ...state, awaiting: "field" });
      append({
        role: "assistant",
        content: field.required
          ? `${field.label}?`
          : `${field.label}? (optional — send blank to skip)`,
      });
      return;
    }
    void completeDraft(state, documentType);
  }

  async function completeDraft(
    state: DraftState,
    documentType: AssistantDocumentType
  ) {
    const definition = getAssistantDocument(documentType);
    if (!definition || !state.propertyId) return;
    setLoading(true);
    setDraftState({ ...state, awaiting: null });
    append({
      role: "assistant",
      content: `Drafting your ${definition.name}…`,
    });
    try {
      const response = await fetch("/api/assistant/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType,
          propertyId: state.propertyId,
          tenancyId: state.tenancyId,
          fields: state.fields,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to draft document.");
      const entry = addAssistantHistoryEntry({
        title: data.subject || data.documentName,
        documentType,
        documentName: data.documentName,
        subject: data.subject,
        body: data.body,
      });
      setDocumentHistory(readAssistantHistory());
      append({
        role: "assistant",
        content: "Here is your draft. Review it carefully before use.",
        document: {
          id: entry.id,
          documentType,
          documentName: data.documentName,
          subject: data.subject,
          body: data.body,
        },
      });
      setDraftState(emptyDraftState());
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Unable to draft document.";
      setError(message);
      append({
        role: "assistant",
        content: `I couldn't draft that document. ${message}`,
      });
    } finally {
      setLoading(false);
    }
  }

  function chooseDraftChip(
    kind: "property" | "tenancy",
    id: string,
    label: string
  ) {
    if (view.screen !== "draft" || loading) return;
    append({ role: "user", content: label });
    const next =
      kind === "property"
        ? { ...draftState, propertyId: id, tenancyId: null, awaiting: null }
        : { ...draftState, tenancyId: id, awaiting: null };
    setDraftState(next);
    nextDraftStep(next, view.documentType);
  }

  function submitDraft() {
    if (view.screen !== "draft" || draftState.awaiting !== "field") return;
    const definition = getAssistantDocument(view.documentType);
    const field = definition?.fields[draftState.fieldIndex];
    const value = input.trim();
    if (!field || (field.required && !value)) return;
    append({ role: "user", content: value || "(skipped)" });
    setInput("");
    const next: DraftState = {
      ...draftState,
      fields: value
        ? { ...draftState.fields, [field.id]: value }
        : draftState.fields,
      fieldIndex: draftState.fieldIndex + 1,
      awaiting: null,
    };
    setDraftState(next);
    nextDraftStep(next, view.documentType);
  }

  function selectTenancy(tenancy: Tenancy) {
    const id = sessionId ?? uid();
    setSavedChatId(null);
    setCurrentKind("tenancy");
    setError(null);
    setInput("");
    setDraftState(emptyDraftState());
    const intro: AssistantChatMessage = {
      id: uid(),
      role: "assistant",
      content: `Reviewing ${tenancy.tenant_names}'s tenancy at ${tenancy.property_address}.`,
    };
    setMessages([intro]);
    setView({ screen: "tenancy", sessionId: id, tenancyId: tenancy.id });
    void ask(
      "Please provide a complete overview of this tenancy including key dates, deposit status, right to rent and upcoming actions.",
      "tenancy",
      tenancy.id,
      [intro]
    );
  }

  function selectProperty(property: Property) {
    const id = sessionId ?? uid();
    setSavedChatId(null);
    setCurrentKind("property");
    setError(null);
    setInput("");
    setDraftState(emptyDraftState());
    const intro: AssistantChatMessage = {
      id: uid(),
      role: "assistant",
      content: `Preparing a report for ${property.address}.`,
    };
    setMessages([intro]);
    setView({ screen: "property", sessionId: id, propertyId: property.id });
    void ask(
      "Please generate a detailed compliance and tenancy summary for this property.",
      "property",
      property.id,
      [intro]
    );
  }

  function restore(chat: AssistantChatRecord) {
    setMessages(chat.messages);
    setSavedChatId(chat.id);
    setCurrentKind(chat.kind);
    setError(null);
    setInput("");
    setDraftState(emptyDraftState());
    const id = uid();
    if (chat.kind === "ask") setView({ screen: "ask", sessionId: id });
    else if (chat.kind === "compliance")
      setView({ screen: "compliance", sessionId: id });
    else if (chat.kind === "tenancy" && chat.metadata.tenancyId)
      setView({
        screen: "tenancy",
        sessionId: id,
        tenancyId: chat.metadata.tenancyId,
      });
    else if (chat.kind === "property" && chat.metadata.propertyId)
      setView({
        screen: "property",
        sessionId: id,
        propertyId: chat.metadata.propertyId,
      });
    else if (chat.kind === "draft" && chat.metadata.documentType)
      setView({
        screen: "draft",
        sessionId: id,
        documentType: chat.metadata.documentType,
      });
    else setView({ screen: "draft-pick", sessionId: id });
  }

  async function saveChat() {
    if (!sessionId || !messages.length) return;
    const firstUser = messages.find(
      (message) => message.role === "user" && message.content.trim()
    );
    const metadata =
      view.screen === "draft"
        ? {
            documentType: view.documentType,
            documentName: getAssistantDocument(view.documentType)?.name,
            propertyId: draftState.propertyId ?? undefined,
            tenancyId: draftState.tenancyId ?? undefined,
          }
        : view.screen === "tenancy"
          ? { tenancyId: view.tenancyId }
          : view.screen === "property"
            ? { propertyId: view.propertyId }
            : {};
    try {
      const response = await fetch("/api/assistant/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: savedChatId ?? undefined,
          kind: currentKind,
          title: truncateChatTitle(
            firstUser?.content ||
              (currentKind === "draft" ? "Draft session" : "Saved chat")
          ),
          messages,
          metadata,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save chat.");
      setSavedChatId((data.chat as AssistantChatRecord).id);
      setToast("Saved");
      void refreshSavedChats();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to save chat."
      );
    }
  }

  async function deleteChat(id: string) {
    try {
      const response = await fetch(`/api/assistant/chats/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Unable to delete chat.");
      setSavedChats((items) => items.filter((item) => item.id !== id));
      if (savedChatId === id) goToMenu();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to delete chat."
      );
    }
  }

  function loadHistory(entry: AssistantHistoryEntry) {
    reset("draft");
    setMessages([
      {
        id: uid(),
        role: "assistant",
        content: "Here is a draft from earlier in this session.",
        document: {
          id: entry.id,
          documentType: entry.documentType,
          documentName: entry.documentName,
          subject: entry.subject,
          body: entry.body,
        },
      },
    ]);
    setView({
      screen: "draft",
      sessionId: uid(),
      documentType: entry.documentType,
    });
  }

  useEffect(() => {
    if (startedRef.current || !initialAction) return;
    startedRef.current = true;
    if (initialAction === "expiry") {
      open("ask");
      window.setTimeout(() => void ask("Which certificates expire soon?", "ask"), 0);
    } else {
      open(initialAction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction]);

  const activeChat = [
    "ask",
    "draft",
    "compliance",
    "tenancy",
    "property",
  ].includes(view.screen);
  const isPicker =
    view.screen === "draft-pick" ||
    view.screen === "tenancy-pick" ||
    view.screen === "property-pick";
  const showChrome = activeChat || isPicker || view.screen === "saved" || view.screen === "drafts";
  const mode =
    view.screen === "tenancy"
      ? "tenancy"
      : view.screen === "property"
        ? "property"
        : "ask";
  const entityId =
    view.screen === "tenancy"
      ? view.tenancyId
      : view.screen === "property"
        ? view.propertyId
        : undefined;

  const chipClass =
    "border border-olive/40 px-3 py-1.5 text-[11px] tracking-wide text-cocoa transition hover:border-study hover:text-study disabled:opacity-40";
  const navItem =
    "block w-full py-1 text-left text-[12px] tracking-[0.14em] text-dusty-cream/80 transition hover:text-dusty-cream";
  const pickRow =
    "flex w-full items-center justify-between gap-4 border-t border-olive/25 py-5 text-left transition hover:text-study";

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      <aside className="hidden h-full w-[200px] shrink-0 flex-col bg-study sm:flex">
        <div className="px-5 pt-8">
          <button type="button" onClick={goToMenu} aria-label="New chat">
            <div className="flex h-10 w-10 items-center justify-center border border-moss">
              <span className="font-serif text-xs tracking-tight text-dusty-cream">
                F<span className="mx-px text-moss">&amp;</span>Co
              </span>
            </div>
          </button>
          <div className="mt-5 h-px bg-moss/60" />
        </div>

        <nav className="mt-10 flex flex-col gap-8 px-5">
          <button type="button" onClick={goToMenu} className={navItem}>
            New Chat
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              setView({ screen: "saved" });
            }}
            className={navItem}
          >
            Saved Chats
          </button>
          <button
            type="button"
            onClick={() => open("compliance")}
            className={navItem}
          >
            Compliance Check
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              setView({ screen: "drafts" });
            }}
            className={navItem}
          >
            Drafts
          </button>
        </nav>

        <p className="mt-auto line-clamp-3 px-5 pb-6 text-[10px] leading-relaxed text-dusty-cream/30">
          {ASSISTANT_DISCLAIMER}
        </p>
      </aside>

      <section
        className={`relative flex min-h-0 min-w-0 flex-1 flex-col ${
          view.screen === "menu" ? "overflow-hidden" : "bg-parchment-line"
        }`}
      >
        {view.screen === "menu" && (
          <>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                backgroundColor: siteImages.georgeCiobra.placeholderColor,
              }}
              aria-hidden
            >
              <Image
                src={siteImages.georgeCiobra.src}
                alt=""
                fill
                priority
                quality={60}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 bg-study/40" aria-hidden />
          </>
        )}

        {toast && (
          <div className="absolute right-8 top-5 z-10 text-[11px] uppercase tracking-[0.16em] text-moss">
            {toast}
          </div>
        )}

        {view.screen === "menu" && (
          <div className="relative z-[1] flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-12">
            <div className="mx-auto flex h-[88%] max-h-[88%] w-[92%] flex-col items-center justify-center overflow-y-auto rounded-[16px] bg-parchment-line px-8 py-10 shadow-[0_24px_64px_rgba(28,43,35,0.28)] sm:px-14 sm:py-12">
              <Monogram size={50} />
              <p className="mt-8 text-[11px] italic text-moss">{greeting()}</p>
              <h1 className="mt-3 font-serif text-2xl tracking-wide text-study sm:text-[1.75rem]">
                Property Management Assistant
              </h1>
              <p className="mt-4 max-w-xl text-center text-[13px] font-light leading-relaxed text-cocoa">
                Your complete property management assistant. Ask questions,
                draft correspondence, review compliance and manage your
                portfolio.
              </p>

              <div className="mt-10 w-full max-w-2xl space-y-3">
                {MODE_BOXES.map((box) => (
                  <button
                    key={box.label}
                    type="button"
                    onClick={() => open(box.kind)}
                    className="group flex min-h-[56px] w-full cursor-text items-center gap-4 rounded-xl border border-olive/80 bg-parchment-line px-5 py-3.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:border-moss/70 focus-visible:border-moss focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-moss),0_0_0_4px_rgba(168,159,124,0.35)]"
                  >
                    <span className="shrink-0 text-[10px] font-normal uppercase tracking-[0.2em] text-study">
                      {box.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-cocoa/45 transition group-hover:text-cocoa/55">
                      {box.placeholder}
                    </span>
                    <span className="sr-only">{box.description}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => open("compliance")}
                className="mt-10 text-[12px] text-moss transition hover:text-study"
              >
                or run a Compliance Check →
              </button>
            </div>
          </div>
        )}

        {view.screen === "saved" && (
          <div className="flex-1 overflow-y-auto px-8 py-8 sm:px-16 lg:px-24">
            <button
              type="button"
              onClick={goToMenu}
              className="text-[13px] text-cocoa transition hover:text-study"
            >
              ← New Chat
            </button>
            <div className="mx-auto mt-12 max-w-xl">
              {savedChats.length === 0 ? (
                <p className="text-[13px] text-cocoa">No saved chats yet.</p>
              ) : (
                <ul>
                  {savedChats.map((chat) => (
                    <li key={chat.id} className="flex items-center gap-3 border-t border-olive/25">
                      <button
                        type="button"
                        onClick={() => restore(chat)}
                        className="min-w-0 flex-1 py-5 text-left"
                      >
                        <span className="block truncate text-[14px] text-study">
                          {truncateChatTitle(chat.title)}
                        </span>
                        <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-cocoa/70">
                          {new Date(chat.updated_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${chat.title}`}
                        onClick={() => void deleteChat(chat.id)}
                        className="text-[11px] uppercase tracking-[0.12em] text-cocoa/50 transition hover:text-study"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {view.screen === "drafts" && (
          <div className="flex-1 overflow-y-auto px-8 py-8 sm:px-16 lg:px-24">
            <button
              type="button"
              onClick={goToMenu}
              className="text-[13px] text-cocoa transition hover:text-study"
            >
              ← New Chat
            </button>
            <div className="mx-auto mt-12 max-w-xl">
              {documentHistory.length === 0 ? (
                <p className="text-[13px] text-cocoa">No drafts yet.</p>
              ) : (
                <ul>
                  {documentHistory.map((entry) => (
                    <li key={entry.id} className="border-t border-olive/25">
                      <button
                        type="button"
                        onClick={() => loadHistory(entry)}
                        className="w-full py-5 text-left"
                      >
                        <span className="block truncate text-[14px] text-study">
                          {entry.title}
                        </span>
                        <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-cocoa/70">
                          {entry.documentName}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {isPicker && (
          <div className="flex-1 overflow-y-auto px-8 py-8 sm:px-16 lg:px-24">
            <button
              type="button"
              onClick={goToMenu}
              className="text-[13px] text-cocoa transition hover:text-study"
            >
              ← New Chat
            </button>
            <div className="mx-auto mt-12 max-w-xl">
              <ul>
                {view.screen === "draft-pick" &&
                  ASSISTANT_DOCUMENTS.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => beginDraft(item.id)}
                        className={pickRow}
                      >
                        <span>
                          <span className="block text-[14px] text-study">
                            {item.name}
                          </span>
                          <span className="mt-1 block text-[12px] text-cocoa">
                            {item.description}
                          </span>
                        </span>
                        <span className="text-moss">→</span>
                      </button>
                    </li>
                  ))}
                {view.screen === "tenancy-pick" &&
                  (tenancies.length === 0 ? (
                    <p className="text-[13px] text-cocoa">No tenancies yet.</p>
                  ) : (
                    tenancies.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => selectTenancy(item)}
                          className={pickRow}
                        >
                          <span>
                            <span className="block text-[14px] text-study">
                              {item.tenant_names}
                            </span>
                            <span className="mt-1 block text-[12px] text-cocoa">
                              {item.property_address} · ends {item.end_date}
                            </span>
                          </span>
                          <span className="text-moss">→</span>
                        </button>
                      </li>
                    ))
                  ))}
                {view.screen === "property-pick" &&
                  (properties.length === 0 ? (
                    <p className="text-[13px] text-cocoa">No properties yet.</p>
                  ) : (
                    properties.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => selectProperty(item)}
                          className={pickRow}
                        >
                          <span>
                            <span className="block text-[14px] text-study">
                              {item.address}
                            </span>
                            <span className="mt-1 block text-[12px] text-cocoa">
                              {item.property_type.replace("_", " ")}
                            </span>
                          </span>
                          <span className="text-moss">→</span>
                        </button>
                      </li>
                    ))
                  ))}
              </ul>
            </div>
          </div>
        )}

        {activeChat && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8 sm:px-16 lg:px-28">
              <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={goToMenu}
                  className="text-[13px] text-cocoa transition hover:text-study"
                >
                  ← New Chat
                </button>
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => void saveChat()}
                    className="text-[11px] uppercase tracking-[0.14em] text-moss transition hover:text-study"
                  >
                    Save
                  </button>
                )}
              </div>

              <div className="mx-auto mt-10 max-w-2xl space-y-7 pb-28">
                {view.screen === "ask" && !messages.length && !loading && (
                  <div>
                    <p className="border-l-2 border-study pl-4 text-[14px] leading-relaxed text-[#1A0A0C]/90">
                      Ask anything about your properties, tenancies or
                      certificates.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2 pl-4">
                      {ASK_EXAMPLES.map((example) => (
                        <button
                          key={example}
                          type="button"
                          onClick={() => void ask(example, "ask")}
                          className={chipClass}
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) =>
                  message.role === "user" ? (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[75%] rounded-full bg-study px-3.5 py-1.5 text-[13px] leading-relaxed text-dusty-cream">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start">
                      <div className="max-w-[92%] border-l-2 border-study pl-4">
                        <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#1A0A0C]">
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
                                  chooseDraftChip(
                                    message.chipKind!,
                                    chip.id,
                                    chip.label
                                  )
                                }
                                className={chipClass}
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
                    </div>
                  )
                )}

                {loading && <TypingDots />}
                {error && <p className="text-[13px] text-urgent">{error}</p>}
                <div ref={bottomRef} />
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-parchment-line">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (view.screen === "draft") submitDraft();
                  else void ask(input, mode, entityId);
                }}
                className="flex w-full items-center gap-3 border-t border-olive px-8 py-4 sm:px-16 lg:px-28"
              >
                <label htmlFor="assistant-mode-input" className="sr-only">
                  Message
                </label>
                <input
                  id="assistant-mode-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={loading}
                  placeholder="Type your message..."
                  className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-[#1A0A0C] outline-none placeholder:text-cocoa/50"
                />
                <button
                  type="submit"
                  disabled={
                    loading ||
                    (view.screen === "draft"
                      ? draftState.awaiting !== "field"
                      : !input.trim())
                  }
                  aria-label="Send"
                  className="text-moss transition hover:text-study disabled:opacity-30"
                >
                  →
                </button>
              </form>
            </div>
          </>
        )}

        {/* Mobile nav — compact strip when sidebar is hidden */}
        {!showChrome && (
          <div className="relative z-[1] flex items-center justify-center gap-5 bg-parchment-line/90 px-4 py-3 sm:hidden">
            <button
              type="button"
              onClick={() => {
                reset();
                setView({ screen: "saved" });
              }}
              className="text-[10px] tracking-[0.12em] text-cocoa"
            >
              Saved
            </button>
            <button
              type="button"
              onClick={() => open("compliance")}
              className="text-[10px] tracking-[0.12em] text-cocoa"
            >
              Compliance
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                setView({ screen: "drafts" });
              }}
              className="text-[10px] tracking-[0.12em] text-cocoa"
            >
              Drafts
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
