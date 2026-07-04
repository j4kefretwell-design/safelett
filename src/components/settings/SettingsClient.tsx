"use client";

import { AnimateIn } from "@/components/AnimateIn";
import SettingsAccount from "@/components/settings/SettingsAccount";
import SettingsNotifications from "@/components/settings/SettingsNotifications";
import SettingsPassword from "@/components/settings/SettingsPassword";
import SettingsSubscription from "@/components/settings/SettingsSubscription";
import { editorialBleedClassName, editorialPagePaddingClassName } from "@/lib/ui";
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
    <div className={`flex flex-col lg:flex-row ${editorialBleedClassName}`}>
      <aside className={`border-b border-leather/15 bg-dusty-cream py-8 lg:sticky lg:top-0 lg:w-52 lg:shrink-0 lg:self-start lg:border-b-0 lg:border-r lg:py-16 xl:w-60 ${editorialPagePaddingClassName}`}>
        <p className="mb-6 hidden text-[10px] font-normal uppercase tracking-[0.32em] text-leather lg:block">
          Settings
        </p>
        <nav className="flex gap-8 overflow-x-auto lg:flex-col lg:gap-4">
          {SETTINGS_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="shrink-0 text-left text-xs font-normal uppercase tracking-[0.16em] text-leather transition hover:text-text"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className={`min-w-0 flex-1 py-12 lg:py-16 ${editorialPagePaddingClassName} xl:pr-20`}>
        <AnimateIn>
          <header className="pb-16 lg:pb-20">
            <p className="text-[10px] font-normal uppercase tracking-[0.32em] text-leather">
              Preferences
            </p>
            <h1 className="mt-4 font-serif text-4xl tracking-wide text-text sm:text-5xl">
              Settings
            </h1>
            <div className="mt-5 h-px w-12 bg-gold/70" aria-hidden="true" />
          </header>
        </AnimateIn>

        <SettingsAccount initialName={profile.full_name ?? ""} initialEmail={email} />
        <SettingsNotifications profile={profile} />
        <SettingsSubscription />
        <SettingsPassword />
      </div>
    </div>
  );
}
