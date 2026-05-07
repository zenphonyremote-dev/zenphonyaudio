-- ============================================================
-- record_chat_usage RPC + chat_usage_log audit table + profiles columns
--
-- Mirrors the existing record_plugin_usage flow but for chat token
-- consumption from the Plugin Advisor (Qwen) chat path.
--
-- *** APPLIED-TO-PROD STATE NOTES (audited 2026-04-30) ***
--   - record_chat_usage function ALREADY EXISTS in production but errors
--     immediately because the chat_tokens_* columns it references were
--     never added to profiles. Stripe-webhook + plugin/profile/route.ts
--     also reference these columns and silently fail today.
--   - chat_usage_log table does NOT exist.
--   - This migration:
--       1. Adds the missing profiles columns (idempotent, IF NOT EXISTS).
--       2. Backfills sensible defaults — paid plans get -1 (unlimited),
--          free stays at the 50000 default.
--       3. Creates the chat_usage_log audit table.
--       4. CREATE OR REPLACE the RPC with a clean known-good implementation.
--
-- Frontend caller (plugins/.../WebUI/src/lib/supabase.js):
--   supabase.rpc('record_chat_usage', {
--     p_api_key, p_prompt_tokens, p_completion_tokens
--   })
--
-- Behavior:
--   - Looks up profile by api_key.
--   - If profile.chat_tokens_limit = -1 (unlimited paid plans), always allow.
--   - Otherwise, blocks when chat_tokens_used >= chat_tokens_limit.
--   - Atomically increments chat_tokens_used by (prompt + completion).
--   - Inserts an audit row in chat_usage_log.
--   - Returns JSON: { success, charged, remaining, total_used, limit, error? }
--
-- SECURITY DEFINER + GRANT to anon + authenticated so the WebUI can
-- call it with only the anon key (api_key auth happens inside the fn).
-- ============================================================

-- 0) Profiles columns the rest of the chat-tracking system expects.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS chat_tokens_used     integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS chat_tokens_limit    integer NOT NULL DEFAULT 50000,
  ADD COLUMN IF NOT EXISTS chat_tokens_reset_at timestamptz;

-- Backfill: paid plans get unlimited chat (-1), free stays at default 50000.
-- Stripe webhook already writes -1 on subscription creation, but existing
-- paid users predate this column.
UPDATE public.profiles
   SET chat_tokens_limit = -1
 WHERE subscription_plan IN ('basic', 'pro', 'max')
   AND chat_tokens_limit <> -1;

-- 1) Audit table for per-chat-event accounting
CREATE TABLE IF NOT EXISTS public.chat_usage_log (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt_tokens     integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens      integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_usage_log_user_id
  ON public.chat_usage_log (user_id);

CREATE INDEX IF NOT EXISTS idx_chat_usage_log_created_at
  ON public.chat_usage_log (created_at DESC);

ALTER TABLE public.chat_usage_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own chat usage" ON public.chat_usage_log;
CREATE POLICY "Users can read own chat usage"
  ON public.chat_usage_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2) RPC
CREATE OR REPLACE FUNCTION public.record_chat_usage(
  p_api_key            text,
  p_prompt_tokens      integer,
  p_completion_tokens  integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile     public.profiles%ROWTYPE;
  v_total       integer;
  v_new_used    integer;
  v_remaining   integer;
BEGIN
  -- Validate inputs
  IF p_api_key IS NULL OR length(p_api_key) = 0 THEN
    RETURN json_build_object('success', false, 'error', 'missing_api_key');
  END IF;

  v_total := COALESCE(p_prompt_tokens, 0) + COALESCE(p_completion_tokens, 0);
  IF v_total <= 0 THEN
    -- Nothing to charge; still surface the current state for the UI.
    SELECT * INTO v_profile FROM public.profiles WHERE api_key = p_api_key;
    IF NOT FOUND THEN
      RETURN json_build_object('success', false, 'error', 'invalid_api_key');
    END IF;
    RETURN json_build_object(
      'success',     true,
      'charged',     0,
      'total_used',  COALESCE(v_profile.chat_tokens_used, 0),
      'limit',       COALESCE(v_profile.chat_tokens_limit, 50000),
      'remaining',   CASE
                       WHEN v_profile.chat_tokens_limit = -1 THEN -1
                       ELSE GREATEST(0, COALESCE(v_profile.chat_tokens_limit, 50000) - COALESCE(v_profile.chat_tokens_used, 0))
                     END
    );
  END IF;

  -- Lookup + lock the row so concurrent chat events serialize.
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE api_key = p_api_key
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'invalid_api_key');
  END IF;

  -- chat_tokens_limit = -1 means unlimited (paid plans).
  IF v_profile.chat_tokens_limit IS NOT NULL
     AND v_profile.chat_tokens_limit <> -1
     AND COALESCE(v_profile.chat_tokens_used, 0) >= v_profile.chat_tokens_limit
  THEN
    RETURN json_build_object(
      'success',    false,
      'error',      'chat_limit_reached',
      'total_used', COALESCE(v_profile.chat_tokens_used, 0),
      'limit',      v_profile.chat_tokens_limit,
      'remaining',  0
    );
  END IF;

  -- Atomic increment
  v_new_used := COALESCE(v_profile.chat_tokens_used, 0) + v_total;

  UPDATE public.profiles
     SET chat_tokens_used = v_new_used,
         updated_at = now()
   WHERE id = v_profile.id;

  -- Audit row
  INSERT INTO public.chat_usage_log (
    user_id, prompt_tokens, completion_tokens, total_tokens
  ) VALUES (
    v_profile.id,
    COALESCE(p_prompt_tokens, 0),
    COALESCE(p_completion_tokens, 0),
    v_total
  );

  v_remaining := CASE
                   WHEN v_profile.chat_tokens_limit = -1 THEN -1
                   ELSE GREATEST(0, COALESCE(v_profile.chat_tokens_limit, 50000) - v_new_used)
                 END;

  RETURN json_build_object(
    'success',    true,
    'charged',    v_total,
    'total_used', v_new_used,
    'limit',      COALESCE(v_profile.chat_tokens_limit, 50000),
    'remaining',  v_remaining
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_chat_usage(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_chat_usage(text, integer, integer) TO anon, authenticated;

-- ============================================================
-- Apply (manual): paste this file into Supabase SQL Editor and Run.
-- Verify after apply:
--   SELECT proname FROM pg_proc WHERE proname = 'record_chat_usage';
--   -- expect 1 row
-- Smoke test (replace with a real api_key, prompt/completion=0 is a no-op probe):
--   SELECT public.record_chat_usage('lb_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 0, 0);
--   -- expect: { "success": true, "charged": 0, ... }
-- ============================================================
