import type { AssistantDocumentType } from "@/lib/assistant";

export type AssistantChatKind =
  | "ask"
  | "draft"
  | "compliance"
  | "tenancy"
  | "property";

export interface AssistantChatDocument {
  id: string;
  documentName: string;
  subject: string;
  body: string;
  documentType: AssistantDocumentType;
}

export interface AssistantChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  chips?: Array<{ id: string; label: string }>;
  chipKind?: "property" | "tenancy";
  document?: AssistantChatDocument;
}

export interface AssistantChatRecord {
  id: string;
  kind: AssistantChatKind;
  title: string;
  messages: AssistantChatMessage[];
  metadata: {
    documentType?: AssistantDocumentType;
    documentName?: string;
    propertyId?: string;
    tenancyId?: string;
  };
  created_at: string;
  updated_at: string;
}

export function sessionKindLabel(kind: AssistantChatKind) {
  if (kind === "ask") return "Ask";
  if (kind === "draft") return "Draft";
  if (kind === "tenancy") return "Tenancy";
  if (kind === "property") return "Property";
  return "Compliance";
}

export function truncateChatTitle(text: string, max = 40) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}
