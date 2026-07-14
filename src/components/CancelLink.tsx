import Link from "next/link";
import { editorialFormCancelClassName } from "@/lib/ui";

interface CancelLinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

export default function CancelLink({
  href,
  children = "Cancel",
  className = "",
}: CancelLinkProps) {
  return (
    <Link
      href={href}
      className={`${editorialFormCancelClassName} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
