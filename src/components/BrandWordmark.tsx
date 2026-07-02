import Link from "next/link";

interface BrandWordmarkProps {
  href?: string;
  variant?: "sidebar" | "compact" | "hero" | "footer" | "light";
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

  const textClass = isHero
    ? "text-[2rem] sm:text-[2.35rem]"
    : isSidebar
      ? "text-[1.85rem]"
      : isFooter
        ? "text-2xl"
        : "text-xl";

  const nameClass = isLight ? "text-text" : "text-dusty-cream";

  const content = (
    <span className={`brand-wordmark inline-block ${className}`}>
      <span
        className={`block font-serif font-normal leading-none tracking-[0.04em] ${textClass}`}
      >
        <span className={nameClass}>Fretwell</span>
        <span
          className={`mx-[0.1em] font-serif italic text-gold ${
            isHero ? "text-[1.3em]" : "text-[1.22em]"
          }`}
        >
          &amp;
        </span>
        <span className={nameClass}>Co</span>
      </span>
      {isSidebar && (
        <span className="brand-wordmark-rule mt-4 block w-full max-w-[140px]" aria-hidden="true" />
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
