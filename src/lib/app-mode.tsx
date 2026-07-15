"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  MODE_HOME,
  type AppMode,
} from "@/lib/app-mode-routes";

export type { AppMode };
export { MODE_HOME, MODE_PREFETCH_PATHS } from "@/lib/app-mode-routes";

const STORAGE_KEY = "fretwell-app-mode";

interface AppModeContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  switchMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextValue | null>(null);

function modeFromPathname(pathname: string): AppMode | null {
  if (pathname.startsWith("/assistant")) {
    return "assistant";
  }

  if (pathname.startsWith("/tenancy")) {
    return "tenancy";
  }

  if (
    pathname.startsWith("/compliance") ||
    pathname.startsWith("/properties") ||
    pathname.startsWith("/contractors") ||
    pathname.startsWith("/news")
  ) {
    return "compliance";
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return "overview";
  }

  return null;
}

function isValidMode(value: string | null): value is AppMode {
  return (
    value === "overview" ||
    value === "compliance" ||
    value === "tenancy" ||
    value === "assistant"
  );
}

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [storedMode, setStoredMode] = useState<AppMode>("overview");

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (isValidMode(saved)) {
      setStoredMode(saved);
    }
  }, []);

  const pathnameMode = modeFromPathname(pathname);
  const mode = pathnameMode ?? storedMode;

  useEffect(() => {
    if (pathnameMode) {
      setStoredMode(pathnameMode);
      sessionStorage.setItem(STORAGE_KEY, pathnameMode);
    }
  }, [pathnameMode]);

  const setMode = useCallback((nextMode: AppMode) => {
    setStoredMode(nextMode);
    sessionStorage.setItem(STORAGE_KEY, nextMode);
  }, []);

  const switchMode = useCallback(
    (nextMode: AppMode) => {
      if (nextMode === mode) return;
      setMode(nextMode);
      router.push(MODE_HOME[nextMode]);
    },
    [mode, router, setMode]
  );

  const value = useMemo(
    () => ({ mode, setMode, switchMode }),
    [mode, setMode, switchMode]
  );

  return (
    <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error("useAppMode must be used within AppModeProvider");
  }
  return context;
}
