import { notFound } from "next/navigation";
import PropertyDetailView from "@/components/property/PropertyDetailView";
import { getCertificateDocumentUrl } from "@/lib/certificate-documents";
import {
  buildContractorEmailDraft,
  resolveUserDisplayName,
} from "@/lib/contractor-email";
import type { Tenancy } from "@/lib/tenancy";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/user-profile";
import type {
  Certificate,
  Contractor,
  Property,
  PropertyContractorWithDetails,
} from "@/lib/types";

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { id } = await params;
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
    .eq("id", id)
    .single();

  if (!property) {
    notFound();
  }

  const typedProperty = property as Property;

  const [{ data: certificates }, { data: assignments }, { data: directoryContractors }] =
    await Promise.all([
      supabase
        .from("certificates")
        .select("*")
        .eq("property_id", id)
        .order("expiry_date", { ascending: true }),
      supabase
        .from("property_contractors")
        .select("*, contractors(*)")
        .eq("property_id", id)
        .order("certificate_type", { ascending: true }),
      supabase.from("contractors").select("*").order("name", { ascending: true }),
    ]);

  const certificateList = (certificates ?? []) as Certificate[];
  const assignmentList = (assignments ?? []) as PropertyContractorWithDetails[];

  const { data: linkedById } = await supabase
    .from("tenancies")
    .select("*")
    .eq("property_id", id)
    .order("end_date", { ascending: false });

  const { data: linkedByAddress } = await supabase
    .from("tenancies")
    .select("*")
    .is("property_id", null)
    .ilike("property_address", typedProperty.address)
    .order("end_date", { ascending: false });

  const tenancyMap = new Map<string, Tenancy>();
  for (const row of [...(linkedById ?? []), ...(linkedByAddress ?? [])]) {
    tenancyMap.set(row.id as string, row as Tenancy);
  }
  const propertyTenancies = Array.from(tenancyMap.values());

  const contractorsByType = new Map<string, Contractor>();
  for (const assignment of assignmentList) {
    if (assignment.contractors) {
      contractorsByType.set(assignment.certificate_type, assignment.contractors);
    }
  }

  const profile = await getUserProfile(supabase, user.id);
  const userName = resolveUserDisplayName(profile.full_name);

  const emailDraftsByCertId: Record<
    string,
    ReturnType<typeof buildContractorEmailDraft>
  > = {};

  for (const cert of certificateList) {
    const contractor = contractorsByType.get(cert.certificate_type);
    if (!contractor) continue;

    emailDraftsByCertId[cert.id] = buildContractorEmailDraft({
      contractorName: contractor.name,
      contractorEmail: contractor.email,
      certificateType: cert.certificate_type,
      propertyAddress: typedProperty.address,
      expiryDate: cert.expiry_date,
      userName,
    });
  }

  const certificatesWithDocuments = await Promise.all(
    certificateList.map(async (cert) => {
      const documentUrl = cert.document_path
        ? await getCertificateDocumentUrl(supabase, cert.document_path)
        : null;

      return {
        ...cert,
        documentUrl,
      };
    })
  );

  const documentPaths = certificateList
    .map((cert) => cert.document_path)
    .filter((path): path is string => Boolean(path));

  return (
    <PropertyDetailView
      property={typedProperty}
      certificates={certificatesWithDocuments}
      assignments={assignmentList}
      directoryContractors={directoryContractors ?? []}
      emailDraftsByCertId={emailDraftsByCertId}
      documentPaths={documentPaths}
      tenancies={propertyTenancies}
    />
  );
}
