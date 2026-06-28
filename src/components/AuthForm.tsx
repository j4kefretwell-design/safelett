"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  btnPrimaryClassName,
  inputClassName,
  labelClassName,
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
      <div className="hidden w-1/2 flex-col justify-between bg-navy-950 p-12 text-white lg:flex">
        <div>
          <span className="text-3xl font-bold tracking-tight">
            Safe<span className="text-emerald-400">Lett</span>
          </span>
          <p className="mt-2 text-sm font-medium uppercase tracking-widest text-slate-400">
            Compliance Platform
          </p>
        </div>
        <div>
          <p className="max-w-md text-2xl font-semibold leading-snug">
            Property compliance tracking built for UK property managers.
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Monitor certificates, track expiry dates, and stay ahead of
            regulatory requirements across your entire portfolio.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Trusted by professional property management teams.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-surface px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <span className="text-2xl font-bold tracking-tight text-navy-950">
              Safe<span className="text-emerald-600">Lett</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-navy-950">
            {mode === "login" ? "Sign in" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {mode === "login"
              ? "Welcome back. Enter your credentials to continue."
              : "Get started with compliance tracking for your portfolio."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              <p className="rounded-lg border border-red-200 bg-urgent-light px-4 py-3 text-sm text-urgent">
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

          <p className="mt-8 text-center text-sm text-slate-500">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-navy-900 hover:underline"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-navy-900 hover:underline"
                >
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
