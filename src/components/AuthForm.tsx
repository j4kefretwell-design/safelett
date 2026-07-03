"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackgroundImage from "@/components/BackgroundImage";
import BrandWordmark from "@/components/BrandWordmark";
import PasswordInput from "@/components/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import {
  authCardClassName,
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
    <div className="relative flex min-h-screen items-center justify-center bg-[#2C1810] px-6 py-16">
      <BackgroundImage
        src="/vojtech-bartonicek-wgG7jLQ7M0U-unsplash-auth.jpg"
        alt=""
        sizes="(max-width: 1920px) 100vw, 1920px"
        priority
        quality={60}
        placeholderColor="#2C1810"
        effect="fade"
      />
      <div className="absolute inset-0 bg-[#1A0A0C]/70" />

      <div className={`relative z-10 ${authCardClassName}`}>
        <div className="mb-10 text-center">
          <BrandWordmark href="/" variant="card" />
        </div>

        <h1 className="font-serif text-2xl tracking-wide text-text sm:text-3xl">
          {mode === "login" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-4 text-sm font-light leading-relaxed text-cocoa">
          {mode === "login"
            ? "Welcome back to your portfolio."
            : "Begin tracking compliance with confidence."}
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
            <p className="border border-urgent/20 bg-urgent-light/50 px-4 py-3 text-sm text-urgent">
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

        <p className="mt-10 border-t border-cocoa/15 pt-8 text-center text-sm font-light text-cocoa">
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
