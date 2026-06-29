-- Migration for email alerts
-- Run this in the Supabase SQL Editor if you already have an existing Fretwell & Co database

CREATE TABLE IF NOT EXISTS certificate_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  alert_days INTEGER NOT NULL CHECK (alert_days IN (7, 30, 60)),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (certificate_id, alert_days)
);

CREATE INDEX IF NOT EXISTS idx_certificate_alerts_certificate_id
  ON certificate_alerts(certificate_id);

-- Internal deduplication table; only accessed by the service role via /api/send-alerts.
ALTER TABLE certificate_alerts DISABLE ROW LEVEL SECURITY;
