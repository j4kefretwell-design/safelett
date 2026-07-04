"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { btnPrimaryClassName } from "@/lib/ui";
import SettingsSection from "@/components/settings/SettingsSection";
import type { UserProfile } from "@/lib/types";
import { BRAND_NAME } from "@/lib/brand";

interface SettingsNotificationsProps {
  profile: UserProfile;
}

export default function SettingsNotifications({
  profile,
}: SettingsNotificationsProps) {
  const router = useRouter();
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(
    profile.email_alerts_enabled ?? true
  );
  const [alertAt60, setAlertAt60] = useState(profile.alert_at_60 ?? true);
  const [alertAt30, setAlertAt30] = useState(profile.alert_at_30 ?? true);
  const [alertAt7, setAlertAt7] = useState(profile.alert_at_7 ?? true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        email_alerts_enabled: emailAlertsEnabled,
        alert_at_60: alertAt60,
        alert_at_30: alertAt30,
        alert_at_7: alertAt7,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setMessage("Notification preferences saved.");
    setLoading(false);
    router.refresh();
  }

  return (
    <SettingsSection
      id="notifications"
      label="Notifications"
      title="Notification Settings"
      description={`Control when ${BRAND_NAME} sends expiry reminder emails.`}
    >
      <form onSubmit={handleSave} className="space-y-8">
        <label className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={emailAlertsEnabled}
            onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
            className="mt-1 h-4 w-4 border-leather/30 text-raspberry focus:ring-leather/20"
          />
          <span>
            <span className="block text-sm font-light text-text">
              Email alerts enabled
            </span>
            <span className="mt-1 block text-sm font-light text-leather">
              Receive automated expiry reminders by email.
            </span>
          </span>
        </label>

        <div className="space-y-4 border-t border-leather/15 pt-8">
          <p className="text-xs font-normal uppercase tracking-[0.16em] text-leather">
            Notify within
          </p>

          {[
            { label: "60 days", value: alertAt60, setter: setAlertAt60 },
            { label: "30 days", value: alertAt30, setter: setAlertAt30 },
            { label: "7 days", value: alertAt7, setter: setAlertAt7 },
          ].map((option) => (
            <label key={option.label} className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={option.value}
                disabled={!emailAlertsEnabled}
                onChange={(e) => option.setter(e.target.checked)}
                className="h-4 w-4 border-leather/30 text-raspberry focus:ring-leather/20 disabled:opacity-40"
              />
              <span className="text-sm font-light text-leather">{option.label}</span>
            </label>
          ))}
        </div>

        {error && (
          <p className="border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
            {error}
          </p>
        )}
        {message && (
          <p className="border border-compliant/20 bg-compliant-light/50 px-4 py-3 text-sm text-compliant">
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} className={btnPrimaryClassName}>
          {loading ? "Saving..." : "Save Preferences"}
        </button>
      </form>
    </SettingsSection>
  );
}
