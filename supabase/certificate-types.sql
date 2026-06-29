-- Migration: new certificate types and property notes
-- Run this in the Supabase SQL Editor on existing Fretwell & Co databases

ALTER TYPE certificate_type ADD VALUE IF NOT EXISTS 'hmo_licence';
ALTER TYPE certificate_type ADD VALUE IF NOT EXISTS 'legionella_risk_assessment';
ALTER TYPE certificate_type ADD VALUE IF NOT EXISTS 'pat';
ALTER TYPE certificate_type ADD VALUE IF NOT EXISTS 'asbestos_survey';

ALTER TABLE properties ADD COLUMN IF NOT EXISTS notes TEXT;
