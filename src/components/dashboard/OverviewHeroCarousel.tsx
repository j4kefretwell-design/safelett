"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type CarouselPanelStatus = "clear" | "attention" | "overdue" | "promo";

export type OverviewCarouselPanel = {
  id: string;
  href: string;
  label: string;
  labelColor?: "leather" | "study";
  status: CarouselPanelStatus;
  statusText: string;
  count?: number;
  description?: string;
  footer?: string;
};

type OverviewHeroCarouselProps = {
  panels: OverviewCarouselPanel[];
};

function wrapOffset(index: number, active: number, length: number) {
  let offset = index - active;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
}

function StatusIcon({ status }: { status: CarouselPanelStatus }) {
  if (status === "promo") return null;

  if (status === "clear") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        className="h-5 w-5 shrink-0 text-forest"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.5l2.5 2.5 5.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      className={`h-5 w-5 shrink-0 ${
        status === "overdue" ? "text-urgent" : "text-attention"
      }`}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" strokeLinecap="round" />
      <circle cx="12" cy="16" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

const statusTextClass: Record<CarouselPanelStatus, string> = {
  clear: "text-forest",
  attention: "text-attention",
  overdue: "text-urgent",
  promo: "text-[#3D2B1F]",
};

export default function OverviewHeroCarousel({
  panels,
}: OverviewHeroCarouselProps) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const length = panels.length;

  const go = useCallback(
    (delta: number) => {
      setActive((current) => (current + delta + length) % length);
    },
    [length]
  );

  const goTo = useCallback((index: number) => {
    setActive(index);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const arrowClass =
    "absolute top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/55 bg-transparent text-lg font-light leading-none text-cream/90 transition hover:border-cream hover:bg-cream/10 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50";

  return (
    <div
      className="absolute inset-x-0 top-1/2 z-[1] flex h-[82%] w-full -translate-y-1/2 items-center"
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current == null) return;
        const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
        const delta = endX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) < 40) return;
        go(delta < 0 ? 1 : -1);
      }}
    >
      <button
        type="button"
        aria-label="Previous panel"
        onClick={() => go(-1)}
        className={`${arrowClass} left-2 sm:left-4 lg:left-6`}
      >
        ‹
      </button>

      <div className="relative mx-auto h-full w-full max-w-[1400px] px-12 sm:px-16 lg:px-20">
        <div className="relative h-full w-full">
          {panels.map((panel, index) => {
            const offset = wrapOffset(index, active, length);
            const isCenter = offset === 0;
            const isLeft = offset === -1;
            const isRight = offset === 1;
            const visible = Math.abs(offset) <= 1;

            let slotClass =
              "left-1/2 w-[min(88%,420px)] -translate-x-1/2 -translate-y-1/2 scale-95 opacity-0 sm:w-[28%]";
            if (isCenter) {
              slotClass =
                "left-1/2 w-[min(92%,520px)] -translate-x-1/2 -translate-y-1/2 scale-100 opacity-100 sm:w-[50%]";
            } else if (isLeft) {
              slotClass =
                "left-[calc(25%-6px)] hidden w-[28%] -translate-x-full -translate-y-1/2 scale-[0.88] opacity-80 sm:block";
            } else if (isRight) {
              slotClass =
                "left-[calc(75%+6px)] hidden w-[28%] -translate-y-1/2 scale-[0.88] opacity-80 sm:block";
            }

            const labelClass =
              panel.labelColor === "study" ? "text-study" : "text-[#6B503C]";
            const heroSize = isCenter
              ? "text-3xl leading-tight sm:text-[2.75rem]"
              : "text-2xl leading-tight sm:text-3xl";

            const content = (
              <div className="relative z-[1] flex h-full flex-col justify-center">
                <p
                  className={`text-[10px] font-normal uppercase tracking-[0.28em] ${labelClass}`}
                >
                  {panel.label}
                </p>

                <div className="mt-5 flex items-start gap-3">
                  <StatusIcon status={panel.status} />
                  <div className="min-w-0">
                    <p
                      className={`font-serif tracking-wide ${heroSize} ${statusTextClass[panel.status]}`}
                    >
                      {panel.statusText}
                    </p>
                    {panel.count != null && panel.count > 0 ? (
                      <p className="mt-2 text-xl font-semibold tabular-nums text-[#6B503C] sm:text-2xl">
                        {panel.count}
                        <span className="ml-1.5 text-[11px] font-normal uppercase tracking-[0.18em]">
                          {panel.count === 1 ? "item" : "items"}
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>

                {panel.description ? (
                  <p className="mt-5 text-[13px] leading-relaxed text-[#6B503C]">
                    {panel.description}
                  </p>
                ) : null}
                {panel.footer ? (
                  <p className="mt-5 text-[13px] text-gold">{panel.footer}</p>
                ) : null}
              </div>
            );

            const cardClass = `absolute top-1/2 flex min-h-[190px] flex-col justify-center overflow-hidden rounded-[20px] border border-[#C4A35A] bg-[rgba(240,236,225,0.95)] p-8 shadow-[0_8px_28px_rgba(61,43,31,0.16),inset_0_1px_0_rgba(255,255,255,0.6)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:min-h-[210px] sm:p-9 ${slotClass} ${
              isCenter ? "z-20" : visible ? "z-10" : "z-0"
            } ${visible ? "" : "pointer-events-none invisible"}`;

            if (isCenter) {
              return (
                <Link
                  key={panel.id}
                  href={panel.href}
                  className={`${cardClass} cursor-pointer`}
                  aria-current="true"
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={panel.id}
                type="button"
                tabIndex={visible ? 0 : -1}
                aria-hidden={!visible}
                onClick={() => goTo(index)}
                className={`${cardClass} cursor-pointer text-left`}
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        aria-label="Next panel"
        onClick={() => go(1)}
        className={`${arrowClass} right-2 sm:right-4 lg:right-6`}
      >
        ›
      </button>
    </div>
  );
}
