import { redirect } from "next/navigation";

export default function AssistantAskRedirectPage() {
  redirect("/assistant?action=ask");
}
