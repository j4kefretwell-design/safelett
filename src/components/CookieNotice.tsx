"use client";

import { useEffect, useState } from "react";

const COOKIE_NOTICE_KEY = "fretwell-cookie-notice-accepted";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = window.localStorage.getItem(COOKIE_NOTICE_KEY);
      if (!accepted) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    try {
      window.localStorage.setItem(COOKIE_NOTICE_KEY, "true");
    } catch {
      // Still dismiss for this session if storage is unavailable
    }
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-gold/40 bg-umber px-4 py-3 sm:px-6"
      role="dialog"
      aria-label="Cookie notice"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-xs leading-relaxed text-vanilla/85 sm:text-sm">
          We use essential cookies to keep you logged in. By continuing to use
          Fretwell &amp; Co you accept this.
        </p>
        <button
          type="button"
          onClick={handleAccept}
          className="shrink-0 border border-gold bg-transparent px-4 py-1.5 text-[11px] font-normal uppercase tracking-[0.12em] text-gold transition hover:bg-gold/10"
        >
          OK
        </button>
      </div>
    </div>
  );
}
