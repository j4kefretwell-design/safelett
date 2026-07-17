"use client";

import { useEffect } from "react";
import { inlineCancelLinkClassName } from "@/lib/ui";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="assistant-composer-modal relative z-[1] w-[90%] max-w-md rounded-[20px] bg-dune p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:p-10"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onCancel}
          className="absolute right-5 top-5 text-xl font-light leading-none text-gold-readable transition hover:text-gold"
        >
          ×
        </button>

        <h2
          id="confirm-dialog-title"
          className="pr-8 font-serif text-2xl tracking-wide text-study"
        >
          {title}
        </h2>
        <p className="mt-4 text-sm font-light leading-relaxed text-cocoa">
          {message}
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-4">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex h-11 w-full items-center justify-center bg-study text-sm uppercase tracking-[0.12em] text-parchment-line transition hover:bg-olive disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={`${inlineCancelLinkClassName} text-center`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
