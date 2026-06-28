import ImportForm from "@/components/ImportForm";
import PageHeader from "@/components/layout/PageHeader";

export default function ImportPropertiesPage() {
  return (
    <>
      <PageHeader
        title="Bulk Import"
        description="Download the CSV template, add your properties and certificates, then upload to import everything at once."
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      <div className="max-w-2xl">
        <ImportForm templateUrl="/api/import/template" />
      </div>
    </>
  );
}
