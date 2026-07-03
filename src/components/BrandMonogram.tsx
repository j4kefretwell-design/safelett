import Link from "next/link";

interface BrandMonogramProps {
  href?: string | null;
  onClick?: () => void;
  className?: string;
  size?: "sidebar" | "compact";
}

export default function BrandMonogram({
  href = "/dashboard",
  onClick,
  className = "",
  size = "sidebar",
}: BrandMonogramProps) {
  const isCompact = size === "compact";
  const emblemSize = isCompact ? "h-14 w-14" : "h-[72px] w-[72px]";
  const markSize = isCompact ? "text-lg" : "text-[1.35rem]";
  const ampSize = isCompact ? "text-sm" : "text-base";

  const content = (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div
        className={`relative flex ${emblemSize} items-center justify-center rounded-full border border-gold/60`}
      >
        <svg
          viewBox="0 0 72 72"
          className="absolute inset-0 h-full w-full text-gold/25"
          aria-hidden="true"
        >
          <circle
            cx="36"
            cy="36"
            r="34"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
          />
        </svg>
        <span
          className={`relative font-serif ${markSize} leading-none tracking-tight text-dusty-cream`}
        >
          F
          <span
            className={`${ampSize} mx-px align-baseline font-serif italic text-gold`}
          >
            &amp;
          </span>
          Co
        </span>
      </div>

      {!isCompact && (
        <p className="mt-6 text-[9px] font-normal uppercase tracking-[0.38em] text-dusty-cream/85">
          Fretwell &amp; Co
        </p>
      )}
    </div>
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
