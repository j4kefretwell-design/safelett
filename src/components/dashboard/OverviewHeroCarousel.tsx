"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type OverviewCarouselPanel = {
  id: string;
  href: string;
  label: string;
  value: string;
  detail: string;
  watermark: "burgundy" | "navy" | "gold" | "study";
};

type OverviewHeroCarouselProps = {
  panels: OverviewCarouselPanel[];
};

const WATERMARK: Record<OverviewCarouselPanel["watermark"], string> = {
  burgundy: "#33181C",
  navy: "#1B2A4A",
  gold: "#C4A35A",
  study: "#1C2B23",
};

function wrapOffset(index: number, active: number, length: number) {
  let offset = index - active;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
}

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

            const content = (
              <>
                <span
                  aria-hidden
                  className="absolute left-1/2 top-0 h-[2px] w-10 -translate-x-1/2 bg-[#C4A35A]"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-10 -right-10 h-44 w-44 rounded-full"
                  style={{
                    backgroundColor: WATERMARK[panel.watermark],
                    opacity: 0.06,
                  }}
                />
                <div className="relative z-[1]">
                  <p className="text-[10px] font-normal uppercase tracking-[0.28em] text-[#6B503C]">
                    {panel.label}
                  </p>
                  <p
                    className={`mt-6 font-serif tracking-wide text-[#3D2B1F] ${
                      isCenter ? "text-[3.5rem] leading-none" : "text-[2.5rem] leading-none"
                    }`}
                  >
                    {panel.value}
                  </p>
                  <p className="mt-5 text-[13px] italic text-[#6B503C]">
                    {panel.detail}
                  </p>
                </div>
              </>
            );

            const cardClass = `absolute top-1/2 flex min-h-[190px] flex-col justify-center overflow-hidden rounded-[20px] bg-[rgba(240,236,225,0.95)] p-8 shadow-[0_8px_28px_rgba(61,43,31,0.16),inset_0_1px_0_rgba(255,255,255,0.6)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:min-h-[210px] sm:p-9 ${slotClass} ${
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
