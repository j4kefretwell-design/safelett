-- Server-enforced feature usage limits.
-- Run in the Supabase SQL Editor after subscriptions.sql.

CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL CHECK (
    feature IN ('assistant_question', 'document_draft', 'annual_report')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feature_usage_user_feature_created_idx
  ON feature_usage (user_id, feature, created_at DESC);

ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own feature usage" ON feature_usage;

CREATE POLICY "Users can view own feature usage"
  ON feature_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION consume_feature_usage(p_feature TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_plan TEXT;
  v_is_professional BOOLEAN := FALSE;
  v_day_start TIMESTAMPTZ :=
    (date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC');
  v_month_start TIMESTAMPTZ :=
    (date_trunc('month', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC');
  v_daily_ai_count INTEGER := 0;
  v_daily_document_count INTEGER := 0;
  v_monthly_report_count INTEGER := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_feature NOT IN ('assistant_question', 'document_draft', 'annual_report') THEN
    RAISE EXCEPTION 'Unknown feature';
  END IF;

  SELECT plan_name
    INTO v_plan
  FROM subscriptions
  WHERE user_id = v_user_id
    AND status IN ('active', 'trialing')
  LIMIT 1;

  v_is_professional := v_plan = 'professional';

  PERFORM pg_advisory_xact_lock(
    hashtextextended(
      v_user_id::TEXT || ':' ||
      CASE
        WHEN p_feature IN ('assistant_question', 'document_draft') THEN 'ai'
        ELSE p_feature
      END,
      0
    )
  );

  IF NOT v_is_professional AND p_feature IN ('assistant_question', 'document_draft') THEN
    SELECT count(*)
      INTO v_daily_ai_count
    FROM feature_usage
    WHERE user_id = v_user_id
      AND feature IN ('assistant_question', 'document_draft')
      AND created_at >= v_day_start;

    IF p_feature = 'document_draft' THEN
      SELECT count(*)
        INTO v_daily_document_count
      FROM feature_usage
      WHERE user_id = v_user_id
        AND feature = 'document_draft'
        AND created_at >= v_day_start;

      IF v_daily_document_count >= 3 THEN
        RETURN jsonb_build_object(
          'allowed', FALSE,
          'code', 'DOCUMENT_DAILY_LIMIT',
          'remaining', 0
        );
      END IF;
    END IF;

    IF v_daily_ai_count >= 6 THEN
      RETURN jsonb_build_object(
        'allowed', FALSE,
        'code', 'AI_DAILY_LIMIT',
        'remaining', 0
      );
    END IF;
  END IF;

  IF NOT v_is_professional AND v_plan = 'compliance' AND p_feature = 'annual_report' THEN
    SELECT count(*)
      INTO v_monthly_report_count
    FROM feature_usage
    WHERE user_id = v_user_id
      AND feature = 'annual_report'
      AND created_at >= v_month_start;

    IF v_monthly_report_count >= 1 THEN
      RETURN jsonb_build_object(
        'allowed', FALSE,
        'code', 'REPORT_MONTHLY_LIMIT',
        'remaining', 0
      );
    END IF;
  END IF;

  INSERT INTO feature_usage (user_id, feature)
  VALUES (v_user_id, p_feature);

  RETURN jsonb_build_object(
    'allowed', TRUE,
    'professional', v_is_professional,
    'daily_used',
      CASE
        WHEN v_is_professional OR p_feature = 'annual_report' THEN NULL
        ELSE v_daily_ai_count + 1
      END,
    'daily_remaining',
      CASE
        WHEN v_is_professional OR p_feature = 'annual_report' THEN NULL
        ELSE GREATEST(0, 5 - v_daily_ai_count)
      END,
    'remaining',
      CASE
        WHEN v_is_professional THEN NULL
        WHEN p_feature = 'document_draft' THEN
          LEAST(2 - v_daily_document_count, 5 - v_daily_ai_count)
        WHEN p_feature = 'assistant_question' THEN 5 - v_daily_ai_count
        WHEN p_feature = 'annual_report' AND v_plan = 'compliance' THEN
          0
        ELSE NULL
      END
  );
END;
$$;

REVOKE ALL ON FUNCTION consume_feature_usage(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION consume_feature_usage(TEXT) TO authenticated;
