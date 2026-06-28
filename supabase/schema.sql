-- SafeLett database schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

CREATE TYPE property_type AS ENUM ('standard_rental', 'hmo', 'student_let');

CREATE TYPE certificate_type AS ENUM (
  'gas_safety',
  'eicr',
  'epc',
  'fire_risk_assessment',
  'fire_alarm_test',
  'emergency_lighting_check',
  'fire_extinguisher_service',
  'deposit_protection',
  'right_to_rent',
  'hmo_licence',
  'legionella_risk_assessment',
  'pat',
  'asbestos_survey'
);

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  property_type property_type NOT NULL,
  bedrooms INTEGER NOT NULL CHECK (bedrooms > 0),
  notes TEXT,
  share_token UUID UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  certificate_type certificate_type NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  notes TEXT,
  document_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expiry_date >= issue_date)
);

CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_certificates_property_id ON certificates(property_id);

CREATE TABLE certificate_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  alert_days INTEGER NOT NULL CHECK (alert_days IN (7, 30, 60)),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (certificate_id, alert_days)
);

CREATE INDEX idx_certificate_alerts_certificate_id ON certificate_alerts(certificate_id);

ALTER TABLE certificate_alerts ENABLE ROW LEVEL SECURITY;

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  alert_at_60 BOOLEAN NOT NULL DEFAULT true,
  alert_at_30 BOOLEAN NOT NULL DEFAULT true,
  alert_at_7 BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view certificates for own properties"
  ON certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = certificates.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert certificates for own properties"
  ON certificates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = certificates.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update certificates for own properties"
  ON certificates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = certificates.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete certificates for own properties"
  ON certificates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = certificates.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- Certificate document storage (private bucket)
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
