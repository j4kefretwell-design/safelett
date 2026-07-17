"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export type ToastVariant = "success" | "error" | "delete";

export type ToastInput = {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onUndo?: () => void | Promise<void>;
};

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  onUndo?: () => void | Promise<void>;
};

type ToastContextValue = {
  toast: (input: ToastInput | string) => string;
  success: (message: string) => string;
  error: (message?: string) => string;
  deleted: (message: string, onUndo?: () => void | Promise<void>) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_ERROR = "Something went wrong. Please try again.";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput | string) => {
      const payload = typeof input === "string" ? { message: input } : input;
      const id = crypto.randomUUID();
      const variant = payload.variant ?? "success";
      const duration =
        payload.duration ?? (variant === "delete" ? 5000 : 3000);

      setItems((current) => [
        ...current,
        {
          id,
          message: payload.message,
          variant,
          duration,
          onUndo: payload.onUndo,
        },
      ]);

      const timer = window.setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (message) => toast({ message, variant: "success" }),
      error: (message = DEFAULT_ERROR) =>
        toast({ message, variant: "error" }),
      deleted: (message, onUndo) =>
        toast({
          message,
          variant: "delete",
          duration: 5000,
          onUndo,
        }),
      dismiss,
    }),
    [toast, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-[min(92vw,22rem)] flex-col gap-3"
        aria-live="polite"
        aria-relevant="additions"
      >
        {items.map((item) => {
          const border =
            item.variant === "error"
              ? "border-l-urgent"
              : item.variant === "delete"
                ? "border-l-urgent"
                : "border-l-gold";

          return (
            <div
              key={item.id}
              className={`toast-slide-in pointer-events-auto flex items-start gap-3 border border-taupe border-l-[3px] ${border} bg-vanilla px-4 py-3.5 shadow-[0_12px_32px_rgba(68,58,53,0.16)]`}
              role="status"
            >
              {item.variant === "success" ? (
                <span className="mt-0.5 text-sm text-gold" aria-hidden>
                  ✓
                </span>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-umber">{item.message}</p>
                {item.variant === "delete" && item.onUndo ? (
                  <button
                    type="button"
                    className="mt-2 text-sm font-light text-gold-readable transition hover:text-gold"
                    onClick={() => {
                      void item.onUndo?.();
                      dismiss(item.id);
                    }}
                  >
                    Undo
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismiss(item.id)}
                className="text-base leading-none text-taupe transition hover:text-umber"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
