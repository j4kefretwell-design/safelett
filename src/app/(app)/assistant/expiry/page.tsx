import { redirect } from "next/navigation";

export default function AssistantExpiryRedirectPage() {
  redirect("/assistant?action=expiry");
}
