import Link from "next/link";

interface BrandWordmarkProps {
  href?: string;
  variant?: "sidebar" | "compact";
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

  const content = (
    <span
      className={`brand-wordmark relative inline-block ${isSidebar ? "px-1 py-2" : ""} ${className}`}
    >
      <span className="brand-wordmark-glow" aria-hidden="true" />
      <span
        className={`relative block font-serif font-medium leading-none tracking-tight ${
          isSidebar ? "text-[1.95rem]" : "text-xl"
        }`}
      >
        <span className="text-cream">Fretwell</span>
        <span
          className={`mx-[0.12em] font-serif italic text-gold ${
            isSidebar ? "text-[1.35em]" : "text-[1.25em]"
          }`}
        >
          &amp;
        </span>
        <span className="text-cream">Co</span>
      </span>
      {isSidebar && (
        <span className="brand-wordmark-rule mt-4 block" aria-hidden="true" />
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="block" onClick={onClick}>
        {content}
      </Link>
    );
  }

  return content;
}
