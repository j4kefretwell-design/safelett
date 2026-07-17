"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, loading]);

  function closeModal() {
    if (loading) return;
    setOpen(false);
    setError(null);
  }

  async function deleteAccount() {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await response.json()) as {
        deleted?: boolean;
        error?: string;
      };

      if (!response.ok || !data.deleted) {
        throw new Error(data.error || "Account deletion failed.");
      }

      const supabase = createClient();
      await supabase.auth.signOut({ scope: "local" });
      window.location.assign("/?account=deleted");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Account deletion failed."
      );
      setLoading(false);
    }
  }

  return (
    <>
      <section className="mt-8 border-t border-urgent/40 py-14 sm:py-16">
        <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-urgent">
          Danger Zone
        </p>
        <div className="mt-3 h-px w-full bg-urgent/40" aria-hidden />
        <p className="mt-6 max-w-lg text-sm font-light leading-relaxed text-leather">
          Permanently delete your account and all associated data. This cannot
          be undone.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-[6px] border border-urgent px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-urgent transition hover:bg-urgent hover:text-white"
        >
          Delete My Account
        </button>
      </section>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Close delete account confirmation"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="relative z-[1] max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[20px] bg-vanilla p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:rounded-[20px] sm:p-10"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={closeModal}
              disabled={loading}
              className="absolute right-5 top-5 text-xl font-light text-leather transition hover:text-urgent disabled:opacity-40"
            >
              ×
            </button>
            <h2
              id="delete-account-title"
              className="pr-8 font-serif text-2xl tracking-wide text-umber"
            >
              Delete Your Account
            </h2>
            <p className="mt-4 text-sm font-light leading-relaxed text-leather">
              This will permanently delete all your properties, certificates,
              tenancies, contractors and account data. This cannot be undone.
            </p>

            {error ? (
              <p
                role="alert"
                className="mt-4 border border-urgent/25 bg-urgent-light/50 px-4 py-3 text-sm text-urgent"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="min-h-11 rounded-[6px] border border-leather/40 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-leather transition hover:border-umber hover:text-umber disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void deleteAccount()}
                disabled={loading}
                className="min-h-11 rounded-[6px] bg-urgent px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white transition hover:bg-urgent/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Deleting…" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
