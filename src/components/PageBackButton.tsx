"use client";

import { useRouter } from "next/navigation";
import { pageBackLinkClassName } from "@/lib/ui";

export default function PageBackButton({
  className = "",
  children = "← Back",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={`${pageBackLinkClassName} text-left ${className}`.trim()}
    >
      {children}
    </button>
  );
}
