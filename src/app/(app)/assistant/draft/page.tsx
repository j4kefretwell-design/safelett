import { redirect } from "next/navigation";

export default function AssistantDraftRedirectPage() {
  redirect("/assistant?action=draft");
}
