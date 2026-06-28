"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  btnPrimaryClassName,
  cardClassName,
  inputClassName,
  labelClassName,
  sectionTitleClassName,
} from "@/lib/ui";

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
    <section className={`${cardClassName} p-8`}>
      <h2 className={sectionTitleClassName}>Change Password</h2>
      <p className="mt-1 text-sm text-mahogany-900/60">
        Choose a strong password for your account.
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-5">
        <div>
          <label htmlFor="password" className={labelClassName}>
            New Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelClassName}>
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClassName}
          />
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
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </section>
  );
}
