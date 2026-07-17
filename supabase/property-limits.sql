-- Enforce the Compliance-only 15-property allowance at the database boundary.
-- Run in the Supabase SQL Editor after subscriptions.sql.

CREATE OR REPLACE FUNCTION enforce_compliance_property_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan TEXT;
  v_count INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(
    hashtextextended(NEW.user_id::TEXT || ':properties', 0)
  );

  SELECT plan_name
    INTO v_plan
  FROM subscriptions
  WHERE user_id = NEW.user_id
    AND status IN ('active', 'trialing')
  LIMIT 1;

  IF v_plan = 'compliance' THEN
    SELECT count(*)
      INTO v_count
    FROM properties
    WHERE user_id = NEW.user_id;

    IF v_count >= 15 THEN
      RAISE EXCEPTION
        'PROPERTY_LIMIT: Upgrade to Professional for unlimited properties.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS compliance_property_limit_trigger ON properties;

CREATE TRIGGER compliance_property_limit_trigger
  BEFORE INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION enforce_compliance_property_limit();
