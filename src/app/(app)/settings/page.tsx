import { AnimateIn } from "@/components/AnimateIn";
import PageHeader from "@/components/layout/PageHeader";
import SettingsClient from "@/components/settings/SettingsClient";
import { getUserProfile } from "@/lib/user-profile";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await getUserProfile(supabase, user.id);

  return (
    <>
      <AnimateIn>
        <PageHeader
          title="Settings"
          description="Your account, notifications, and preferences."
        />
      </AnimateIn>

      <SettingsClient profile={profile} email={user.email ?? ""} />
    </>
  );
}
