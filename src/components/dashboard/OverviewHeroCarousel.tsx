"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type CarouselPanelStatus =
  | "clear"
  | "attention"
  | "overdue"
  | "promo"
  | "empty";

export type OverviewCarouselModule =
  | "compliance"
  | "tenancy"
  | "actions"
  | "assistant";

export type OverviewCarouselActionChoice = {
  label: string;
  href: string;
};

export type OverviewCarouselPanel = {
  id: string;
  href: string;
  label: string;
  module: OverviewCarouselModule;
  status: CarouselPanelStatus;
  statusText: string;
  count?: number;
  metaText?: string;
  description?: string;
  footer?: string;
  ctaText?: string;
  ctaHref?: string;
  /** When both modules have urgent items — show a chooser instead of a single link */
  actionChoices?: OverviewCarouselActionChoice[];
};

type OverviewHeroCarouselProps = {
  panels: OverviewCarouselPanel[];
};

const MODULE_THEME: Record<
  OverviewCarouselModule,
  { labelClass: string; borderClass: string }
> = {
  compliance: {
    labelClass: "text-raspberry",
    borderClass: "border-t-raspberry",
  },
  tenancy: {
    labelClass: "text-navy",
    borderClass: "border-t-navy",
  },
  actions: {
    labelClass: "text-gold",
    borderClass: "border-t-gold",
  },
  assistant: {
    labelClass: "text-study",
    borderClass: "border-t-study",
  },
};

function wrapOffset(index: number, active: number, length: number) {
  let offset = index - active;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
}

function StatusIcon({
  status,
  large,
}: {
  status: CarouselPanelStatus;
  large: boolean;
}) {
  if (status === "promo" || status === "empty") return null;

  const size = large ? "h-14 w-14 sm:h-16 sm:w-16" : "h-10 w-10 sm:h-11 sm:w-11";

  if (status === "clear") {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className={`${size} shrink-0 text-forest`}
        aria-hidden
      >
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M15 24.5l6 6 12-13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={`${size} shrink-0 ${
        status === "overdue" ? "text-urgent" : "text-attention"
      }`}
      aria-hidden
    >
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M24 14v14"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <circle cx="24" cy="33" r="1.75" fill="currentColor" />
    </svg>
  );
}

const statusTextClass: Record<CarouselPanelStatus, string> = {
  clear: "text-forest",
  attention: "text-attention",
  overdue: "text-urgent",
  promo: "text-umber",
  empty: "text-umber",
};

