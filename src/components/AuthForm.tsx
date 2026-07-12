"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackgroundImage from "@/components/BackgroundImage";
import BrandWordmark from "@/components/BrandWordmark";
import PasswordInput from "@/components/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import { siteImages } from "@/lib/site-images";
import {
  authBtnLoginClassName,
  authCardClassName,
  authCardLoginClassName,
  authForgotLinkClassName,
  authInputLoginClassName,
  authLabelLoginClassName,
  authLinkLoginClassName,
  btnPrimaryClassName,
  inputClassName,
  labelClassName,
  linkClassName,
} from "@/lib/ui";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const isLoginStyled = mode === "login";
  const cardClassName = isLoginStyled ? authCardLoginClassName : authCardClassName;
  const fieldLabelClassName = isLoginStyled ? authLabelLoginClassName : labelClassName;
  const fieldInputClassName = isLoginStyled ? authInputLoginClassName : inputClassName;
  const submitBtnClassName = isLoginStyled ? authBtnLoginClassName : btnPrimaryClassName;
  const footerLinkClassName = isLoginStyled ? authLinkLoginClassName : linkClassName;
  const subtitleClassName = isLoginStyled
    ? "mt-4 text-sm font-light leading-relaxed text-umber/80"
    : "mt-4 text-sm font-light leading-relaxed text-cocoa";
  const titleClassName = isLoginStyled
    ? "font-serif text-2xl tracking-wide text-umber sm:text-3xl"
    : "font-serif text-2xl tracking-wide text-text sm:text-3xl";
  const footerBorderClassName = isLoginStyled
    ? "mt-10 border-t border-umber/15 pt-8 text-center text-sm font-light text-umber/80"
    : "mt-10 border-t border-cocoa/15 pt-8 text-center text-sm font-light text-cocoa";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      void fetch("/api/welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setResetSent(true);
    setLoading(false);
  }

  const title = showForgotPassword
    ? "Reset password"
    : mode === "login"
      ? "Sign in"
      : "Create account";

  const subtitle = showForgotPassword
    ? resetSent
      ? "Check your email for a link to reset your password."
      : "Enter your email address and we will send you a reset link."
    : mode === "login"
      ? "Welcome back to your portfolio."
      : "Begin tracking compliance with confidence.";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#1A0A0C] px-6 py-16">
      <BackgroundImage
        image={siteImages.vojtechAuth}
        alt=""
        sizes="100vw"
        priority
        effect="fade"
      />
      <div className="absolute inset-0 bg-[#1A0A0C]/70" />

      <div className={`relative z-10 ${cardClassName}`}>
        <div className="mb-10 text-center">
          <BrandWordmark
            href="/"
            variant={isLoginStyled ? "auth" : "card"}
          />
        </div>

        <h1 className={titleClassName}>{title}</h1>
        <p className={subtitleClassName}>{subtitle}</p>

        {showForgotPassword ? (
          resetSent ? (
            <div className="mt-10 space-y-6">
              <p className={subtitleClassName}>
                If an account exists for <strong className="font-normal">{email}</strong>, you will receive an email shortly.
              </p>
              <Link href="/login" className={submitBtnClassName}>
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="mt-10 space-y-8">
              <div>
                <label htmlFor="email" className={fieldLabelClassName}>
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldInputClassName}
                  placeholder="you@company.com"
                />
              </div>

              {error && (
                <p className="border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={submitBtnClassName}
              >
                {loading ? "Please wait..." : "Send reset link"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError(null);
                }}
                className={
                  isLoginStyled
                    ? `block w-full text-center ${authForgotLinkClassName}`
                    : "block w-full text-center text-sm font-light text-gold-readable transition hover:text-gold"
                }
              >
                Back to sign in
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <div>
              <label htmlFor="email" className={fieldLabelClassName}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldInputClassName}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <PasswordInput
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                minLength={6}
                inputClassName={fieldInputClassName}
                labelClassName={fieldLabelClassName}
                toggleClassName={
                  isLoginStyled
                    ? "absolute right-0 bottom-3 text-umber/50 transition hover:text-umber"
                    : undefined
                }
              />
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError(null);
                  }}
                  className={`mt-2 ${authForgotLinkClassName}`}
                >
                  Forgot your password?
                </button>
              )}
            </div>

            {error && (
              <p className="border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={submitBtnClassName}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>
        )}

        {!showForgotPassword && (
          <p className={footerBorderClassName}>
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className={footerLinkClassName}>
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className={footerLinkClassName}>
                  Sign in
                </Link>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
