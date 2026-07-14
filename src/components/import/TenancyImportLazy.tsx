"use client";

import dynamic from "next/dynamic";
import { ImportSkeleton } from "@/components/loading/PageSkeletons";

const TenancyImportClient = dynamic(
  () => import("@/components/import/TenancyImportClient"),
  {
    loading: () => <ImportSkeleton />,
    ssr: false,
  }
);

export default function TenancyImportLazy() {
  return <TenancyImportClient />;
}
