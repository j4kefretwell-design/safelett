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
  'right_to_rent'
);

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  property_type property_type NOT NULL,
  bedrooms INTEGER NOT NULL CHECK (bedrooms > 0),
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expiry_date >= issue_date)
);

CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_certificates_property_id ON certificates(property_id);

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
