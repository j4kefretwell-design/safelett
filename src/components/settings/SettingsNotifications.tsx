"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  btnPrimaryClassName,
  cardClassName,
  sectionTitleClassName,
} from "@/lib/ui";
import type { UserProfile } from "@/lib/types";

interface SettingsNotificationsProps {
  profile: UserProfile;
}

export default function SettingsNotifications({
  profile,
}: SettingsNotificationsProps) {
  const router = useRouter();
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(
    profile.email_alerts_enabled
  );
  const [alertAt60, setAlertAt60] = useState(profile.alert_at_60);
  const [alertAt30, setAlertAt30] = useState(profile.alert_at_30);
  const [alertAt7, setAlertAt7] = useState(profile.alert_at_7);
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
    <section className={`${cardClassName} p-8`}>
      <h2 className={sectionTitleClassName}>Notification Preferences</h2>
      <p className="mt-1 text-sm text-mahogany-900/60">
        Control when SafeLett sends expiry reminder emails.
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-5">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={emailAlertsEnabled}
            onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gold-muted text-forest-900 focus:ring-forest-700"
          />
          <span>
            <span className="block text-sm font-medium text-mahogany-950">
              Email alerts enabled
            </span>
            <span className="block text-sm text-mahogany-900/60">
              Receive automated expiry reminders by email.
            </span>
          </span>
        </label>

        <div className="space-y-3 border-t border-gold-muted/60 pt-5">
          <p className="text-sm font-medium text-mahogany-950">
            Notify me when certificates are expiring within:
          </p>

          {[
            { label: "60 days", value: alertAt60, setter: setAlertAt60 },
            { label: "30 days", value: alertAt30, setter: setAlertAt30 },
            { label: "7 days", value: alertAt7, setter: setAlertAt7 },
          ].map((option) => (
            <label key={option.label} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={option.value}
                disabled={!emailAlertsEnabled}
                onChange={(e) => option.setter(e.target.checked)}
                className="h-4 w-4 rounded border-gold-muted text-forest-900 focus:ring-forest-700 disabled:opacity-40"
              />
              <span className="text-sm text-mahogany-900/80">{option.label}</span>
            </label>
          ))}
        </div>

        {error && (
          <p className="rounded-lg border border-urgent/20 bg-urgent-light px-4 py-3 text-sm text-urgent">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-lg border border-compliant/20 bg-compliant-light px-4 py-3 text-sm text-compliant">
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} className={btnPrimaryClassName}>
          {loading ? "Saving..." : "Save Preferences"}
        </button>
      </form>
    </section>
  );
}
