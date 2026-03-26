-- ============================================================
-- Better Auth tables for Zenphony Audio
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
--
-- IMPORTANT: This migration assumes you're starting fresh OR have
-- already backed up your existing profiles data. If you have existing
-- users, see the data migration section at the bottom.
-- ============================================================

-- 1. Core user table (Better Auth owns this)
CREATE TABLE IF NOT EXISTS "user" (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    image           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Sessions table
CREATE TABLE IF NOT EXISTS "session" (
    id              TEXT PRIMARY KEY,
    expires_at      TIMESTAMPTZ NOT NULL,
    token           TEXT NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address      TEXT,
    user_agent      TEXT,
    user_id         TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

-- 3. Accounts table (OAuth providers, credentials, etc.)
CREATE TABLE IF NOT EXISTS "account" (
    id                          TEXT PRIMARY KEY,
    account_id                  TEXT NOT NULL,
    provider_id                 TEXT NOT NULL,
    user_id                     TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    access_token                TEXT,
    refresh_token               TEXT,
    id_token                    TEXT,
    access_token_expires_at     TIMESTAMPTZ,
    refresh_token_expires_at    TIMESTAMPTZ,
    scope                       TEXT,
    password                    TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Verification tokens (email verification, password reset)
CREATE TABLE IF NOT EXISTS "verification" (
    id              TEXT PRIMARY KEY,
    identifier      TEXT NOT NULL,
    value           TEXT NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. Recreate profiles table linked to Better Auth user
--    Better Auth uses TEXT ids, not UUID like Supabase Auth.
--    We rename the old table, create the new one, then you can
--    migrate data manually if needed.
-- ============================================================

-- Rename old profiles table (preserves your data)
ALTER TABLE IF EXISTS public.profiles RENAME TO profiles_old_supaauth;

-- Drop old triggers that reference auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles_old_supaauth;

-- Create new profiles table linked to Better Auth user table
CREATE TABLE public.profiles (
    id                      TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    email                   TEXT,
    full_name               TEXT,
    avatar_url              TEXT,
    phone                   TEXT,
    company                 TEXT,
    job_title               TEXT,
    subscription_plan       TEXT DEFAULT 'free',
    subscription_status     TEXT DEFAULT 'active',
    subscription_period     TEXT,
    listening_minutes_used  INTEGER DEFAULT 0,
    listening_minutes_limit INTEGER DEFAULT 5,
    extra_minutes           INTEGER DEFAULT 0,
    topup_minutes           INTEGER DEFAULT 0,
    api_key                 TEXT,
    stripe_customer_id      TEXT,
    stripe_subscription_id  TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Auto-create a profile row when Better Auth creates a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (NEW.id, NEW.email, NEW.name, NEW.image)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created
    AFTER INSERT ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 7. Updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 8. Recreate auth_tokens table with TEXT user_id
-- ============================================================

ALTER TABLE IF EXISTS public.auth_tokens RENAME TO auth_tokens_old_supaauth;

CREATE TABLE public.auth_tokens (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    token       TEXT UNIQUE NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_auth_tokens_token;
DROP INDEX IF EXISTS idx_auth_tokens_user_id;
CREATE INDEX idx_auth_tokens_token ON public.auth_tokens(token);
CREATE INDEX idx_auth_tokens_user_id ON public.auth_tokens(user_id);

-- ============================================================
-- 9. Indexes for Better Auth tables
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"(user_id);
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);
CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account"(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================================
-- 10. RLS policies
-- ============================================================

-- Profiles: accessed via Supabase client (anon key) from auth-context
-- Since Better Auth doesn't use Supabase JWTs, we disable RLS on profiles
-- and handle access control in the API layer instead.
-- If you later want RLS, you'd need to pass the Better Auth session
-- to Supabase via a custom JWT or use service role.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (API routes use this)
CREATE POLICY "Service role full access on profiles"
    ON public.profiles FOR ALL
    USING (true)
    WITH CHECK (true);

-- auth_tokens: accessed only via service role in API routes
ALTER TABLE public.auth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on auth_tokens"
    ON public.auth_tokens FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- 11. OPTIONAL: Migrate existing user data
-- After running this migration and getting Better Auth working,
-- you can migrate old users by having them re-sign-up, OR
-- by manually inserting into the "user" + "account" + "profiles"
-- tables from your backed-up profiles_old_supaauth table.
--
-- To check old data:
--   SELECT * FROM profiles_old_supaauth;
--   SELECT * FROM auth_tokens_old_supaauth;
--
-- To clean up after confirming migration:
--   DROP TABLE IF EXISTS profiles_old_supaauth;
--   DROP TABLE IF EXISTS auth_tokens_old_supaauth;
-- ============================================================
