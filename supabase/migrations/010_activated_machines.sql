-- ============================================================
-- 010_activated_machines.sql — 2026-05-08
--
-- Machine activation tracking for Listen Buddy plugin + Software Hub.
--
-- The Hub is the primary activation surface: users sign in, see "This Mac
-- · activated/not-activated · [Activate this Mac]" and click to register.
-- The website /profile page is the audit + revoke surface.
-- The plugin sends machine_id_hash with each usage event for audit trail.
--
-- machine_id_hash = sha256("zenphony:machine:v1:" + lowercase(hardware_uuid))
--   - Hub: system_profiler SPHardwareDataType -> "Hardware UUID"
--   - Plugin: JUCE SystemStats::getDeviceIdentifier (or equivalent ioreg call)
--
-- Tier -> machine limit:
--   free  = 1
--   basic = 1
--   pro   = 2
--   max   = 3
--
-- Soft-delete via revoked_at preserves audit trail. UNIQUE INDEX on
-- (user_id, machine_id_hash) WHERE revoked_at IS NULL means a revoked
-- machine can be re-activated later (creates a new active row).
-- ============================================================

-- 1. activated_machines table
CREATE TABLE IF NOT EXISTS public.activated_machines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  machine_id_hash TEXT NOT NULL,
  hostname        TEXT,
  app_version     TEXT,
  source          TEXT NOT NULL CHECK (source IN ('plugin', 'hub')),
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at      TIMESTAMPTZ
);

-- One active registration per (user, machine). Revoked rows can re-register.
CREATE UNIQUE INDEX IF NOT EXISTS idx_activated_machines_user_machine_active
  ON public.activated_machines (user_id, machine_id_hash)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_activated_machines_user_id
  ON public.activated_machines (user_id);

-- 2. usage_log gets a machine_id_hash column (nullable for backward compat)
ALTER TABLE public.usage_log
  ADD COLUMN IF NOT EXISTS machine_id_hash TEXT;

-- 3. RLS: enabled with no permissive policies. Access is via SECURITY DEFINER
-- RPCs (register/list/revoke) which bypass RLS. Direct table access goes
-- through the website API routes (service role, which bypasses RLS).
-- This mirrors the Better Auth migration 006 pattern.
ALTER TABLE public.activated_machines ENABLE ROW LEVEL SECURITY;

-- 4. register_machine_via_api_key RPC
--    Validates api_key, enforces tier limit, inserts active row.
--    Returns: { success, registered, already_active, machine_count, machine_limit, error? }
CREATE OR REPLACE FUNCTION public.register_machine_via_api_key(
  p_api_key         TEXT,
  p_machine_id_hash TEXT,
  p_hostname        TEXT DEFAULT NULL,
  p_app_version     TEXT DEFAULT NULL,
  p_source          TEXT DEFAULT 'hub'
)
RETURNS JSON AS $$
DECLARE
  v_user_id        TEXT;
  v_plan           TEXT;
  v_limit          INT;
  v_current_count  INT;
  v_existing_id    UUID;
