export const CERTIFICATE_DOCUMENTS_BUCKET = "certificate-documents";

export const ALLOWED_CERTIFICATE_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
] as const;

export const ALLOWED_CERTIFICATE_EXTENSIONS = [".pdf", ".jpg", ".jpeg"];

export const MAX_CERTIFICATE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function validateCertificateFile(file: File): string | null {
  if (!ALLOWED_CERTIFICATE_MIME_TYPES.includes(file.type as (typeof ALLOWED_CERTIFICATE_MIME_TYPES)[number])) {
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_CERTIFICATE_EXTENSIONS.includes(extension)) {
      return "Please upload a PDF or JPEG file.";
    }
  }

  if (file.size > MAX_CERTIFICATE_FILE_SIZE) {
    return "File must be 10 MB or smaller.";
  }

  return null;
}

export function buildCertificateDocumentPath(
  userId: string,
  propertyId: string,
  certificateId: string,
  fileName: string
): string {
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase() || ".pdf";
  const safeExtension = ALLOWED_CERTIFICATE_EXTENSIONS.includes(extension)
    ? extension
    : ".pdf";

  return `${userId}/${propertyId}/${certificateId}/document${safeExtension}`;
}
