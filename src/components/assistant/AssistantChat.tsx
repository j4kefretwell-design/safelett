"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { ASSISTANT_DISCLAIMER, ASSISTANT_DOCUMENTS, getAssistantDocument, type AssistantDocumentType } from "@/lib/assistant";
import { addAssistantHistoryEntry, readAssistantHistory, type AssistantHistoryEntry } from "@/lib/assistant-history";
import {
  sessionKindLabel,
  truncateChatTitle,
  type AssistantChatKind,
  type AssistantChatMessage,
  type AssistantChatRecord,
} from "@/lib/assistant-chats";
import { buildGmailComposeUrl, buildMailtoUrl, formatNoticeForCopy } from "@/lib/tenancy-notices";
import type { Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

interface AssistantChatProps {
  properties: Property[];
  tenancies: Tenancy[];
  initialAction?: "draft" | "compliance" | "expiry" | "ask" | "tenancy" | "property" | null;
}

type View =
  | { screen: "menu" } | { screen: "ask"; sessionId: string }
  | { screen: "draft-pick"; sessionId: string }
  | { screen: "draft"; sessionId: string; documentType: AssistantDocumentType }
  | { screen: "compliance"; sessionId: string }
  | { screen: "tenancy-pick"; sessionId: string }
  | { screen: "tenancy"; sessionId: string; tenancyId: string }
  | { screen: "property-pick"; sessionId: string }
  | { screen: "property"; sessionId: string; propertyId: string };
type DraftState = { propertyId: string | null; tenancyId: string | null; fields: Record<string, string>; awaiting: "property" | "tenancy" | "field" | null; fieldIndex: number };
const emptyDraftState = (): DraftState => ({ propertyId: null, tenancyId: null, fields: {}, awaiting: null, fieldIndex: 0 });
const ASK_EXAMPLES = ["Which certificates expire this month?", "Are any deposits unprotected?", "Which tenancies are up for renewal?", "Which properties are fully compliant?"] as const;
const uid = () => crypto.randomUUID();
function greeting() { const hour = new Date().getHours(); return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"; }

function TypingDots() {
  return <div className="flex items-center gap-1.5 border-l-2 border-ink-green py-2 pl-4">{[0, 1, 2].map((dot) => <span key={dot} className="assistant-typing-dot h-1.5 w-1.5 bg-ink-green" style={{ animationDelay: `${dot * 160}ms` }} />)}</div>;
}

function Monogram() {
  return <div className="flex h-16 w-16 items-center justify-center border border-moss"><span className="font-serif text-lg tracking-tight text-ink-green">F<span className="mx-px text-moss">&amp;</span>Co</span></div>;
}

function DocumentCard({ document }: { document: NonNullable<AssistantChatMessage["document"]> }) {
  const [copied, setCopied] = useState(false);
  const draft = { subject: document.subject, body: document.body };
  async function copy() { try { await navigator.clipboard.writeText(formatNoticeForCopy(draft)); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); } }
  const button = "border border-ink-green px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-green transition hover:bg-[rgba(28,43,35,0.04)]";
  return <div className="mt-4 max-w-2xl bg-[#F7F4EC] p-6">
    <p className="font-serif text-xl text-[#1A0A0C]">{document.documentName}</p>
    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-moss">{document.subject}</p>
    <div className="mt-4 h-px bg-moss/60" />
    <p className="mt-5 max-h-80 overflow-y-auto whitespace-pre-wrap font-serif text-[15px] leading-[1.75] text-[#1A0A0C]">{document.body}</p>
    <div className="mt-5 flex flex-wrap items-center gap-2"><button type="button" onClick={copy} className={button}>{copied ? "Copied" : "Copy"}</button><span className="text-moss">·</span><a href={buildMailtoUrl(draft)} className={button}>Open in Mail</a><span className="text-moss">·</span><a href={buildGmailComposeUrl(draft)} target="_blank" rel="noreferrer" className={button}>Open in Gmail</a></div>
  </div>;
}

export default function AssistantChat({ properties, tenancies, initialAction = null }: AssistantChatProps) {
  const [view, setView] = useState<View>({ screen: "menu" });
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftState, setDraftState] = useState<DraftState>(emptyDraftState());
  const [savedChats, setSavedChats] = useState<AssistantChatRecord[]>([]);
  const [documentHistory, setDocumentHistory] = useState<AssistantHistoryEntry[]>([]);
  const [savedChatId, setSavedChatId] = useState<string | null>(null);
  const [currentKind, setCurrentKind] = useState<AssistantChatKind>("ask");
  const [toast, setToast] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const sessionId = view.screen === "menu" ? null : view.sessionId;

  const refreshSavedChats = useCallback(async () => {
    try { const response = await fetch("/api/assistant/chats"); const data = await response.json(); if (response.ok) setSavedChats(data.chats as AssistantChatRecord[]); } catch { /* saved chat list remains available on next visit */ }
  }, []);
  useEffect(() => { void refreshSavedChats(); setDocumentHistory(readAssistantHistory()); }, [refreshSavedChats]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, view.screen]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 2500); return () => window.clearTimeout(timer); }, [toast]);

  function reset(kind: AssistantChatKind = "ask") { setMessages([]); setInput(""); setError(null); setLoading(false); setDraftState(emptyDraftState()); setSavedChatId(null); setCurrentKind(kind); }
  function goToMenu() { reset(); setView({ screen: "menu" }); }
  function open(kind: AssistantChatKind) { const id = uid(); reset(kind); if (kind === "ask") setView({ screen: "ask", sessionId: id }); else if (kind === "draft") setView({ screen: "draft-pick", sessionId: id }); else if (kind === "tenancy") setView({ screen: "tenancy-pick", sessionId: id }); else if (kind === "property") setView({ screen: "property-pick", sessionId: id }); else { setView({ screen: "compliance", sessionId: id }); void runCompliance(); } return id; }
  function append(message: Omit<AssistantChatMessage, "id">) { const next = { ...message, id: uid() }; setMessages((previous) => [...previous, next]); return next; }
  function historyPayload(items: AssistantChatMessage[]) { return items.filter((item) => item.content.trim() && !item.document).slice(-12).map(({ role, content }) => ({ role, content })); }

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
    setLoading(true); setError(null);
    try { const response = await fetch("/api/assistant/compliance", { method: "POST" }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to run compliance check."); append({ role: "assistant", content: data.summary as string }); }
    catch (caught) { const message = caught instanceof Error ? caught.message : "Unable to run compliance check."; setError(message); append({ role: "assistant", content: `I couldn't complete the compliance check. ${message}` }); } finally { setLoading(false); }
  }

  function beginDraft(documentType: AssistantDocumentType) {
    if (!sessionId) return; const definition = getAssistantDocument(documentType); if (!definition) return;
    const opening: AssistantChatMessage[] = [{ id: uid(), role: "assistant", content: `We'll draft a ${definition.name}. Let's gather the details.` }];
    const next = emptyDraftState();
    if (properties.length) { next.awaiting = "property"; opening.push({ id: uid(), role: "assistant", content: "Which property is this for?", chipKind: "property", chips: properties.map((property) => ({ id: property.id, label: property.address })) }); }
    else opening.push({ id: uid(), role: "assistant", content: "You don't have any properties yet. Add a property first, then start a new draft." });
    setMessages(opening); setDraftState(next); setView({ screen: "draft", sessionId, documentType });
  }

  function nextDraftStep(state: DraftState, documentType: AssistantDocumentType) {
    const definition = getAssistantDocument(documentType); if (!definition) return;
    if (definition.requiresTenancy && !state.tenancyId) {
      const property = properties.find((item) => item.id === state.propertyId);
      const linked = tenancies.filter((item) => item.property_id === state.propertyId || (property && item.property_address.trim().toLowerCase() === property.address.trim().toLowerCase()));
      if (!linked.length) { append({ role: "assistant", content: "I couldn't find a tenancy for that property. Please choose another property." }); setDraftState({ ...state, propertyId: null, awaiting: "property" }); return; }
      setDraftState({ ...state, awaiting: "tenancy" }); append({ role: "assistant", content: "Which tenancy should this relate to?", chipKind: "tenancy", chips: linked.map((item) => ({ id: item.id, label: `${item.tenant_names} — ends ${item.end_date}` })) }); return;
    }
    const field = definition.fields[state.fieldIndex];
    if (field) { setDraftState({ ...state, awaiting: "field" }); append({ role: "assistant", content: field.required ? `${field.label}?` : `${field.label}? (optional — send blank to skip)` }); return; }
    void completeDraft(state, documentType);
  }
  async function completeDraft(state: DraftState, documentType: AssistantDocumentType) {
    const definition = getAssistantDocument(documentType); if (!definition || !state.propertyId) return;
    setLoading(true); setDraftState({ ...state, awaiting: null }); append({ role: "assistant", content: `Drafting your ${definition.name}…` });
    try {
      const response = await fetch("/api/assistant/draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentType, propertyId: state.propertyId, tenancyId: state.tenancyId, fields: state.fields }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to draft document.");
      const entry = addAssistantHistoryEntry({ title: data.subject || data.documentName, documentType, documentName: data.documentName, subject: data.subject, body: data.body });
      setDocumentHistory(readAssistantHistory()); append({ role: "assistant", content: "Here is your draft. Review it carefully before use.", document: { id: entry.id, documentType, documentName: data.documentName, subject: data.subject, body: data.body } }); setDraftState(emptyDraftState());
    } catch (caught) { const message = caught instanceof Error ? caught.message : "Unable to draft document."; setError(message); append({ role: "assistant", content: `I couldn't draft that document. ${message}` }); } finally { setLoading(false); }
  }
  function chooseDraftChip(kind: "property" | "tenancy", id: string, label: string) {
    if (view.screen !== "draft" || loading) return; append({ role: "user", content: label });
    const next = kind === "property" ? { ...draftState, propertyId: id, tenancyId: null, awaiting: null } : { ...draftState, tenancyId: id, awaiting: null };
    setDraftState(next); nextDraftStep(next, view.documentType);
  }
  function submitDraft() {
    if (view.screen !== "draft" || draftState.awaiting !== "field") return;
    const definition = getAssistantDocument(view.documentType); const field = definition?.fields[draftState.fieldIndex]; const value = input.trim();
    if (!field || (field.required && !value)) return; append({ role: "user", content: value || "(skipped)" }); setInput("");
    const next = { ...draftState, fields: value ? { ...draftState.fields, [field.id]: value } : draftState.fields, fieldIndex: draftState.fieldIndex + 1, awaiting: null };
    setDraftState(next); nextDraftStep(next, view.documentType);
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
    setMessages(chat.messages); setSavedChatId(chat.id); setCurrentKind(chat.kind); setError(null); setInput(""); setDraftState(emptyDraftState()); const id = uid();
    if (chat.kind === "ask") setView({ screen: "ask", sessionId: id });
    else if (chat.kind === "compliance") setView({ screen: "compliance", sessionId: id });
    else if (chat.kind === "tenancy" && chat.metadata.tenancyId) setView({ screen: "tenancy", sessionId: id, tenancyId: chat.metadata.tenancyId });
    else if (chat.kind === "property" && chat.metadata.propertyId) setView({ screen: "property", sessionId: id, propertyId: chat.metadata.propertyId });
    else if (chat.kind === "draft" && chat.metadata.documentType) setView({ screen: "draft", sessionId: id, documentType: chat.metadata.documentType });
    else setView({ screen: "draft-pick", sessionId: id });
  }
  async function saveChat() {
    if (!sessionId || !messages.length) return;
    const firstUser = messages.find((message) => message.role === "user" && message.content.trim());
    const metadata = view.screen === "draft" ? { documentType: view.documentType, documentName: getAssistantDocument(view.documentType)?.name, propertyId: draftState.propertyId ?? undefined, tenancyId: draftState.tenancyId ?? undefined } : view.screen === "tenancy" ? { tenancyId: view.tenancyId } : view.screen === "property" ? { propertyId: view.propertyId } : {};
    try { const response = await fetch("/api/assistant/chats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: savedChatId ?? undefined, kind: currentKind, title: truncateChatTitle(firstUser?.content || (currentKind === "draft" ? "Draft session" : "Saved chat")), messages, metadata }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to save chat."); setSavedChatId((data.chat as AssistantChatRecord).id); setToast("Chat saved"); void refreshSavedChats(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save chat."); }
  }
  async function deleteChat(id: string) { try { const response = await fetch(`/api/assistant/chats/${id}`, { method: "DELETE" }); if (!response.ok) throw new Error("Unable to delete chat."); setSavedChats((items) => items.filter((item) => item.id !== id)); if (savedChatId === id) goToMenu(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to delete chat."); } }
  function loadHistory(entry: AssistantHistoryEntry) { reset("draft"); setMessages([{ id: uid(), role: "assistant", content: "Here is a draft from earlier in this session.", document: { id: entry.id, documentType: entry.documentType, documentName: entry.documentName, subject: entry.subject, body: entry.body } }]); setView({ screen: "draft", sessionId: uid(), documentType: entry.documentType }); }
  useEffect(() => { if (startedRef.current || !initialAction) return; startedRef.current = true; if (initialAction === "expiry") { open("ask"); window.setTimeout(() => void ask("Which certificates expire soon?", "ask"), 0); } else open(initialAction); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction]);

  const activeChat = ["ask", "draft", "compliance", "tenancy", "property"].includes(view.screen);
  const mode = view.screen === "tenancy" ? "tenancy" : view.screen === "property" ? "property" : "ask";
  const entityId = view.screen === "tenancy" ? view.tenancyId : view.screen === "property" ? view.propertyId : undefined;
  const cards = [
    [
      "Ask Your Portfolio",
      "Ask questions about your properties, tenancies, certificates and compliance status. Get instant answers from your live portfolio data.",
      "“Which certificates expire this month?” / “Are any deposits unprotected?”",
      "Start Conversation",
      () => open("ask"),
    ],
    [
      "Draft a Document",
      "Generate professional letters, notices and correspondence using your property and tenancy data. Review and send from your own email.",
      "Rent increase notice / End of tenancy letter / Maintenance access",
      "Choose Document",
      () => open("draft"),
    ],
    [
      "Review a Tenancy",
      "Get a complete overview of any tenancy — key dates, deposit status, right to rent, upcoming actions required.",
      "“Review 42 Brook Street tenancy” / “Check deposit protection status”",
      "Select Tenancy",
      () => open("tenancy"),
    ],
    [
      "Property Report",
      "Generate a detailed compliance and tenancy summary for any single property — everything in one place.",
      "“Full report on 20 Hoath Hill” / “What needs attention at this property?”",
      "Choose Property",
      () => open("property"),
    ],
  ] as const;
  const button = "border border-ink-green px-4 py-2 text-xs uppercase tracking-[0.14em] text-ink-green transition hover:bg-[rgba(28,43,35,0.04)] disabled:opacity-40";

  return <div className="flex h-[calc(100vh-4rem)] w-full flex-col overflow-hidden lg:flex-row">
    <aside className="flex max-h-[42vh] w-full shrink-0 flex-col overflow-y-auto bg-ink-green lg:max-h-none lg:w-[30%] lg:min-w-[16rem] lg:max-w-sm">
      <div className="px-6 pb-2 pt-8 sm:px-8"><p className="text-[10px] uppercase tracking-[0.22em] text-dusty-cream">Assistant</p><div className="mt-3 h-px bg-moss/70" /></div>
      <div className="px-3 pt-4 sm:px-5"><button type="button" onClick={goToMenu} className="block w-full border-l-2 border-transparent py-3 pl-5 text-left text-sm tracking-wide text-dusty-cream/85 transition hover:border-moss hover:text-dusty-cream">New Session</button></div>
      <div className="mt-6 px-6 sm:px-8"><p className="text-[10px] uppercase tracking-[0.18em] text-dusty-cream/50">Recent sessions</p>{savedChats.length === 0 ? <p className="mt-3 text-xs leading-relaxed text-dusty-cream/40">Saved chats appear here.</p> : <ul className="mt-3 space-y-3">{savedChats.map((chat) => <li key={chat.id} className="group flex items-start gap-1"><button type="button" onClick={() => restore(chat)} className={`min-w-0 flex-1 border-l-2 py-1 pl-3 text-left ${savedChatId === chat.id ? "border-moss text-dusty-cream" : "border-transparent text-dusty-cream/80 hover:border-moss hover:text-dusty-cream"}`}><span className="block text-[10px] uppercase tracking-[0.14em] text-dusty-cream/45">{sessionKindLabel(chat.kind)} · {new Date(chat.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span><span className="mt-0.5 block truncate text-sm">{truncateChatTitle(chat.title)}</span></button><button type="button" aria-label={`Delete ${chat.title}`} onClick={() => void deleteChat(chat.id)} className="mt-1 p-1 text-dusty-cream/35 transition hover:text-moss"><Trash2 size={14} /></button></li>)}</ul>}</div>
      <div className="mt-7 px-3 sm:px-5"><button type="button" onClick={() => open("compliance")} className="block w-full border-l-2 border-transparent py-3 pl-5 text-left text-sm tracking-wide text-moss transition hover:border-moss">Compliance Check</button></div>
      <div className="mt-6 flex-1 px-6 sm:px-8"><p className="text-[10px] uppercase tracking-[0.18em] text-dusty-cream/50">Document history</p>{documentHistory.length === 0 ? <p className="mt-3 text-xs leading-relaxed text-dusty-cream/40">Completed drafts appear here.</p> : <ul className="mt-3 space-y-3">{documentHistory.map((entry) => <li key={entry.id}><button type="button" onClick={() => loadHistory(entry)} className="w-full text-left"><span className="block truncate text-sm text-dusty-cream/85">{entry.title}</span><span className="text-[10px] uppercase tracking-[0.12em] text-dusty-cream/45">{entry.documentName}</span></button></li>)}</ul>}</div>
      <p className="mt-auto px-6 py-6 text-[10px] leading-relaxed text-dusty-cream/40 sm:px-8">{ASSISTANT_DISCLAIMER}</p>
    </aside>
    <section className="relative flex min-h-0 flex-1 flex-col bg-line-cream">
      {toast && <div className="absolute right-6 top-5 z-10 border border-moss bg-line-cream px-4 py-2 text-xs uppercase tracking-wide text-ink-green">{toast}</div>}
      {view.screen === "menu" && <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-12 sm:px-10"><Monogram /><p className="mt-8 text-sm italic text-moss">{greeting()}</p><h1 className="mt-3 font-serif text-3xl text-[#1A0A0C] sm:text-4xl">What would you like to do?</h1><div className="mt-12 grid w-full max-w-4xl gap-6 lg:grid-cols-2">{cards.map(([title, copy, example, action, onClick]) => <div key={title} className="border-l-[3px] border-ink-green px-6 py-8 sm:px-8"><h2 className="font-serif text-2xl text-ink-green">{title}</h2><p className="mt-4 text-sm leading-relaxed text-[#1A0A0C]/85">{copy}</p><p className="mt-5 text-xs leading-relaxed text-cocoa">{example}</p><button type="button" onClick={onClick} className={`mt-8 ${button}`}>{action}</button></div>)}</div><button type="button" onClick={() => open("compliance")} className="mt-12 text-sm text-moss transition hover:text-ink-green">COMPLIANCE CHECK — Run a quick compliance check across your portfolio →</button></div>}
      {(view.screen === "draft-pick" || view.screen === "tenancy-pick" || view.screen === "property-pick") && <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-10 lg:px-14"><button type="button" onClick={goToMenu} className="text-sm text-cocoa hover:text-[#1A0A0C]">← Back to Menu</button><div className="mx-auto mt-10 max-w-2xl"><p className="text-[11px] uppercase tracking-[0.2em] text-ink-green">{view.screen === "draft-pick" ? "Choose Document Type" : view.screen === "tenancy-pick" ? "Select Tenancy" : "Choose Property"}</p><div className="mt-3 h-px bg-moss/60" /><ul>{view.screen === "draft-pick" ? ASSISTANT_DOCUMENTS.map((item) => <li key={item.id}><button type="button" onClick={() => beginDraft(item.id)} className="group flex w-full items-center gap-4 border-t border-moss/40 border-l-[3px] border-l-transparent py-7 text-left transition hover:border-l-ink-green hover:bg-[rgba(28,43,35,0.04)]"><span className="min-w-0 flex-1"><span className="block font-serif text-xl text-[#1A0A0C]">{item.name}</span><span className="mt-1 block text-sm text-cocoa">{item.description}</span></span><span className="text-ink-green">→</span></button></li>) : view.screen === "tenancy-pick" ? tenancies.map((item) => <li key={item.id}><button type="button" onClick={() => selectTenancy(item)} className="group flex w-full items-center gap-4 border-t border-moss/40 border-l-[3px] border-l-transparent py-7 text-left transition hover:border-l-ink-green hover:bg-[rgba(28,43,35,0.04)]"><span className="min-w-0 flex-1"><span className="block font-serif text-xl text-[#1A0A0C]">{item.tenant_names}</span><span className="mt-1 block text-sm text-cocoa">{item.property_address} · ends {item.end_date}</span></span><span className="text-ink-green">→</span></button></li>) : properties.map((item) => <li key={item.id}><button type="button" onClick={() => selectProperty(item)} className="group flex w-full items-center gap-4 border-t border-moss/40 border-l-[3px] border-l-transparent py-7 text-left transition hover:border-l-ink-green hover:bg-[rgba(28,43,35,0.04)]"><span className="min-w-0 flex-1"><span className="block font-serif text-xl text-[#1A0A0C]">{item.address}</span><span className="mt-1 block text-sm text-cocoa">{item.property_type.replace("_", " ")}</span></span><span className="text-ink-green">→</span></button></li>)}</ul></div></div>}
      {activeChat && <><div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-10 lg:px-14"><div className="mx-auto flex max-w-3xl items-center justify-between gap-4"><button type="button" onClick={goToMenu} className="text-sm text-cocoa hover:text-[#1A0A0C]">← Back to Menu</button><button type="button" onClick={() => void saveChat()} disabled={!messages.length} className="border border-moss px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-ink-green hover:bg-moss/10 disabled:opacity-40">Save Chat</button></div><div className="mx-auto mt-8 max-w-3xl space-y-6 pb-28">{view.screen === "ask" && !messages.length && !loading && <div><p className="border-l-2 border-ink-green pl-4 text-[15px] leading-relaxed text-[#1A0A0C]">Ask anything about your properties, tenancies or certificates.</p><div className="mt-5 flex flex-wrap gap-2 pl-4">{ASK_EXAMPLES.map((example) => <button key={example} type="button" onClick={() => void ask(example, "ask")} className={button}>{example}</button>)}</div></div>}{messages.map((message) => <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>{message.role === "user" ? <div className="max-w-[80%] bg-ink-green px-4 py-2 text-sm leading-relaxed text-dusty-cream">{message.content}</div> : <div className="max-w-[92%] border-l-2 border-ink-green pl-4"><p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#1A0A0C]">{message.content}</p>{message.chips && message.chipKind && <div className="mt-4 flex flex-wrap gap-2">{message.chips.map((chip) => <button key={chip.id} type="button" disabled={loading} onClick={() => chooseDraftChip(message.chipKind!, chip.id, chip.label)} className={button}>{chip.label}</button>)}</div>}{message.document && <DocumentCard document={message.document} />}</div>}</div>)}{loading && <TypingDots />}{error && <p className="text-sm text-urgent">{error}</p>}<div ref={bottomRef} /></div></div>{view.screen !== "compliance" && <div className="absolute inset-x-0 bottom-0 bg-line-cream/95 px-5 pb-5 pt-3 sm:px-10 lg:px-14"><form onSubmit={(event) => { event.preventDefault(); if (view.screen === "draft") submitDraft(); else void ask(input, mode, entityId); }} className="mx-auto flex max-w-3xl items-center gap-3 border border-ink-green bg-[#F7F4EC] px-4 py-3"><label htmlFor="assistant-mode-input" className="sr-only">Message</label><input id="assistant-mode-input" value={input} onChange={(event) => setInput(event.target.value)} disabled={loading} placeholder={view.screen === "draft" ? "Answer the drafting prompt above…" : "Ask a follow-up question…"} className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-[#1A0A0C] outline-none placeholder:text-cocoa/60" /><button type="submit" disabled={loading || (view.screen === "draft" ? draftState.awaiting !== "field" : !input.trim())} aria-label="Send" className="text-ink-green disabled:opacity-40">→</button></form></div>}</>}
    </section>
  </div>;
}
