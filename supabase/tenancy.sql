-- Tenancy module schema
-- Run in Supabase SQL Editor after schema.sql

CREATE TYPE tenancy_type AS ENUM (
  'assured_shorthold',
  'periodic',
  'fixed_term',
  'student_let',
  'hmo_room'
);

CREATE TYPE deposit_scheme AS ENUM (
  'dps',
  'mydeposits',
  'tds',
  'none'
);

CREATE TABLE tenancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_names TEXT NOT NULL,
  property_address TEXT NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  tenancy_type tenancy_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent NUMERIC(10, 2) NOT NULL CHECK (monthly_rent >= 0),
  rent_review_date DATE,
  deposit_amount NUMERIC(10, 2) CHECK (deposit_amount IS NULL OR deposit_amount >= 0),
  deposit_scheme deposit_scheme,
  deposit_reference TEXT,
  deposit_protection_date DATE,
  right_to_rent_checked BOOLEAN NOT NULL DEFAULT false,
  right_to_rent_expiry DATE,
  notes TEXT,
  agreement_path TEXT,
  deposit_cert_path TEXT,
  right_to_rent_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE INDEX idx_tenancies_user_id ON tenancies(user_id);
CREATE INDEX idx_tenancies_property_id ON tenancies(property_id);
CREATE INDEX idx_tenancies_end_date ON tenancies(end_date);

ALTER TABLE tenancies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenancies"
  ON tenancies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tenancies"
  ON tenancies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tenancies"
  ON tenancies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tenancies"
  ON tenancies FOR DELETE
  USING (auth.uid() = user_id);

CREATE TABLE tenancy_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id UUID NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (
    alert_type IN (
      'tenancy_end',
      'rent_review',
      'deposit_overdue',
      'right_to_rent'
    )
  ),
  alert_days INTEGER NOT NULL CHECK (alert_days IN (0, 7, 30, 60, 90)),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenancy_id, alert_type, alert_days)
);

CREATE INDEX idx_tenancy_alerts_tenancy_id ON tenancy_alerts(tenancy_id);

ALTER TABLE tenancy_alerts DISABLE ROW LEVEL SECURITY;

-- Storage bucket for tenancy documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('tenancy-documents', 'tenancy-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own tenancy documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tenancy-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own tenancy documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'tenancy-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own tenancy documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'tenancy-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own tenancy documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'tenancy-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
