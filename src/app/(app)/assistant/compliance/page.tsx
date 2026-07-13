import { redirect } from "next/navigation";

export default function AssistantComplianceRedirectPage() {
  redirect("/assistant?action=compliance");
}
