import { AnimateIn } from "@/components/AnimateIn";
import PageHeader from "@/components/layout/PageHeader";
import PropertyForm from "@/components/PropertyForm";
import { formCardClassName } from "@/lib/ui";

export default function NewPropertyPage() {
  return (
    <>
      <AnimateIn>
        <PageHeader
          title="Add Property"
          description="Enter the details for a new property to track."
          backHref="/dashboard"
          backLabel="Back to Dashboard"
        />
      </AnimateIn>

      <AnimateIn delay={100}>
        <div className={`${formCardClassName} max-w-xl`}>
          <PropertyForm />
        </div>
      </AnimateIn>
    </>
  );
}
