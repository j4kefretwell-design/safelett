"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  btnPrimaryClassName,
  cardClassName,
  inputClassName,
  labelClassName,
  mutedTextClassName,
  sectionTitleClassName,
} from "@/lib/ui";

interface SettingsAccountProps {
  initialName: string;
  initialEmail: string;
}

export default function SettingsAccount({
  initialName,
  initialEmail,
}: SettingsAccountProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
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

    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        full_name: fullName.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (email !== initialEmail) {
      const { error: emailError } = await supabase.auth.updateUser({ email });

      if (emailError) {
        setError(emailError.message);
        setLoading(false);
        return;
      }

      setMessage(
        "Profile updated. If you changed your email, check your inbox to confirm the new address."
      );
    } else {
      setMessage("Account settings saved.");
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <section className={`${cardClassName} p-8`}>
      <h2 className={sectionTitleClassName}>Account Settings</h2>
      <p className={`${mutedTextClassName} mt-1`}>
        Update your name and email address.
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-5">
        <div>
          <label htmlFor="fullName" className={labelClassName}>
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClassName}
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClassName}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClassName}
          />
        </div>

        {error && (
          <p className="rounded-sm border border-urgent/20 bg-urgent-light px-4 py-3 text-sm text-urgent">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-sm border border-compliant/20 bg-compliant-light px-4 py-3 text-sm text-compliant">
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} className={btnPrimaryClassName}>
          {loading ? "Saving..." : "Save Account Settings"}
        </button>
      </form>
    </section>
  );
}
