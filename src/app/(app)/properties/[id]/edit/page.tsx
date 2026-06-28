import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import PropertyForm from "@/components/PropertyForm";
import { formCardClassName } from "@/lib/ui";
import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/lib/types";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!property) {
    notFound();
  }

  const typedProperty = property as Property;

  return (
    <>
      <PageHeader
        title="Edit Property"
        description={typedProperty.address}
        backHref={`/properties/${id}`}
        backLabel="Back to Property"
      />

      <div className={`${formCardClassName} max-w-xl`}>
        <PropertyForm property={typedProperty} />
      </div>
    </>
  );
}
