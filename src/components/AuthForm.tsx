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
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const newUserId = signUpData.user?.id;
      if (newUserId) {
        const startedAt = new Date().toISOString();
        await supabase.from("user_profiles").upsert({
          id: newUserId,
          trial_started_at: startedAt,
          email_alerts_enabled: true,
          alert_at_60: true,
          alert_at_30: true,
          alert_at_7: true,
        });
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

  const title = mode === "login" ? "Sign in" : "Create account";
  const subtitle =
    mode === "login"
      ? "Welcome back to your portfolio."
      : "Begin tracking compliance with confidence.";

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

      <div className={`relative z-10 ${cardClassName}`}>
        <Link
          href="/"
          aria-label="Back to home"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center text-xl font-light leading-none text-taupe transition hover:text-gold"
        >
          ×
        </Link>

        <div className="mb-10 text-center">
          <BrandWordmark
            href="/"
            variant={isLoginStyled ? "auth" : "card"}
          />
        </div>

        <h1 className={titleClassName}>{title}</h1>
        <p className={subtitleClassName}>{subtitle}</p>

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
                <Link
                  href="/forgot-password"
                  className={`mt-2 ${authForgotLinkClassName}`}
                >
                  Forgot your password?
                </Link>
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
      </div>
    </div>
  );
}
