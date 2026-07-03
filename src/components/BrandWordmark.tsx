import Link from "next/link";

interface BrandWordmarkProps {
  href?: string | null;
  variant?: "sidebar" | "compact" | "hero" | "footer" | "light" | "nav" | "card";
  onClick?: () => void;
  className?: string;
}

export default function BrandWordmark({
  href = "/dashboard",
  variant = "sidebar",
  onClick,
  className = "",
}: BrandWordmarkProps) {
  const isSidebar = variant === "sidebar";
  const isHero = variant === "hero";
  const isFooter = variant === "footer";
  const isLight = variant === "light";
  const isNav = variant === "nav";
  const isCard = variant === "card";

  const textClass = isNav
    ? "text-sm uppercase tracking-[0.22em]"
    : isCard
      ? "text-[1.65rem]"
      : isHero
      ? "text-[2rem] sm:text-[2.35rem]"
      : isSidebar
        ? "text-[2.45rem]"
        : isFooter
          ? "text-2xl"
          : "text-xl";

  const nameClass = isLight || isCard ? "text-text" : "text-dusty-cream";

  const content = (
    <span className={`brand-wordmark inline-block ${className}`}>
      <span
        className={`block font-serif font-normal leading-none ${
          isNav ? "tracking-[0.22em]" : "tracking-[0.04em]"
        } ${textClass}`}
      >
        <span className={nameClass}>Fretwell</span>
        <span
          className={`mx-[0.1em] font-serif italic text-gold ${
            isNav ? "text-[1.15em]" : isHero ? "text-[1.3em]" : "text-[1.25em]"
          }`}
        >
          &amp;
        </span>
        <span className={nameClass}>Co</span>
      </span>
      {isSidebar && (
        <span
          className="mt-6 block h-px w-full max-w-[180px] bg-gold/55"
          aria-hidden="true"
        />
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block" onClick={onClick}>
        {content}
      </Link>
    );
  }

  return content;
}
