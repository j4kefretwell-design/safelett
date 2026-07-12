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

export type AppMode = "compliance" | "tenancy";

const STORAGE_KEY = "fretwell-app-mode";

interface AppModeContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  switchMode: (mode: AppMode) => void;
  isTransitioning: boolean;
}

const AppModeContext = createContext<AppModeContextValue | null>(null);

function modeFromPathname(pathname: string): AppMode | null {
  if (pathname.startsWith("/tenancy")) {
    return "tenancy";
  }

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/properties") ||
    pathname.startsWith("/contractors") ||
    pathname.startsWith("/news")
  ) {
    return "compliance";
  }

  return null;
}

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [storedMode, setStoredMode] = useState<AppMode>("compliance");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY) as AppMode | null;
    if (saved === "compliance" || saved === "tenancy") {
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

      setIsTransitioning(true);
      setMode(nextMode);

      window.setTimeout(() => {
        router.push(
          nextMode === "tenancy" ? "/tenancy/dashboard" : "/dashboard"
        );
        window.setTimeout(() => setIsTransitioning(false), 400);
      }, 50);
    },
    [mode, router, setMode]
  );

  const value = useMemo(
    () => ({ mode, setMode, switchMode, isTransitioning }),
    [mode, setMode, switchMode, isTransitioning]
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
