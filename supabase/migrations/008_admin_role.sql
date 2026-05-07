-- ============================================================
-- Admin role on profiles + grant timothymiles113@gmail.com
--
-- Adds a boolean is_admin column with a partial index (only admin rows
-- are indexed, so the index stays tiny as the user table grows).
--
-- profiles.id is TEXT (Better Auth) per migration 006, not uuid.
--
-- Access control pattern:
--   The existing profiles RLS policy already restricts to service_role
--   (migration 006). All admin checks happen in the API layer
--   (app/api/admin/*) which reads the Better Auth session, looks up
--   the profile via service-role client, and gates on is_admin.
--   No new RLS policy is required.
-- ============================================================

-- 1) Column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2) Partial index — only admin rows are stored, so admin lookups are
-- bounded to the (small) admin set regardless of total user count.
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin
  ON public.profiles (id)
  WHERE is_admin = true;

-- 3) Grant the founding admin. Idempotent: re-running does nothing
-- once flipped. Email match is case-insensitive to survive Better Auth
-- normalization variations.
UPDATE public.profiles
   SET is_admin = true,
       updated_at = now()
 WHERE lower(email) = lower('timothymiles113@gmail.com')
   AND is_admin = false;

-- ============================================================
-- Apply (manual): paste this file into Supabase SQL Editor and Run.
--
-- Verify after apply:
--   SELECT email, is_admin FROM public.profiles WHERE is_admin = true;
--   -- expect at least one row with email timothymiles113@gmail.com
--
-- If the founding admin hasn't signed up yet, the UPDATE is a no-op.
-- After they sign up, re-run just step 3:
--   UPDATE public.profiles SET is_admin = true
--    WHERE lower(email) = lower('timothymiles113@gmail.com');
-- ============================================================
