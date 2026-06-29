"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BRAND_NAME } from "@/lib/brand";
import {
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

      await fetch("/api/welcome-email", { method: "POST" });
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

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between border-r border-border bg-off-white p-14 lg:flex">
        <div>
          <span className="font-serif text-3xl font-medium tracking-tight text-burgundy">
            {BRAND_NAME}
          </span>
        </div>
        <div>
          <p className="max-w-sm font-serif text-3xl font-medium leading-snug text-charcoal">
            Property compliance, handled with care.
          </p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-charcoal-muted">
            Monitor certificates, track expiry dates, and stay ahead of
            regulatory requirements across your portfolio.
          </p>
        </div>
        <p className="text-xs text-charcoal-muted/70">
          For professional property management teams.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <span className="font-serif text-2xl font-medium tracking-tight text-burgundy">
              {BRAND_NAME}
            </span>
          </div>

          <h1 className="font-serif text-3xl font-medium tracking-tight text-charcoal">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <p className="mt-3 text-sm text-charcoal-muted">
            {mode === "login"
              ? "Welcome back."
              : "Begin tracking compliance across your portfolio."}
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label htmlFor="email" className={labelClassName}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClassName}>
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClassName}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-sm border border-urgent/20 bg-urgent-light px-4 py-3 text-sm text-urgent">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`${btnPrimaryClassName} w-full`}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-charcoal-muted">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className={linkClassName}>
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className={linkClassName}>
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
