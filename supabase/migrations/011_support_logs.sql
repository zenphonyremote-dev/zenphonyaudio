-- ============================================================
-- 011_support_logs.sql — 2026-05-10
--
-- Support log uploads from the Listen Buddy plugin.
--
-- The plugin maintains a rolling 48h JSONL log of activity (boot, analyze,
-- chat, brain events, cloud calls, errors) plus system info. When the user
-- clicks "Send Support Logs" in the account dropdown, the plugin gzips the
-- log, uploads it to R2 via /api/support/upload-log, and inserts a row here
-- pointing at the R2 object.
--
-- Admins review and download logs via /ZenMode/support. The R2 object is
-- private; admins get a 5-minute signed GET URL on click.
--
-- Plugin auth: api_key on profiles (same pattern as usage_log + activated_machines).
-- Admin auth: profiles.is_admin = true (same as other /api/admin/* routes).
-- ============================================================

-- 1. support_logs table
CREATE TABLE IF NOT EXISTS public.support_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  machine_id_hash TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- System snapshot at upload time
  plugin_version  TEXT,
  os_version      TEXT,
  hardware_model  TEXT,   -- e.g. "MacBook Pro (14-inch, M1 Pro, 2021)"
  ram_gb          INT,
  cpu_model       TEXT,   -- e.g. "Apple M1 Pro"
  cpu_cores       INT,
  eagle_state     TEXT,   -- 'on' | 'off' | 'failed_to_load' | 'unknown'
  host_app        TEXT,   -- 'Logic Pro' | 'Ableton Live' | 'Standalone' | etc.
  host_format     TEXT,   -- 'AU' | 'AUv3' | 'VST3' | 'Standalone'

  -- Log file
  log_size_bytes  BIGINT NOT NULL,
  log_path        TEXT NOT NULL,    -- R2 object key
  log_summary     JSONB,            -- counts: { analyze_count, chat_count, error_count, ... }

  -- Workflow
  status          TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded','reviewed','archived')),
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     TEXT,             -- profile id of admin who reviewed
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_support_logs_user_id     ON public.support_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_support_logs_created_at  ON public.support_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_logs_status      ON public.support_logs (status);

-- 2. RLS: enabled with no permissive policies. Access goes through:
--    - Plugin upload: /api/support/upload-log (service role insert after api_key auth)
--    - Admin list:    /api/admin/support/logs (service role read after admin check)
--    - Admin update:  same pattern, for marking reviewed/archived
ALTER TABLE public.support_logs ENABLE ROW LEVEL SECURITY;

-- 3. record_support_log_upload RPC — plugin -> backend insert
--    Validates api_key, inserts row, returns log id + object path.
--    Caller (API route) is responsible for uploading the gzipped log to R2
--    at log_path BEFORE inserting (so the row is never orphaned).
CREATE OR REPLACE FUNCTION public.record_support_log_upload(
  p_api_key         TEXT,
  p_machine_id_hash TEXT,
  p_log_path        TEXT,
  p_log_size_bytes  BIGINT,
  p_system_info     JSONB,
  p_log_summary     JSONB DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id TEXT;
  v_log_id  UUID;
BEGIN
  IF p_api_key IS NULL OR p_log_path IS NULL OR p_log_size_bytes IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'missing_required_param');
  END IF;

  SELECT id INTO v_user_id FROM public.profiles WHERE api_key = p_api_key;
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'invalid_api_key');
  END IF;

  INSERT INTO public.support_logs (
    user_id, machine_id_hash,
    plugin_version, os_version, hardware_model, ram_gb,
    cpu_model, cpu_cores, eagle_state, host_app, host_format,
    log_size_bytes, log_path, log_summary
  ) VALUES (
    v_user_id, p_machine_id_hash,
    p_system_info->>'plugin_version',
    p_system_info->>'os_version',
    p_system_info->>'hardware_model',
    NULLIF(p_system_info->>'ram_gb','')::INT,
    p_system_info->>'cpu_model',
    NULLIF(p_system_info->>'cpu_cores','')::INT,
    p_system_info->>'eagle_state',
    p_system_info->>'host_app',
    p_system_info->>'host_format',
    p_log_size_bytes, p_log_path, p_log_summary
  )
  RETURNING id INTO v_log_id;

  RETURN json_build_object(
    'success',  true,
    'log_id',   v_log_id,
    'log_path', p_log_path
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.record_support_log_upload(TEXT, TEXT, TEXT, BIGINT, JSONB, JSONB)
  TO anon, authenticated;

-- 4. Comments
COMMENT ON TABLE public.support_logs IS
  'Listen Buddy plugin support log uploads. Plugin writes JSONL of last 48h activity (boot, analyze, chat, brain events, cloud calls, errors) + system snapshot. User-triggered via "Send Support Logs" in account dropdown. Logs stored in R2; this table is the index/metadata. RLS enabled, access via service role only.';

COMMENT ON COLUMN public.support_logs.log_path IS
  'R2 object key in the support-logs bucket. Format: support-logs/{user_id}/{yyyymmdd-HHMMSS}-{uuid}.jsonl.gz';

COMMENT ON COLUMN public.support_logs.eagle_state IS
  'EAGLE speculative-decoding head state at upload time. on=loaded+firing, off=disabled, failed_to_load=asset missing, unknown=pre-Phase-1D plugin.';

COMMENT ON COLUMN public.support_logs.log_summary IS
  'Optional aggregate counts pulled from the log for quick triage without downloading the file. Shape: { analyze_count, chat_count, error_count, warning_count, total_minutes_active, ... }';
