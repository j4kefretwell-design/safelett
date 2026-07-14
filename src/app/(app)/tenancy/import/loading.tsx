import { ImportSkeleton } from "@/components/loading/PageSkeletons";

export default function TenancyImportLoading() {
  return (
    <div className="tenancy-slate-bg min-h-[calc(100vh-4rem)]">
      <ImportSkeleton />
    </div>
  );
}