function PanelBody({
  panel,
  isCenter,
}: {
  panel: OverviewCarouselPanel;
  isCenter: boolean;
}) {
  const theme = MODULE_THEME[panel.module];
  const isEmpty = panel.status === "empty";
  const isAssistant = panel.module === "assistant";
  const isActionsWithItems =
    panel.module === "actions" &&
    panel.status !== "clear" &&
    panel.status !== "empty" &&
    panel.count != null &&
    panel.count > 0;

  const statusSize = isCenter
    ? "text-[1.65rem] leading-tight sm:text-[2rem] md:text-[2.35rem]"
    : "text-xl leading-tight sm:text-2xl";

  const countSize = isCenter
    ? "text-[3.25rem] leading-none sm:text-[3.75rem] md:text-[4.25rem]"
    : "text-[2.25rem] leading-none sm:text-[2.75rem]";

  return (
    <div className="relative z-[1] flex h-full flex-col">
      <p
        className={`text-[10px] font-normal uppercase tracking-[0.28em] ${theme.labelClass}`}
      >
        {panel.label}
      </p>

      {isEmpty ? (
        <div className="mt-5 flex flex-1 flex-col justify-center sm:mt-6">
          <p className={`font-serif tracking-wide text-umber ${statusSize}`}>
            {panel.statusText}
          </p>
          {panel.description ? (
            <p className="mt-3 text-[13px] italic leading-relaxed text-leather">
              {panel.description}
            </p>
          ) : null}
          {panel.ctaText && panel.ctaHref ? (
            <p className="mt-4 text-[13px] text-gold sm:mt-5">{panel.ctaText}</p>
          ) : null}
        </div>
      ) : isAssistant ? (
        <div className="mt-5 flex flex-1 flex-col justify-center sm:mt-6">
          <p className={`font-serif tracking-wide text-umber ${statusSize}`}>
            {panel.statusText}
          </p>
          {panel.description ? (
            <p className="mt-4 text-[11px] font-normal uppercase tracking-[0.22em] text-leather">
              {panel.description}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col justify-center sm:mt-5">
          {isActionsWithItems ? (
            <p
              className={`font-serif tabular-nums ${countSize} ${
                panel.status === "overdue" ? "text-urgent" : "text-attention"
              }`}
              aria-hidden
            >
              {panel.count}
            </p>
          ) : (
            <StatusIcon status={panel.status} large={isCenter} />
          )}

          <p
            className={`mt-3 font-serif tracking-wide ${statusSize} ${
              isActionsWithItems ? "text-umber" : statusTextClass[panel.status]
            }`}
          >
            {panel.statusText}
          </p>

          {panel.metaText ? (
            <p className="mt-2.5 text-[12px] leading-relaxed text-leather sm:mt-3">
              {panel.metaText}
            </p>
          ) : null}

          {panel.description && panel.module !== "assistant" ? (
            <p className="mt-3 text-[13px] leading-relaxed text-leather">
              {panel.description}
            </p>
          ) : null}
          {panel.footer ? (
            <p className="mt-3 text-[13px] text-gold">{panel.footer}</p>
          ) : null}
        </div>
      )}

      <span
        className="pointer-events-none absolute bottom-0 right-0 text-lg font-light leading-none text-gold opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        aria-hidden
      >
        →
      </span>
    </div>
  );
}

export default function OverviewHeroCarousel({
  panels,
}: OverviewHeroCarouselProps) {
  const [active, setActive] = useState(0);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const length = panels.length;

  const go = useCallback(
    (delta: number) => {
      setActionsMenuOpen(false);
      setActive((current) => (current + delta + length) % length);
    },
    [length]
  );

  const goTo = useCallback((index: number) => {
    setActionsMenuOpen(false);
    setActive(index);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "Escape") setActionsMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    if (!actionsMenuOpen) return;
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!actionsMenuRef.current?.contains(event.target as Node)) {
        setActionsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [actionsMenuOpen]);

  const arrowClass =
    "absolute top-[42%] z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/55 bg-transparent text-lg font-light leading-none text-cream/90 transition hover:border-cream hover:bg-cream/10 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 md:top-1/2";

  const cardBaseClass =
    "group absolute top-1/2 flex min-h-[200px] flex-col overflow-hidden rounded-[20px] border border-[#C4A35A]/25 border-t-2 bg-[rgba(240,236,225,0.96)] p-6 shadow-[0_8px_28px_rgba(61,43,31,0.16),inset_0_1px_0_rgba(255,255,255,0.6)] transition-[box-shadow,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_18px_44px_rgba(61,43,31,0.26)] sm:min-h-[220px] sm:p-9";

  return (
    <div
      className="absolute inset-x-0 top-1/2 z-[1] flex h-[88%] w-full -translate-y-1/2 flex-col items-center justify-center md:h-[82%]"
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
      <div className="relative w-full flex-1">
        <button
          type="button"
          aria-label="Previous panel"
          onClick={() => go(-1)}
          className={`${arrowClass} left-2 sm:left-4 lg:left-6`}
        >
          ‹
        </button>

        <div className="relative mx-auto h-full w-full max-w-[1400px] px-4 sm:px-16 lg:px-20">
          <div className="relative h-full w-full">
            {panels.map((panel, index) => {
              const offset = wrapOffset(index, active, length);
              const isCenter = offset === 0;
              const isLeft = offset === -1;
              const isRight = offset === 1;
              const visible = Math.abs(offset) <= 1;
              const theme = MODULE_THEME[panel.module];

              let slotClass =
                "left-1/2 w-[min(100%,420px)] -translate-x-1/2 -translate-y-1/2 scale-95 opacity-0 md:w-[28%]";
              if (isCenter) {
                slotClass =
                  "left-1/2 w-[calc(100%-1.5rem)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 scale-100 opacity-100 md:w-[50%]";
              } else if (isLeft) {
                slotClass =
                  "left-[calc(25%-6px)] hidden w-[28%] -translate-x-full -translate-y-1/2 scale-[0.88] opacity-80 md:block";
              } else if (isRight) {
                slotClass =
                  "left-[calc(75%+6px)] hidden w-[28%] -translate-y-1/2 scale-[0.88] opacity-80 md:block";
              }

              const isEmpty = panel.status === "empty";
              const panelHref =
                isEmpty && panel.ctaHref ? panel.ctaHref : panel.href;
              const hasChoices =
                isCenter &&
                panel.actionChoices != null &&
                panel.actionChoices.length > 1;

              const cardClass = `${cardBaseClass} ${theme.borderClass} ${slotClass} ${
                isCenter ? "z-20" : visible ? "z-10" : "z-0"
              } ${visible ? "" : "pointer-events-none invisible"}`;

              if (isCenter && hasChoices) {
                return (
                  <div
                    key={panel.id}
                    ref={actionsMenuRef}
                    className={`${cardClass} cursor-pointer`}
                    aria-current="true"
                  >
                    <button
                      type="button"
                      onClick={() => setActionsMenuOpen((open) => !open)}
                      className="relative z-[1] flex h-full min-h-[inherit] w-full flex-col text-left"
                      aria-expanded={actionsMenuOpen}
                      aria-haspopup="menu"
                    >
                      <PanelBody panel={panel} isCenter={isCenter} />
                    </button>

                    {actionsMenuOpen ? (
                      <div
                        role="menu"
                        className="absolute bottom-4 left-4 right-4 z-30 border border-leather/20 bg-[#F0ECE1] py-1 shadow-[0_12px_32px_rgba(61,43,31,0.18)] sm:left-auto sm:right-6 sm:w-56"
                      >
                        {panel.actionChoices!.map((choice) => (
                          <Link
                            key={choice.href}
                            href={choice.href}
                            role="menuitem"
                            onClick={() => setActionsMenuOpen(false)}
                            className="flex min-h-11 items-center px-4 text-[12px] font-light text-umber transition hover:bg-white/60"
                          >
                            {choice.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              if (isCenter) {
                return (
                  <Link
                    key={panel.id}
                    href={panelHref}
                    className={`${cardClass} cursor-pointer`}
                    aria-current="true"
                  >
                    <PanelBody panel={panel} isCenter={isCenter} />
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
                  <PanelBody panel={panel} isCenter={isCenter} />
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

      <div
        className="relative z-20 flex items-center justify-center gap-2 pb-1 pt-3 md:hidden"
        role="tablist"
        aria-label="Carousel panels"
      >
        {panels.map((panel, index) => (
          <button
            key={panel.id}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`Show ${panel.label}`}
            onClick={() => goTo(index)}
            className={`h-2.5 w-2.5 rounded-full transition ${
              index === active ? "bg-cream" : "bg-cream/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
