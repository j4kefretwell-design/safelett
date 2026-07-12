import type { SupabaseClient } from "@supabase/supabase-js";

export const TENANCY_DOCUMENTS_BUCKET = "tenancy-documents";

export const ALLOWED_TENANCY_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
] as const;

export const ALLOWED_TENANCY_EXTENSIONS = [".pdf", ".jpg", ".jpeg"];

export const MAX_TENANCY_FILE_SIZE = 10 * 1024 * 1024;

export type TenancyDocumentField =
  | "agreement"
  | "deposit_cert"
  | "right_to_rent";

const FIELD_TO_COLUMN: Record<
  TenancyDocumentField,
  "agreement_path" | "deposit_cert_path" | "right_to_rent_path"
> = {
  agreement: "agreement_path",
  deposit_cert: "deposit_cert_path",
  right_to_rent: "right_to_rent_path",
};

export function validateTenancyFile(file: File): string | null {
  if (
    !ALLOWED_TENANCY_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_TENANCY_MIME_TYPES)[number]
    )
  ) {
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_TENANCY_EXTENSIONS.includes(extension)) {
      return "Please upload a PDF or JPEG file.";
    }
  }

  if (file.size > MAX_TENANCY_FILE_SIZE) {
    return "File must be 10 MB or smaller.";
  }

  return null;
}

export function buildTenancyDocumentPath(
  userId: string,
  tenancyId: string,
  field: TenancyDocumentField,
  fileName: string
): string {
  const extension =
    fileName.slice(fileName.lastIndexOf(".")).toLowerCase() || ".pdf";
  const safeExtension = ALLOWED_TENANCY_EXTENSIONS.includes(extension)
    ? extension
    : ".pdf";

  return `${userId}/${tenancyId}/${field}${safeExtension}`;
}

export function getTenancyDocumentColumn(field: TenancyDocumentField) {
  return FIELD_TO_COLUMN[field];
}

export async function getTenancyDocumentUrl(
  supabase: SupabaseClient,
  documentPath: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(TENANCY_DOCUMENTS_BUCKET)
    .createSignedUrl(documentPath, 3600);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}
