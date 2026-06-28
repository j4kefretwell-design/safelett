-- Migration for existing SafeLett projects
-- Run this in the Supabase SQL Editor if you already ran schema.sql without document upload support

ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS document_path TEXT;

-- Certificate document storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificate-documents',
  'certificate-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload certificate documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certificate-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own certificate documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'certificate-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own certificate documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'certificate-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own certificate documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'certificate-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
