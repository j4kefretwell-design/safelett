import { notFound } from "next/navigation";
import ContractorEmailDraftClient from "@/components/ContractorEmailDraftClient";
import {
  buildContractorEmailDraft,
  isCertificateEligibleForContractorEmail,
  resolveUserDisplayName,
} from "@/lib/contractor-email";
import { getDaysUntilExpiry } from "@/lib/compliance";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/user-profile";
import {
  CERTIFICATE_LABELS,
  type Certificate,
  type Property,
  type PropertyContractor,
} from "@/lib/types";

interface DraftEmailPageProps {
  params: Promise<{ id: string; certId: string }>;
}

export default async function DraftEmailPage({ params }: DraftEmailPageProps) {
  const { id: propertyId, certId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .single();

  if (!property) {
    notFound();
  }

  const typedProperty = property as Property;

  const { data: certificate } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", certId)
    .eq("property_id", propertyId)
    .single();

  if (!certificate) {
    notFound();
  }

  const typedCertificate = certificate as Certificate;
  const daysUntilExpiry = getDaysUntilExpiry(typedCertificate.expiry_date);

  if (!isCertificateEligibleForContractorEmail(daysUntilExpiry)) {
    notFound();
  }

  const { data: contractor } = await supabase
    .from("property_contractors")
    .select("*")
    .eq("property_id", propertyId)
    .eq("certificate_type", typedCertificate.certificate_type)
    .maybeSingle();

  if (!contractor) {
    notFound();
  }

  const typedContractor = contractor as PropertyContractor;
  const profile = await getUserProfile(supabase, user.id);
  const userName = resolveUserDisplayName(profile.full_name);

  const draft = buildContractorEmailDraft({
    contractorName: typedContractor.name,
    contractorEmail: typedContractor.email,
    certificateType: typedCertificate.certificate_type,
    propertyAddress: typedProperty.address,
    expiryDate: typedCertificate.expiry_date,
    userName,
  });

  return (
    <ContractorEmailDraftClient
      draft={draft}
      certificateLabel={CERTIFICATE_LABELS[typedCertificate.certificate_type]}
      propertyAddress={typedProperty.address}
      backHref={`/properties/${propertyId}`}
    />
  );
}
