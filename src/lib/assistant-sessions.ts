import type { AssistantDocumentType } from "@/lib/assistant";

export const ASSISTANT_SESSIONS_KEY = "fretwell-assistant-sessions";

export type AssistantSessionKind = "ask" | "draft" | "compliance";

export interface AssistantSessionDocument {
  id: string;
  documentName: string;
  subject: string;
  body: string;
  documentType: AssistantDocumentType;
}

export interface AssistantSessionMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  chips?: Array<{ id: string; label: string }>;
  chipKind?: "property" | "tenancy";
  document?: AssistantSessionDocument;
}

export interface AssistantSession {
  id: string;
  kind: AssistantSessionKind;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AssistantSessionMessage[];
  documentType?: AssistantDocumentType;
  documentName?: string;
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function readAssistantSessions(): AssistantSession[] {
  if (!canUseSessionStorage()) return [];

  try {
    const raw = sessionStorage.getItem(ASSISTANT_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AssistantSession[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function writeAssistantSessions(sessions: AssistantSession[]) {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(ASSISTANT_SESSIONS_KEY, JSON.stringify(sessions));
}

export function upsertAssistantSession(session: AssistantSession) {
  const existing = readAssistantSessions().filter((item) => item.id !== session.id);
  writeAssistantSessions(
    [{ ...session, updatedAt: new Date().toISOString() }, ...existing].slice(
      0,
      30
    )
  );
}

export function getAssistantSession(id: string): AssistantSession | null {
  return readAssistantSessions().find((session) => session.id === id) ?? null;
}

export function sessionKindLabel(kind: AssistantSessionKind) {
  if (kind === "ask") return "Ask";
  if (kind === "draft") return "Draft";
  return "Compliance";
}
