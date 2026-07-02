import { notFound } from "next/navigation";
import { AnimateIn } from "@/components/AnimateIn";
import CertificateForm from "@/components/CertificateForm";
import PageHeader from "@/components/layout/PageHeader";
import { formCardClassName } from "@/lib/ui";
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
    <>
      <AnimateIn>
        <PageHeader
          title="Add Certificate"
          description={typedProperty.address}
          backHref={`/properties/${id}`}
          backLabel="Back to Property"
        />
      </AnimateIn>

      <AnimateIn delay={100}>
        <div className={`${formCardClassName} max-w-xl`}>
          <CertificateForm propertyId={id} />
        </div>
      </AnimateIn>
    </>
  );
}
