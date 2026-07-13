import type { AssistantDocumentType } from "@/lib/assistant";

export const ASSISTANT_HISTORY_KEY = "fretwell-assistant-draft-history";

export interface AssistantHistoryEntry {
  id: string;
  title: string;
  documentType: AssistantDocumentType;
  documentName: string;
  subject: string;
  body: string;
  createdAt: string;
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function readAssistantHistory(): AssistantHistoryEntry[] {
  if (!canUseSessionStorage()) return [];

  try {
    const raw = sessionStorage.getItem(ASSISTANT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AssistantHistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function writeAssistantHistory(entries: AssistantHistoryEntry[]) {
  if (!canUseSessionStorage()) return;
  sessionStorage.setItem(ASSISTANT_HISTORY_KEY, JSON.stringify(entries));
}

export function addAssistantHistoryEntry(
  entry: Omit<AssistantHistoryEntry, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  }
): AssistantHistoryEntry {
  const next: AssistantHistoryEntry = {
    id: entry.id ?? crypto.randomUUID(),
    title: entry.title,
    documentType: entry.documentType,
    documentName: entry.documentName,
    subject: entry.subject,
    body: entry.body,
    createdAt: entry.createdAt ?? new Date().toISOString(),
  };

  const existing = readAssistantHistory().filter((item) => item.id !== next.id);
  writeAssistantHistory([next, ...existing].slice(0, 20));
  return next;
}

export function getAssistantHistoryEntry(
  id: string
): AssistantHistoryEntry | null {
  return readAssistantHistory().find((entry) => entry.id === id) ?? null;
}

export function updateAssistantHistoryEntry(
  id: string,
  patch: Partial<Pick<AssistantHistoryEntry, "title" | "subject" | "body">>
) {
  const entries = readAssistantHistory();
  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) return null;

  const updated = { ...entries[index], ...patch };
  entries[index] = updated;
  writeAssistantHistory(entries);
  return updated;
}
