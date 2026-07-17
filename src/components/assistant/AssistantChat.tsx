"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ConfirmDialog from "@/components/ConfirmDialog";
import UpgradeOverlay from "@/components/subscription/UpgradeOverlay";
import {
  ASSISTANT_DISCLAIMER,
  ASSISTANT_DOCUMENTS,
  getAssistantDocument,
  parseAssistantReply,
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
import { IMAGE_QUALITY, siteImages } from "@/lib/site-images";
import type { Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

interface AssistantChatProps {
  properties: Property[];
  tenancies: Tenancy[];
  initialDailyUsage?: number | null;
  initialAction?:
    | "draft"
    | "compliance"
    | "expiry"
    | "ask"
    | "tenancy"
    | "property"
    | null;
}

interface UpgradePromptState {
  title: string;
  message: string;
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

type ComposerMode = "ask" | "draft" | "tenancy" | "property";

const COMPOSER_MODES: Record<
  ComposerMode,
  {
    label: string;
    title: string;
    placeholder: string;
    chips: string[];
  }
> = {
  ask: {
    label: "ASK",
    title: "Ask your portfolio",
    placeholder:
      "Ask anything about your properties, tenancies or compliance...",
    chips: [
      "Which certificates expire this month?",
      "Any urgent actions?",
      "Are all deposits protected?",
    ],
  },
  draft: {
    label: "DRAFT",
    title: "Draft a document",
    placeholder:
      "Describe the document you need — e.g. 'Rent increase letter for 42 Brook Street'",
    chips: [
      "Rent increase notice",
      "End of tenancy letter",
      "Maintenance access letter",
    ],
  },
  tenancy: {
    label: "TENANCY",
    title: "Review a tenancy",
    placeholder: "Which tenancy would you like to review?",
    chips: [],
  },
  property: {
    label: "REPORT",
    title: "Full property report",
    placeholder: "Which property would you like a full report on?",
    chips: [],
  },
};

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

function matchDraftDocument(text: string): AssistantDocumentType | null {
  const q = text.trim().toLowerCase();
  if (!q) return null;
  if (
    q === "rent increase notice" ||
    q.includes("rent increase") ||
    q.includes("section 13")
  ) {
    return "rent_increase";
  }
  if (q === "end of tenancy letter" || q.includes("end of tenancy")) {
    return "end_of_tenancy";
  }
  if (
    q === "maintenance access letter" ||
    q.includes("maintenance access") ||
    q.includes("access letter")
  ) {
    return "maintenance_access";
  }
  return null;
}

function matchTenancy(text: string, items: Tenancy[]): Tenancy | null {
  const q = text.trim().toLowerCase();
  if (!q) return null;
  const exact = items.find(
    (item) =>
      item.tenant_names.toLowerCase() === q ||
      item.property_address.toLowerCase() === q ||
      `${item.tenant_names} — ${item.property_address}`.toLowerCase() === q
  );
  if (exact) return exact;
  const matches = items.filter(
    (item) =>
      item.tenant_names.toLowerCase().includes(q) ||
      item.property_address.toLowerCase().includes(q) ||
      q.includes(item.tenant_names.toLowerCase()) ||
      q.includes(item.property_address.toLowerCase())
  );
  return matches.length === 1 ? matches[0] : null;
}

function matchProperty(text: string, items: Property[]): Property | null {
  const q = text.trim().toLowerCase();
  if (!q) return null;
  const exact = items.find((item) => item.address.toLowerCase() === q);
  if (exact) return exact;
  const matches = items.filter(
    (item) =>
      item.address.toLowerCase().includes(q) ||
      q.includes(item.address.toLowerCase())
  );
  return matches.length === 1 ? matches[0] : null;
}

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
      className="flex shrink-0 items-center justify-center border border-study"
      style={{ width: size, height: size }}
    >
      <span className={`font-display tracking-tight text-study ${textSize}`}>
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
      <p className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap text-[14px] leading-[1.75] text-text">
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
  initialDailyUsage = 0,
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
  const [composerMode, setComposerMode] = useState<ComposerMode | null>(null);
  const [composerInput, setComposerInput] = useState("");
  const [welcomeInput, setWelcomeInput] = useState("");
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [upgradePrompt, setUpgradePrompt] =
    useState<UpgradePromptState | null>(null);
  const [dailyUsage, setDailyUsage] = useState<number | null>(
    initialDailyUsage
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const followUpRef = useRef<HTMLTextAreaElement>(null);
  const composerTextareaRef = useRef<HTMLTextAreaElement>(null);
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
    if (!loading && messages.length > 0) {
      followUpRef.current?.focus();
    }
  }, [messages, loading, view.screen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!composerMode) return;
    const timer = window.setTimeout(() => {
      composerTextareaRef.current?.focus();
    }, 40);
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeComposer();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composerMode]);

  useEffect(() => {
    if (!composerMode) {
      setKeyboardInset(0);
      return;
    }
    const vv = window.visualViewport;
    if (!vv) return;
    function syncKeyboardInset() {
      const inset = Math.max(
        0,
        window.innerHeight - vv!.height - vv!.offsetTop
      );
      setKeyboardInset(inset);
    }
    syncKeyboardInset();
    vv.addEventListener("resize", syncKeyboardInset);
    vv.addEventListener("scroll", syncKeyboardInset);
    return () => {
      vv.removeEventListener("resize", syncKeyboardInset);
      vv.removeEventListener("scroll", syncKeyboardInset);
    };
  }, [composerMode]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileNavOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

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
    setComposerMode(null);
    setComposerInput("");
    setWelcomeInput("");
    setView({ screen: "menu" });
  }

  function submitWelcome() {
    const trimmed = welcomeInput.trim();
    if (!trimmed || loading) return;
    setWelcomeInput("");
    const id = uid();
    reset("ask");
    setView({ screen: "ask", sessionId: id });
    void ask(trimmed, "ask", undefined, []);
  }

  function openComposer(mode: ComposerMode) {
    setComposerMode(mode);
    setComposerInput("");
  }

  function closeComposer() {
    setComposerMode(null);
    setComposerInput("");
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

  function submitComposer() {
    const trimmed = composerInput.trim();
    if (!composerMode || !trimmed || loading) return;
    const mode = composerMode;
    closeComposer();

    if (mode === "ask") {
      const id = uid();
      reset("ask");
      setView({ screen: "ask", sessionId: id });
      void ask(trimmed, "ask", undefined, []);
      return;
    }

    if (mode === "draft") {
      const documentType = matchDraftDocument(trimmed);
      const id = uid();
      if (documentType) {
        reset("draft");
        beginDraft(documentType, id);
        return;
      }
      reset("ask");
      setView({ screen: "ask", sessionId: id });
      void ask(
        `Please help me draft the following: ${trimmed}`,
        "ask",
        undefined,
        []
      );
      return;
    }

    if (mode === "tenancy") {
      const matched = matchTenancy(trimmed, tenancies);
      if (matched) {
        selectTenancy(matched);
        return;
      }
      const id = uid();
      reset("ask");
      setView({ screen: "ask", sessionId: id });
      void ask(
        `I'd like to review this tenancy: ${trimmed}. Please help identify it and provide a full overview.`,
        "ask",
        undefined,
        []
      );
      return;
    }

    const matched = matchProperty(trimmed, properties);
    if (matched) {
      selectProperty(matched);
      return;
    }
    const id = uid();
    reset("ask");
    setView({ screen: "ask", sessionId: id });
    void ask(
      `I'd like a full compliance and tenancy report for: ${trimmed}. Please help identify the property and produce the report.`,
      "ask",
      undefined,
      []
    );
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
      if (!response.ok && data.code === "UPGRADE_REQUIRED") {
        setDailyUsage(6);
        setUpgradePrompt({
          title: data.title || "You've reached your daily limit",
          message:
            data.message ||
            "Upgrade to Professional for unlimited AI assistant access.",
        });
        return;
      }
      if (!response.ok) throw new Error(data.error || "Unable to get a response.");
      if (typeof data.usage?.used === "number") {
        setDailyUsage(data.usage.used);
      }
      const parsed = parseAssistantReply((data.reply as string) ?? "");
      setMessages((current) => [
        ...current,
        {
          id: uid(),
          role: "assistant",
          content: parsed.content,
          suggestions: parsed.suggestions,
        },
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
      if (!response.ok && data.code === "UPGRADE_REQUIRED") {
        setDailyUsage(6);
        setUpgradePrompt({
          title: data.title || "You've reached your daily limit",
          message:
            data.message ||
            "Upgrade to Professional for unlimited AI assistant access.",
        });
        return;
      }
      if (!response.ok)
        throw new Error(data.error || "Unable to run compliance check.");
      if (typeof data.usage?.used === "number") {
        setDailyUsage(data.usage.used);
      }
      const parsed = parseAssistantReply((data.summary as string).trim());
      append({
        role: "assistant",
        content: parsed.content,
        suggestions:
          parsed.suggestions.length > 0
            ? parsed.suggestions
            : [
                "View overdue items",
                "Draft contractor emails for all overdue",
                "Generate compliance report",
              ],
      });
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

  function beginDraft(
    documentType: AssistantDocumentType,
    sessionOverride?: string
  ) {
    const activeSession = sessionOverride ?? sessionId;
    if (!activeSession) return;
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
    setCurrentKind("draft");
    setView({ screen: "draft", sessionId: activeSession, documentType });
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
      if (!response.ok && data.code === "UPGRADE_REQUIRED") {
        setDailyUsage(6);
        setUpgradePrompt({
          title: data.title || "You've reached your daily limit",
          message:
            data.message ||
            "Upgrade to Professional for unlimited AI assistant access.",
        });
        return;
      }
      if (!response.ok) throw new Error(data.error || "Unable to draft document.");
      if (typeof data.usage?.used === "number") {
        setDailyUsage(data.usage.used);
      }
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
        suggestions: [
          "Send via Gmail",
          "Draft another letter",
          "Save this draft",
        ],
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

  function submitFollowUp(text: string) {
    const trimmed = text.trim();
    if (loading) return;

    if (view.screen === "draft" && draftState.awaiting === "field") {
      const definition = getAssistantDocument(view.documentType);
      const field = definition?.fields[draftState.fieldIndex];
      if (!field || (field.required && !trimmed)) return;
      append({ role: "user", content: trimmed || "(skipped)" });
      setInput("");
      const next: DraftState = {
        ...draftState,
        fields: trimmed
          ? { ...draftState.fields, [field.id]: trimmed }
          : draftState.fields,
        fieldIndex: draftState.fieldIndex + 1,
        awaiting: null,
      };
      setDraftState(next);
      nextDraftStep(next, view.documentType);
      return;
    }

    if (!trimmed) return;

    if (
      view.screen === "draft" &&
      draftState.awaiting !== null &&
      draftState.awaiting !== "field"
    ) {
      return;
    }

    const followUpMode =
      view.screen === "tenancy"
        ? "tenancy"
        : view.screen === "property"
          ? "property"
          : "ask";
    const followUpEntity =
      view.screen === "tenancy"
        ? view.tenancyId
        : view.screen === "property"
          ? view.propertyId
          : undefined;
    void ask(trimmed, followUpMode, followUpEntity);
  }

  function submitSuggestion(suggestion: string) {
    if (loading) return;
    setInput(suggestion);
    submitFollowUp(suggestion);
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
      openComposer("ask");
      setComposerInput("Which certificates expire soon?");
    } else if (
      initialAction === "ask" ||
      initialAction === "draft" ||
      initialAction === "tenancy" ||
      initialAction === "property"
    ) {
      openComposer(initialAction);
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
  const isDocumentDrafter =
    view.screen === "draft" || view.screen === "draft-pick";
  const showChrome = activeChat || isPicker || view.screen === "saved" || view.screen === "drafts";
  const exitChatLabel = isDocumentDrafter ? "← Start Over" : "← New Chat";
  const exitChatClassName =
    "text-sm font-light text-gold-readable transition hover:text-gold";
  const chipClass =
    "border border-olive/40 px-3 py-1.5 text-[11px] tracking-wide text-cocoa transition hover:border-study hover:text-study disabled:opacity-40";
  const navItem =
    "flex min-h-11 w-full items-center py-3 text-left text-[11px] font-normal uppercase tracking-[0.14em] text-dusty-cream/80 transition hover:text-dusty-cream";
  const pickRow =
    "flex w-full items-center justify-between gap-4 border-t border-olive/25 py-5 text-left transition hover:text-study";

  function renderAssistantNav(onNavigate?: () => void) {
    return (
      <>
        <div className="px-5 pt-8">
          <button
            type="button"
            onClick={() => {
              goToMenu();
              onNavigate?.();
            }}
            aria-label="New chat"
          >
            <div className="flex h-10 w-10 items-center justify-center border border-moss">
              <span className="font-serif text-xs tracking-tight text-dusty-cream">
                F<span className="mx-px text-moss">&amp;</span>Co
              </span>
            </div>
          </button>
          <div className="mt-5 h-px bg-moss/60" />
        </div>

        <nav className="mt-8 flex flex-col gap-1 px-5 sm:mt-10">
          <button
            type="button"
            onClick={() => {
              goToMenu();
              onNavigate?.();
            }}
            className={navItem}
          >
            New Chat
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              setView({ screen: "saved" });
              onNavigate?.();
            }}
            className={navItem}
          >
            Saved Chats
          </button>
          <button
            type="button"
            onClick={() => {
              open("compliance");
              onNavigate?.();
            }}
            className={navItem}
          >
            Compliance Check
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              setView({ screen: "drafts" });
              onNavigate?.();
            }}
            className={navItem}
          >
            Drafts
          </button>
        </nav>

        <p className="mt-auto line-clamp-4 px-5 pb-6 text-[10px] leading-relaxed text-dusty-cream/30">
          {ASSISTANT_DISCLAIMER}
        </p>
      </>
    );
  }

  const composerConfig = composerMode ? COMPOSER_MODES[composerMode] : null;
  const composerChips =
    composerMode === "tenancy"
      ? tenancies.slice(0, 4).map((item) => item.tenant_names)
      : composerMode === "property"
        ? properties.slice(0, 4).map((item) => item.address)
        : (composerConfig?.chips ?? []);

  const isMenu = view.screen === "menu";

  return (
    <div
      className="relative flex w-full overflow-hidden bg-study"
      style={{
        height: "calc(100dvh - var(--app-top-offset, 4rem))",
        marginTop: "var(--app-top-offset, 4rem)",
      }}
    >
      {upgradePrompt ? (
        <UpgradeOverlay
          title={upgradePrompt.title}
          message={upgradePrompt.message}
          onDismiss={() => setUpgradePrompt(null)}
        />
      ) : null}
      <ConfirmDialog
        open={deleteChatId != null}
        title="Delete chat?"
        message="This saved chat will be permanently removed."
        confirmLabel="Confirm Delete"
        onConfirm={() => {
          if (deleteChatId) {
            void deleteChat(deleteChatId).finally(() => setDeleteChatId(null));
          }
        }}
        onCancel={() => setDeleteChatId(null)}
      />

      {/* Desktop left panel */}
      <aside className="hidden h-full w-[180px] max-w-[180px] shrink-0 flex-col bg-study transition-colors duration-[400ms] ease-[ease] md:flex">
        {renderAssistantNav()}
      </aside>

      {/* Mobile left panel drawer */}
      <button
        type="button"
        aria-label="Close assistant menu"
        className={`fixed inset-0 z-40 bg-[#0c1612]/55 transition-opacity duration-300 ease-out md:hidden ${
          mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileNavOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw,180px)] flex-col bg-study transition-[background-color,transform] duration-[400ms] ease-[ease] md:hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!mobileNavOpen}
      >
        {renderAssistantNav(() => setMobileNavOpen(false))}
      </aside>

      <section
        className={`relative flex min-h-0 min-w-0 flex-1 flex-col ${
          isMenu ? "overflow-hidden bg-study" : "bg-parchment-line"
        }`}
      >
        {isMenu ? (
          <>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                backgroundColor: siteImages.assistantStudy.placeholderColor,
              }}
              aria-hidden
            >
              <Image
                src={siteImages.assistantStudy.src}
                alt=""
                fill
                priority
                quality={IMAGE_QUALITY}
                sizes="(max-width: 768px) 100vw, calc(100vw - 180px)"
                {...(siteImages.assistantStudy.blurDataURL?.startsWith(
                  "data:image/"
                )
                  ? {
                      placeholder: "blur" as const,
                      blurDataURL: siteImages.assistantStudy.blurDataURL,
                    }
                  : { placeholder: "empty" as const })}
                className="object-cover"
                style={{ objectPosition: "center 40%" }}
              />
            </div>
            <div
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(28, 43, 35, 0.3)" }}
              aria-hidden
            />
          </>
        ) : null}

        {/* Mobile: open left panel */}
        <button
          type="button"
          aria-label="Open assistant menu"
          onClick={() => setMobileNavOpen(true)}
          className={`absolute left-3 top-3 z-20 flex h-11 w-11 items-center justify-center transition md:hidden ${
            isMenu
              ? "border border-dusty-cream/40 text-dusty-cream"
              : "border border-moss/50 bg-study/80 text-dusty-cream backdrop-blur-sm hover:bg-study"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>

        {toast && (
          <div
            className={`absolute right-8 top-5 z-10 text-[11px] uppercase tracking-[0.16em] ${
              isMenu ? "text-dusty-cream/80" : "text-moss"
            }`}
          >
            {toast}
          </div>
        )}

        {composerMode && composerConfig && (
          <div
            className="absolute inset-0 z-40 flex items-end justify-center p-3 sm:items-center sm:p-6"
            style={{
              paddingBottom:
                keyboardInset > 0
                  ? Math.max(12, keyboardInset + 8)
                  : undefined,
            }}
          >
            <button
              type="button"
              aria-label="Close composer"
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={closeComposer}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={composerConfig.title}
              className="assistant-composer-modal relative z-[1] max-h-[min(90dvh,640px)] w-[95%] max-w-[640px] overflow-y-auto rounded-[20px] bg-dune p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:p-10"
            >
              <button
                type="button"
                aria-label="Close"
                onClick={closeComposer}
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-xl font-light leading-none text-gold-readable transition hover:text-gold sm:right-5 sm:top-5"
              >
                ×
              </button>
              <p className="pr-10 text-[10px] font-normal uppercase tracking-[0.22em] text-study">
                {composerConfig.title}
              </p>
              <div className="mt-3 h-px w-full bg-moss/70" aria-hidden />

              <label htmlFor="assistant-composer-input" className="sr-only">
                {composerConfig.title}
              </label>
              <textarea
                id="assistant-composer-input"
                ref={composerTextareaRef}
                value={composerInput}
                onChange={(event) => setComposerInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submitComposer();
                  }
                }}
                placeholder={composerConfig.placeholder}
                rows={6}
                className="mt-6 h-[min(180px,28vh)] w-full resize-none border-0 bg-transparent font-serif text-base leading-relaxed text-study placeholder:text-taupe focus:outline-none focus:ring-0 sm:text-[1.35rem]"
              />

              {composerChips.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {composerChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setComposerInput(chip)}
                      className="min-h-11 rounded-full border border-taupe bg-vanilla px-3 py-1.5 text-[11px] tracking-wide text-cocoa/80 transition hover:border-moss hover:text-study"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-5">
                <button
                  type="button"
                  onClick={closeComposer}
                  className="flex min-h-12 items-center justify-center text-sm font-light text-gold-readable transition hover:text-gold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitComposer}
                  disabled={!composerInput.trim() || loading}
                  className="flex min-h-12 w-full items-center justify-center bg-study px-6 text-[11px] font-normal uppercase tracking-[0.16em] text-dusty-cream transition hover:bg-olive disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  Send →
                </button>
              </div>
            </div>
          </div>
        )}

        {isMenu && (
          <div className="relative z-[1] flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
            <div
              className="mx-auto my-auto flex max-w-none flex-col rounded-[20px] bg-dune px-6 py-8 shadow-[0_8px_40px_rgba(0,0,0,0.25)] sm:px-10 sm:py-10"
              style={{ width: "95%", minHeight: "75vh" }}
            >
              <div className="flex justify-center">
                <Monogram size={40} />
              </div>
              <p className="mt-5 text-center text-[11px] italic text-moss">
                {greeting()}
              </p>
              <h1 className="mt-2 text-center font-serif text-xl tracking-wide text-heading sm:text-[1.5rem]">
                How can I help you today?
              </h1>
              {dailyUsage !== null ? (
                <p className="mt-3 text-center text-[10px] font-normal uppercase tracking-[0.18em] text-cocoa/75">
                  {Math.max(0, 6 - dailyUsage)} of 6 AI requests remaining today
                </p>
              ) : null}
              <div
                className="mx-auto mt-5 h-px w-16 bg-taupe"
                aria-hidden
              />

              <div className="mt-8 w-full space-y-3">
                {MODE_BOXES.map((box) => (
                  <button
                    key={box.label}
                    type="button"
                    onClick={() => openComposer(box.kind)}
                    className="group flex min-h-[64px] w-full items-center gap-3 rounded-full border border-taupe bg-vanilla px-5 py-4 text-left transition hover:border-study/50 hover:bg-dune focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss/40 sm:gap-4 sm:px-7 sm:py-5"
                  >
                    <span className="shrink-0 text-[10px] font-normal uppercase tracking-[0.2em] text-study">
                      {box.label}
                    </span>
                    <span className="min-w-0 flex-1 text-[12px] leading-snug text-cocoa sm:text-[13px]">
                      {box.description}
                    </span>
                    <span
                      className="shrink-0 text-sm font-light text-study/50 transition group-hover:text-study"
                      aria-hidden
                    >
                      →
                    </span>
                  </button>
                ))}
              </div>

              <form
                className="mt-auto w-full pt-8"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitWelcome();
                }}
              >
                <label htmlFor="assistant-welcome-input" className="sr-only">
                  Type your question or request
                </label>
                <div className="relative w-full">
                  <input
                    id="assistant-welcome-input"
                    type="text"
                    value={welcomeInput}
                    onChange={(event) => setWelcomeInput(event.target.value)}
                    placeholder="Type your question or request..."
                    className="h-12 w-full rounded-[10px] border border-taupe bg-vanilla py-3 pl-4 pr-12 text-[14px] text-study outline-none placeholder:text-taupe focus:border-moss"
                  />
                  <button
                    type="submit"
                    disabled={!welcomeInput.trim() || loading}
                    aria-label="Send"
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-study transition hover:text-olive disabled:opacity-30"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-5 w-5"
                      aria-hidden
                    >
                      <path
                        d="M5 12h12M13 6l6 6-6 6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view.screen === "saved" && (
          <div className="flex-1 overflow-y-auto px-4 pb-8 pt-14 sm:px-16 sm:pt-8 lg:px-24">
            <button
              type="button"
              onClick={goToMenu}
              className={exitChatClassName}
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
                        onClick={() => setDeleteChatId(chat.id)}
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
          <div className="flex-1 overflow-y-auto px-4 pb-8 pt-14 sm:px-16 sm:pt-8 lg:px-24">
            <button
              type="button"
              onClick={goToMenu}
              className={exitChatClassName}
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
          <div className="flex-1 overflow-y-auto px-4 pb-8 pt-14 sm:px-16 sm:pt-8 lg:px-24">
            <button
              type="button"
              onClick={goToMenu}
              className={exitChatClassName}
            >
              {view.screen === "draft-pick" ? "← Start Over" : "← New Chat"}
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
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-14 sm:px-16 sm:pt-8 lg:px-28">
              <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={goToMenu}
                  className={exitChatClassName}
                >
                  {exitChatLabel}
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

              <div className="mx-auto mt-10 max-w-2xl space-y-7 pb-36">
                {view.screen === "ask" && !messages.length && !loading && (
                  <div>
                    <p className="border-l-2 border-study pl-4 text-[14px] leading-relaxed text-text/90">
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
                        <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-text">
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
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                disabled={loading}
                                onClick={() => submitSuggestion(suggestion)}
                                className="rounded-[8px] border border-taupe bg-vanilla px-3 py-1.5 text-[12px] text-study transition hover:border-study disabled:opacity-40"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
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

            <div className="absolute inset-x-0 bottom-0 bg-parchment-line pb-[env(safe-area-inset-bottom)]">
              <div className="h-px w-full bg-moss" aria-hidden />
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitFollowUp(input);
                }}
                className="px-4 py-3 sm:px-16 sm:py-4 lg:px-28"
              >
                <div className="relative mx-auto w-full max-w-2xl">
                  <label htmlFor="assistant-mode-input" className="sr-only">
                    Follow-up question
                  </label>
                  <textarea
                    id="assistant-mode-input"
                    ref={followUpRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        submitFollowUp(input);
                      }
                    }}
                    disabled={loading}
                    rows={3}
                    placeholder="Ask a follow-up question..."
                    className="min-h-[80px] w-full resize-none rounded-[12px] border border-taupe bg-vanilla px-4 py-3.5 pr-14 text-base leading-relaxed text-study placeholder:text-moss focus:outline-none focus:ring-1 focus:ring-olive/60 disabled:opacity-60 [font-size:16px]"
                  />
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      (view.screen === "draft"
                        ? draftState.awaiting === "property" ||
                          draftState.awaiting === "tenancy" ||
                          (draftState.awaiting === null && !input.trim())
                        : !input.trim())
                    }
                    aria-label="Send"
                    className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-md bg-study text-parchment-line transition hover:bg-olive disabled:opacity-30"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="h-3.5 w-3.5"
                      aria-hidden
                    >
                      <path
                        d="M3 8h9M8 3.5 12.5 8 8 12.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
