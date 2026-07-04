import { notFound } from "next/navigation";
import EditorialFormShell from "@/components/layout/EditorialFormShell";
import PropertyForm from "@/components/PropertyForm";
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
    <EditorialFormShell
      title="EDIT PROPERTY"
      subtitle={typedProperty.address}
      backHref={`/properties/${id}`}
      backLabel="Back to Property"
    >
      <PropertyForm property={typedProperty} editorial />
    </EditorialFormShell>
  );
}
