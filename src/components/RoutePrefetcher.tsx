"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Prefetch common next hops without blocking render. */
export default function RoutePrefetcher({
  paths,
}: {
  paths: readonly string[];
}) {
  const router = useRouter();
  const key = paths.filter((path) => typeof path === "string").join("|");

  useEffect(() => {
    for (const path of paths) {
      if (typeof path === "string" && path.startsWith("/")) {
        router.prefetch(path);
      }
    }
    // paths identity may change; key is the stable content fingerprint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, key]);

  return null;
}
