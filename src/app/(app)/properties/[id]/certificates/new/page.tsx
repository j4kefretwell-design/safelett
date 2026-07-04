import { notFound } from "next/navigation";
import CertificateForm from "@/components/CertificateForm";
import EditorialFormShell from "@/components/layout/EditorialFormShell";
import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/lib/types";

interface NewCertificatePageProps {
  params: Promise<{ id: string }>;
}

export default async function NewCertificatePage({
  params,
}: NewCertificatePageProps) {
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
      title="ADD CERTIFICATE"
      subtitle={typedProperty.address}
      backHref={`/properties/${id}`}
      backLabel="Back to Property"
    >
      <CertificateForm propertyId={id} editorial />
    </EditorialFormShell>
  );
}
