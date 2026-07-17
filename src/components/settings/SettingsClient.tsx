"use client";

import { AnimateIn } from "@/components/AnimateIn";
import PageBackButton from "@/components/PageBackButton";
import DeleteAccountSection from "@/components/settings/DeleteAccountSection";
import SettingsAccount from "@/components/settings/SettingsAccount";
import SettingsNotifications from "@/components/settings/SettingsNotifications";
import SettingsPassword from "@/components/settings/SettingsPassword";
import SettingsSubscription from "@/components/settings/SettingsSubscription";
import { editorialPagePaddingClassName } from "@/lib/ui";
import type { UserProfile } from "@/lib/types";

interface SettingsClientProps {
  profile: UserProfile;
  email: string;
}

const SETTINGS_NAV = [
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
  { id: "subscription", label: "Subscription" },
  { id: "security", label: "Security" },
] as const;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function SettingsClient({ profile, email }: SettingsClientProps) {
  return (
    <div className={`min-h-screen bg-dusty-cream pb-12 pt-[calc(var(--app-top-offset,4rem)+3rem)] lg:pb-16 lg:pt-[calc(var(--app-top-offset,4rem)+4rem)] ${editorialPagePaddingClassName}`}>
      <PageBackButton className="mb-8" />
      <AnimateIn>
        <header className="pb-12 lg:pb-16">
          <h1 className="font-serif text-4xl tracking-wide text-text sm:text-5xl">
            Settings
          </h1>
          <div className="mt-5 h-px w-12 bg-gold/70" aria-hidden="true" />
        </header>
      </AnimateIn>

      <nav className="mb-12 flex flex-wrap gap-6 border-b border-leather/15 pb-8">
        {SETTINGS_NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.id)}
            className="text-[10px] font-normal uppercase tracking-[0.18em] text-leather transition hover:text-text"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="max-w-2xl">
        <SettingsAccount initialName={profile.full_name ?? ""} initialEmail={email} />
        <SettingsNotifications profile={profile} />
        <SettingsSubscription />
        <SettingsPassword />
        <DeleteAccountSection />
      </div>
    </div>
  );
}
