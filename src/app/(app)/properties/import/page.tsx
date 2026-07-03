import { AnimateIn } from "@/components/AnimateIn";
import ImportForm from "@/components/ImportForm";
import PageHeader from "@/components/layout/PageHeader";

export default function ImportPropertiesPage() {
  return (
    <>
      <AnimateIn>
        <PageHeader
          title="Bulk Import"
          description="Import properties and certificates from a CSV file."
          backHref="/dashboard"
          backLabel="Back to Dashboard"
        />
      </AnimateIn>

      <AnimateIn delay={100}>
        <ImportForm templateUrl="/api/import/template" />
      </AnimateIn>
    </>
  );
}
