-- AI Assistant saved chats
-- Run in Supabase SQL Editor after schema.sql

CREATE TABLE IF NOT EXISTS assistant_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (
    kind IN ('ask', 'draft', 'compliance', 'tenancy', 'property')
  ),
  title TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistant_chats_user_id ON assistant_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_chats_updated_at ON assistant_chats(updated_at DESC);

ALTER TABLE assistant_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assistant chats"
  ON assistant_chats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assistant chats"
  ON assistant_chats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assistant chats"
  ON assistant_chats FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assistant chats"
  ON assistant_chats FOR DELETE
  USING (auth.uid() = user_id);
