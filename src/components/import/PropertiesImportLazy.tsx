"use client";

import dynamic from "next/dynamic";
import { ImportSkeleton } from "@/components/loading/PageSkeletons";

const PropertiesImportClient = dynamic(
  () => import("@/components/import/PropertiesImportClient"),
  {
    loading: () => <ImportSkeleton />,
    ssr: false,
  }
);

export default function PropertiesImportLazy() {
  return <PropertiesImportClient />;
}
