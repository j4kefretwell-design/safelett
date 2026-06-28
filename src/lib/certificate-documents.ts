import type { SupabaseClient } from "@supabase/supabase-js";
import { CERTIFICATE_DOCUMENTS_BUCKET } from "./storage";

export async function getCertificateDocumentUrl(
  supabase: SupabaseClient,
  documentPath: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(CERTIFICATE_DOCUMENTS_BUCKET)
    .createSignedUrl(documentPath, 60 * 60);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}