BEGIN
  IF p_api_key IS NULL OR p_machine_id_hash IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'missing_required_param');
  END IF;

  SELECT id, COALESCE(subscription_plan, 'free') INTO v_user_id, v_plan
    FROM public.profiles WHERE api_key = p_api_key;

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'invalid_api_key');
  END IF;

  -- Herbert audit Guard 1 (Q2 race): serialize per-user. Two concurrent
  -- registrations from the same user on different machines could otherwise
  -- both pass the count check at limit-1 and both INSERT, exceeding limit
  -- by 1. The UNIQUE INDEX is keyed on (user, machine) so it doesn't catch
  -- this. FOR UPDATE on the profiles row drops kappa from ~5e-4 to ~5e-6.
  PERFORM 1 FROM public.profiles WHERE id = v_user_id FOR UPDATE;

  v_limit := CASE v_plan
    WHEN 'max'   THEN 3
    WHEN 'pro'   THEN 2
    WHEN 'basic' THEN 1
    WHEN 'free'  THEN 1
    ELSE 1
  END;

  -- Already-active check: bump last_seen_at + metadata, return existing slot.
  SELECT id INTO v_existing_id
    FROM public.activated_machines
   WHERE user_id = v_user_id
     AND machine_id_hash = p_machine_id_hash
     AND revoked_at IS NULL;

  IF v_existing_id IS NOT NULL THEN
    UPDATE public.activated_machines
       SET last_seen_at = NOW(),
           hostname     = COALESCE(p_hostname, hostname),
           app_version  = COALESCE(p_app_version, app_version)
     WHERE id = v_existing_id;

    SELECT COUNT(*) INTO v_current_count
      FROM public.activated_machines
     WHERE user_id = v_user_id AND revoked_at IS NULL;

    RETURN json_build_object(
      'success',         true,
      'registered',      true,
      'already_active',  true,
      'machine_count',   v_current_count,
      'machine_limit',   v_limit
    );
  END IF;

  -- Active count for this user
  SELECT COUNT(*) INTO v_current_count
    FROM public.activated_machines
   WHERE user_id = v_user_id AND revoked_at IS NULL;

  IF v_current_count >= v_limit THEN
    RETURN json_build_object(
      'success',       false,
      'registered',    false,
      'error',         'machine_limit_reached',
      'machine_count', v_current_count,
      'machine_limit', v_limit
    );
  END IF;

  -- Insert a new active row.
  INSERT INTO public.activated_machines (
    user_id, machine_id_hash, hostname, app_version, source,
    registered_at, last_seen_at, revoked_at
  ) VALUES (
    v_user_id, p_machine_id_hash, p_hostname, p_app_version,
    COALESCE(p_source, 'hub'), NOW(), NOW(), NULL
  );

  v_current_count := v_current_count + 1;

  RETURN json_build_object(
    'success',         true,
    'registered',      true,
    'already_active',  false,
    'machine_count',   v_current_count,
    'machine_limit',   v_limit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.register_machine_via_api_key(TEXT, TEXT, TEXT, TEXT, TEXT)
  TO anon, authenticated;

-- 5. list_machines_via_api_key RPC
--    Returns: { success, machines:[{id,machine_id_hash,hostname,app_version,source,registered_at,last_seen_at}], machine_limit }
CREATE OR REPLACE FUNCTION public.list_machines_via_api_key(p_api_key TEXT)
RETURNS JSON AS $$
DECLARE
  v_user_id  TEXT;
  v_plan     TEXT;
  v_limit    INT;
  v_machines JSON;
BEGIN
  IF p_api_key IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'missing_api_key');
  END IF;

  SELECT id, COALESCE(subscription_plan, 'free') INTO v_user_id, v_plan
    FROM public.profiles WHERE api_key = p_api_key;

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'invalid_api_key');
  END IF;

  v_limit := CASE v_plan
    WHEN 'max'   THEN 3
    WHEN 'pro'   THEN 2
    WHEN 'basic' THEN 1
    WHEN 'free'  THEN 1
    ELSE 1
  END;

  SELECT COALESCE(json_agg(row_to_json(m) ORDER BY m.last_seen_at DESC), '[]'::json) INTO v_machines
    FROM (
      SELECT id, machine_id_hash, hostname, app_version, source,
             registered_at, last_seen_at
        FROM public.activated_machines
       WHERE user_id = v_user_id AND revoked_at IS NULL
       ORDER BY last_seen_at DESC
    ) m;

  RETURN json_build_object(
    'success',       true,
    'machines',      v_machines,
    'machine_limit', v_limit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.list_machines_via_api_key(TEXT)
  TO anon, authenticated;

-- 6. revoke_machine_via_api_key RPC
CREATE OR REPLACE FUNCTION public.revoke_machine_via_api_key(
  p_api_key         TEXT,
  p_machine_id_hash TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id TEXT;
  v_count   INT;
BEGIN
  IF p_api_key IS NULL OR p_machine_id_hash IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'missing_required_param');
  END IF;

  SELECT id INTO v_user_id FROM public.profiles WHERE api_key = p_api_key;
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'invalid_api_key');
  END IF;

  UPDATE public.activated_machines
     SET revoked_at = NOW()
   WHERE user_id = v_user_id
     AND machine_id_hash = p_machine_id_hash
     AND revoked_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Herbert optional-improvement: audit symmetry with auto-revoke path.
  IF v_count > 0 THEN
    INSERT INTO public.billing_events (user_id, event_type, amount_cents, description)
    VALUES (v_user_id, 'machine_revoked', 0,
            'User revoked machine ' || substring(p_machine_id_hash from 1 for 12) || '...');
  END IF;

  RETURN json_build_object(
    'success', v_count > 0,
    'revoked', v_count > 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.revoke_machine_via_api_key(TEXT, TEXT)
  TO anon, authenticated;

-- 7. Comments
COMMENT ON TABLE public.activated_machines IS
  'Listen Buddy machine activations per user. Soft-delete via revoked_at. Tier limit enforced in register_machine_via_api_key. Hub is primary activation surface; website /profile is audit + revoke surface.';
COMMENT ON COLUMN public.activated_machines.machine_id_hash IS
  'SHA-256 hex of "zenphony:machine:v1:" + lowercase hardware UUID. Hub: system_profiler SPHardwareDataType. Plugin: JUCE SystemStats::getDeviceIdentifier. The "v1" namespace is product-line-specific to Listen Buddy machine slots; future Zenphony products MUST use a different version suffix (v2:, etc.) so a user''s slot count for one product cannot collide with another.';
COMMENT ON COLUMN public.usage_log.machine_id_hash IS
  'Optional machine fingerprint for audit. Nullable for backward compatibility with pre-2026-05-08 plugin versions.';
