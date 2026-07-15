-- Migration: 14-day free trial tracking
-- Run this in the Supabase SQL Editor on existing Fretwell & Co projects

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;

-- Existing accounts get a fresh 14-day trial when the paywall launches
UPDATE user_profiles
SET trial_started_at = now()
WHERE trial_started_at IS NULL;

ALTER TABLE user_profiles
  ALTER COLUMN trial_started_at SET DEFAULT now();

ALTER TABLE user_profiles
  ALTER COLUMN trial_started_at SET NOT NULL;
