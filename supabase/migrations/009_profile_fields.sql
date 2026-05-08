-- ============================================================
-- Editable profile fields exposed on the /account profile tab
--
-- Three new optional TEXT columns. Existing rows stay NULL until the
-- user saves their profile form for the first time. The /api/profile
-- PATCH endpoint validates timezone via Intl.DateTimeFormat (throws
-- on invalid IANA names), so the column itself stays free-form text.
--
-- Existing profiles columns we already expose in the form:
--   full_name → "Display name"
--   company   → "Studio"
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio      text,
  ADD COLUMN IF NOT EXISTS handle   text,
  ADD COLUMN IF NOT EXISTS timezone text;

-- Optional: case-insensitive uniqueness on handle so two users can't
-- share @mayareyes. Partial index ignores NULLs (handle is optional).
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_handle_lower
  ON public.profiles (lower(handle))
  WHERE handle IS NOT NULL;

-- ============================================================
-- Apply (manual): paste this file into Supabase SQL Editor and Run.
-- Verify after apply:
--   SELECT column_name FROM information_schema.columns
--    WHERE table_schema = 'public' AND table_name = 'profiles'
--      AND column_name IN ('bio','handle','timezone');
--   -- expect 3 rows
-- ============================================================
