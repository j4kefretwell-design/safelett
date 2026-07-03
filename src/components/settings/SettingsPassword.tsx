"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";
import SettingsSection from "@/components/settings/SettingsSection";
import { btnPrimaryClassName } from "@/lib/ui";

export default function SettingsPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setMessage("Password updated successfully.");
    setLoading(false);
  }

  return (
    <SettingsSection
      title="Security Settings"
      bandTone="espresso"
      description="Choose a strong password for your account."
    >
      <form onSubmit={handleSave} className="max-w-md space-y-8">
        <PasswordInput
          id="new-password"
          label="New Password"
          value={password}
          onChange={setPassword}
          minLength={6}
        />

        <PasswordInput
          id="confirm-password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          minLength={6}
        />

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
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </SettingsSection>
  );
}
