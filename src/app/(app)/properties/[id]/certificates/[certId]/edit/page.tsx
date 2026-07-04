import { notFound } from "next/navigation";
import CertificateForm from "@/components/CertificateForm";
import EditorialFormShell from "@/components/layout/EditorialFormShell";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Property } from "@/lib/types";

interface EditCertificatePageProps {
  params: Promise<{ id: string; certId: string }>;
}

export default async function EditCertificatePage({
  params,
}: EditCertificatePageProps) {
  const { id, certId } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!property) {
    notFound();
  }

  const { data: certificate } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", certId)
    .eq("property_id", id)
    .single();

  if (!certificate) {
    notFound();
  }

  const typedProperty = property as Property;
  const typedCertificate = certificate as Certificate;

  return (
    <EditorialFormShell
      title="EDIT CERTIFICATE"
      subtitle={typedProperty.address}
      backHref={`/properties/${id}`}
      backLabel="Back to Property"
    >
      <CertificateForm
        propertyId={id}
        certificate={typedCertificate}
        editorial
      />
    </EditorialFormShell>
  );
}
