-- Central contractors directory + property linking
-- Run in Supabase SQL Editor after contractors.sql (property_contractors)

-- ---------------------------------------------------------------------------
-- 1. Central contractors directory (one record per contractor per user)
-- ---------------------------------------------------------------------------

CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  certificate_types certificate_type[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (cardinality(certificate_types) > 0)
);

CREATE INDEX idx_contractors_user_id ON contractors(user_id);

ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contractors"
  ON contractors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contractors"
  ON contractors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contractors"
  ON contractors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contractors"
  ON contractors FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. Link property_contractors to central directory
-- ---------------------------------------------------------------------------

ALTER TABLE property_contractors
  ADD COLUMN IF NOT EXISTS contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE;

-- Migrate existing inline contractor rows into the directory (best-effort)
DO $$
DECLARE
  row RECORD;
  new_contractor_id UUID;
  owner_id UUID;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'property_contractors'
      AND column_name = 'name'
  ) THEN
    FOR row IN
      SELECT DISTINCT ON (p.user_id, pc.email, pc.certificate_type)
        pc.id AS assignment_id,
        p.user_id,
        pc.name,
        pc.company_name,
        pc.phone,
        pc.email,
        pc.certificate_type
      FROM property_contractors pc
      JOIN properties p ON p.id = pc.property_id
      WHERE pc.contractor_id IS NULL
      ORDER BY p.user_id, pc.email, pc.certificate_type, pc.created_at
    LOOP
      SELECT id INTO new_contractor_id
      FROM contractors
      WHERE user_id = row.user_id
        AND lower(email) = lower(row.email)
      LIMIT 1;

      IF new_contractor_id IS NULL THEN
        INSERT INTO contractors (
          user_id,
          name,
          company_name,
          phone,
          email,
          certificate_types
        )
        VALUES (
          row.user_id,
          row.name,
          row.company_name,
          row.phone,
          row.email,
          ARRAY[row.certificate_type]::certificate_type[]
        )
        RETURNING id INTO new_contractor_id;
      ELSE
        UPDATE contractors
        SET
          certificate_types = (
            SELECT ARRAY(
              SELECT DISTINCT unnest(
                certificate_types || ARRAY[row.certificate_type]::certificate_type[]
              )
            )
          ),
          updated_at = now()
        WHERE id = new_contractor_id;
      END IF;

      UPDATE property_contractors
      SET contractor_id = new_contractor_id
      WHERE id = row.assignment_id;
    END LOOP;

    ALTER TABLE property_contractors
      DROP COLUMN IF EXISTS name,
      DROP COLUMN IF EXISTS company_name,
      DROP COLUMN IF EXISTS phone,
      DROP COLUMN IF EXISTS email;
  END IF;
END $$;

-- Enforce linking for new installs / post-migration
ALTER TABLE property_contractors
  ALTER COLUMN contractor_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_property_contractors_contractor_id
  ON property_contractors(contractor_id);
