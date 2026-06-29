-- Property contractors: one contact per certificate type per property
-- Run in Supabase SQL Editor after schema.sql

CREATE TABLE property_contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  certificate_type certificate_type NOT NULL,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, certificate_type)
);

CREATE INDEX idx_property_contractors_property_id ON property_contractors(property_id);

ALTER TABLE property_contractors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contractors for own properties"
  ON property_contractors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_contractors.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert contractors for own properties"
  ON property_contractors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_contractors.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update contractors for own properties"
  ON property_contractors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_contractors.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete contractors for own properties"
  ON property_contractors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_contractors.property_id
      AND properties.user_id = auth.uid()
    )
  );
