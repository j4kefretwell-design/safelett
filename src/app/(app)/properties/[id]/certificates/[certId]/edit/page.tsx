import { notFound } from "next/navigation";
import { AnimateIn } from "@/components/AnimateIn";
import CertificateForm from "@/components/CertificateForm";
import PageHeader from "@/components/layout/PageHeader";
import { formCardClassName } from "@/lib/ui";
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
    <>
      <AnimateIn>
        <PageHeader
          title="Edit Certificate"
          description={typedProperty.address}
          backHref={`/properties/${id}`}
          backLabel="Back to Property"
        />
      </AnimateIn>

      <AnimateIn delay={100}>
        <div className={`${formCardClassName} max-w-xl`}>
          <CertificateForm
            propertyId={id}
            certificate={typedCertificate}
          />
        </div>
      </AnimateIn>
    </>
  );
}
