"use client";

import { AnimateIn } from "@/components/AnimateIn";
import SettingsAccount from "@/components/settings/SettingsAccount";
import SettingsNotifications from "@/components/settings/SettingsNotifications";
import SettingsPassword from "@/components/settings/SettingsPassword";
import SettingsSubscription from "@/components/settings/SettingsSubscription";
import type { UserProfile } from "@/lib/types";

interface SettingsClientProps {
  profile: UserProfile;
  email: string;
}

export default function SettingsClient({ profile, email }: SettingsClientProps) {
  return (
    <div className="max-w-2xl">
      <AnimateIn delay={50}>
        <SettingsAccount initialName={profile.full_name ?? ""} initialEmail={email} />
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
  );
}
