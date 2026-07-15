import AppShell from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import { getTrialAccessForUser } from "@/lib/trial-server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let showTrialBanner = false;
  let trialDaysRemaining: number | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const access = await getTrialAccessForUser(supabase, user.id);
      showTrialBanner = access.inTrial && access.daysRemaining > 0;
      trialDaysRemaining = access.inTrial ? access.daysRemaining : null;
    }
  } catch (error) {
    console.error("[app-layout] trial banner check failed", error);
  }

  return (
    <AppShell
      showTrialBanner={showTrialBanner}
      trialDaysRemaining={trialDaysRemaining}
    >
      {children}
    </AppShell>
  );
}
