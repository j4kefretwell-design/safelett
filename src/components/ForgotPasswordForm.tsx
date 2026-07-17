"use client";

import { useState } from "react";
import Link from "next/link";
import BackgroundImage from "@/components/BackgroundImage";
import BrandWordmark from "@/components/BrandWordmark";
import { siteImages } from "@/lib/site-images";
import {
  authBtnLoginClassName,
  authCardLoginClassName,
  authForgotLinkClassName,
  authInputLoginClassName,
  authLabelLoginClassName,
} from "@/lib/ui";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Unable to send reset email.");
      }
      setSent(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to send reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#252525] px-4 py-12 sm:px-6 sm:py-16">
      <BackgroundImage
        image={siteImages.vojtechAuth}
        alt=""
        sizes="100vw"
        priority
        effect="fade"
      />
      <div className="absolute inset-0 bg-[#252525]/70" />

      <div className={`relative z-10 ${authCardLoginClassName}`}>
        <Link
          href="/"
          aria-label="Back to home"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center text-xl font-light text-taupe transition hover:text-gold"
        >
          ×
        </Link>

        <div className="mb-10 text-center">
          <BrandWordmark href="/" variant="auth" />
        </div>

        <h1 className="font-serif text-2xl tracking-wide text-umber sm:text-3xl">
          Reset password
        </h1>

        {sent ? (
          <div className="mt-4">
            <p className="text-sm font-light leading-relaxed text-umber/80">
              Check your email for a secure link to reset your password. If an
              account exists for <strong className="font-normal">{email}</strong>,
              it will arrive shortly.
            </p>
            <Link href="/login" className={`${authBtnLoginClassName} mt-8`}>
              Return to Sign In →
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm font-light leading-relaxed text-umber/80">
              Enter your email address and we will send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
              <div>
                <label htmlFor="forgot-email" className={authLabelLoginClassName}>
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className={authInputLoginClassName}
                  placeholder="you@company.com"
                />
              </div>

              {error ? (
                <p
                  role="alert"
                  className="border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className={authBtnLoginClassName}
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
              <Link
                href="/login"
                className={`block w-full text-center ${authForgotLinkClassName}`}
              >
                Return to Sign In
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
