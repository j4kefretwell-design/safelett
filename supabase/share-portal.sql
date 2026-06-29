-- Migration: landlord share portal tokens
-- Run this in the Supabase SQL Editor on existing Fretwell & Co databases

ALTER TABLE properties ADD COLUMN IF NOT EXISTS share_token UUID UNIQUE;

CREATE INDEX IF NOT EXISTS idx_properties_share_token ON properties(share_token);
