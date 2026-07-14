import { redirect } from "next/navigation";
import LandingPage from "@/components/marketing/LandingPage";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/assistant");
  }

  return <LandingPage />;
}
