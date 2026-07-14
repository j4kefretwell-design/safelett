import Link from "next/link";
import { pageBackLinkClassName } from "@/lib/ui";

interface PageBackLinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

export default function PageBackLink({
  href,
  children = "← Back",
  className = "",
}: PageBackLinkProps) {
  return (
    <Link href={href} className={`${pageBackLinkClassName} ${className}`.trim()}>
      {children}
    </Link>
  );
}
