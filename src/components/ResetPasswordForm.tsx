"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackgroundImage from "@/components/BackgroundImage";
import BrandWordmark from "@/components/BrandWordmark";
import PasswordInput from "@/components/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import { siteImages } from "@/lib/site-images";
import {
  authCardClassName,
  btnPrimaryClassName,
  editorialFormCancelClassName,
  pageBackLinkClassName,
} from "@/lib/ui";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setSessionReady(true);
      }

      setCheckingSession(false);
    }
    void checkRecoverySession();
  }, []);

  // The recovery link signs the user into a temporary session; middleware
  // redirects authenticated users away from /login, so sign out first.
  async function goToSignIn() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
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

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#252525] px-6 py-16">
      <BackgroundImage
        image={siteImages.vojtechAuth}
        alt=""
        sizes="100vw"
        priority
        effect="fade"
      />
      <div className="absolute inset-0 bg-[#252525]/70" />

      <div className={`relative z-10 ${authCardClassName}`}>
        <div className="mb-10 text-center">
          <BrandWordmark href="/" variant="card" />
        </div>

        {success ? (
          <div className="space-y-6">
            <h1 className="font-serif text-2xl tracking-wide text-heading sm:text-3xl">
              Password updated
            </h1>
            <p className="text-sm font-light leading-relaxed text-cocoa">
              Your password has been updated. You can now sign in.
            </p>
            <button
              type="button"
              onClick={() => void goToSignIn()}
              className={`${btnPrimaryClassName} w-full`}
            >
              Return to Sign In →
            </button>
          </div>
        ) : checkingSession ? (
          <p className="text-sm font-light text-cocoa">Verifying reset link...</p>
        ) : !sessionReady ? (
          <div className="space-y-6">
            <h1 className="font-serif text-2xl tracking-wide text-heading sm:text-3xl">
              Reset link expired
            </h1>
            <p className="text-sm font-light leading-relaxed text-cocoa">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <button
              type="button"
              onClick={() => void goToSignIn()}
              className={`${btnPrimaryClassName} w-full`}
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void goToSignIn()}
              className={pageBackLinkClassName}
            >
              ← Back to Sign In
            </button>
            <h1 className="mt-8 font-serif text-2xl tracking-wide text-heading sm:text-3xl">
              Set new password
            </h1>
            <p className="mt-4 text-sm font-light leading-relaxed text-cocoa">
              Choose a new password for your account.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
              <PasswordInput
                id="password"
                label="New password"
                value={password}
                onChange={setPassword}
                minLength={6}
                autoComplete="new-password"
              />

              <PasswordInput
                id="confirm-password"
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                minLength={6}
                autoComplete="new-password"
              />

              {error && (
                <p className="border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
                  {error}
                </p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${btnPrimaryClassName} w-full`}
                >
                  {loading ? "Please wait..." : "Update password"}
                </button>
                <button
                  type="button"
                  onClick={() => void goToSignIn()}
                  className={editorialFormCancelClassName}
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
