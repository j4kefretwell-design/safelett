import { AnimateIn } from "@/components/AnimateIn";
import PageHeader from "@/components/layout/PageHeader";
import SettingsAccount from "@/components/settings/SettingsAccount";
import SettingsNotifications from "@/components/settings/SettingsNotifications";
import SettingsPassword from "@/components/settings/SettingsPassword";
import SettingsSubscription from "@/components/settings/SettingsSubscription";
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

      <div className="max-w-2xl">
        <AnimateIn delay={50}>
          <SettingsAccount
            initialName={profile.full_name ?? ""}
            initialEmail={user.email ?? ""}
          />
        </AnimateIn>
        <AnimateIn delay={100}>
          <SettingsNotifications profile={profile} />
        </AnimateIn>
        <AnimateIn delay={150}>
          <SettingsSubscription />
        </AnimateIn>
        <AnimateIn delay={200}>
          <SettingsPassword />
        </AnimateIn>
      </div>
    </>
  );
}
