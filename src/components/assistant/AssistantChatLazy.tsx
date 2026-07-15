"use client";

import dynamic from "next/dynamic";
import { AssistantSkeleton } from "@/components/loading/PageSkeletons";
import type { Property } from "@/lib/types";
import type { Tenancy } from "@/lib/tenancy";

const AssistantChat = dynamic(
  () =>
    import(
      /* webpackChunkName: "assistant-chat" */ "@/components/assistant/AssistantChat"
    ),
  {
    loading: () => <AssistantSkeleton />,
    ssr: false,
  }
);

interface AssistantChatLazyProps {
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

export default function AssistantChatLazy(props: AssistantChatLazyProps) {
  return <AssistantChat {...props} />;
}
