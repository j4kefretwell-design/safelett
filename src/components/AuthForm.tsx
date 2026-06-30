"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BRAND_NAME } from "@/lib/brand";
import {
  btnPrimaryClassName,
  cardClassName,
  inputClassName,
  labelClassName,
  linkClassName,
  pageTitleRuleClassName,
} from "@/lib/ui";
import PasswordInput from "@/components/PasswordInput";

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
    <div className="flex min-h-screen flex-col items-center bg-burgundy px-6 py-12">
      <div className="mb-10 text-center">
        <span className="font-serif text-3xl font-medium tracking-tight text-gold sm:text-4xl">
          {BRAND_NAME}
        </span>
      </div>

      <div className={`${cardClassName} w-full max-w-md p-8 sm:p-10`}>
        <h1 className="font-serif text-2xl font-medium tracking-tight text-charcoal sm:text-3xl">
          {mode === "login" ? "Sign in" : "Create account"}
        </h1>
        <div className={pageTitleRuleClassName} aria-hidden="true" />
        <p className="mt-5 text-sm leading-relaxed text-charcoal-muted">
          {mode === "login"
            ? "Welcome back."
            : "Begin tracking compliance across your portfolio."}
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
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

          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            minLength={6}
          />

          {error && (
            <p className="rounded-sm border border-urgent/30 bg-urgent-light px-4 py-3 text-sm text-urgent">
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

        <p className="mt-8 border-t border-gold-light pt-8 text-center text-sm text-charcoal-muted">
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
  );
}
