-- Private Bibles infrastructure
-- Run in Supabase SQL editor.
--
-- Sets up access-controlled hosting for copyright-restricted Bible versions
-- (e.g. AFV — A Faithful Version). Public-domain versions (WEB/ASV/KJV) stay
-- on GitHub Pages; only restricted versions go through Supabase Storage.
--
-- Model:
--   1. bible_version_access table maps user_id → version_code (e.g. 'AFV')
--   2. Storage bucket 'bibles-private' is private (RLS-only access)
--   3. Storage SELECT policy: a user can download <version>-*.json[.gz]
--      only if they hold a grant for that version in bible_version_access
--
-- Adding new private versions later is just: INSERT a grant row and upload
-- the file with the matching filename prefix.

-- ─── 1. Access-grant table ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bible_version_access (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    version_code  text NOT NULL,                       -- 'AFV' (uppercase)
    granted_at    timestamptz NOT NULL DEFAULT now(),
    note          text,
    UNIQUE (user_id, version_code)
);

ALTER TABLE public.bible_version_access ENABLE ROW LEVEL SECURITY;

-- Users can read their own grants (so the client can know what to offer).
DROP POLICY IF EXISTS "read own version access" ON public.bible_version_access;
CREATE POLICY "read own version access" ON public.bible_version_access
    FOR SELECT USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies. Granting access is an admin action
-- performed via this SQL editor (service_role bypasses RLS).

-- ─── 2. Private storage bucket ────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('bibles-private', 'bibles-private', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Read policy: filename prefix (before first '-') is the lowercase version_code,
-- e.g. 'afv-bible-enhanced.json.gz' → 'afv'. A user must hold a matching grant
-- in bible_version_access to download.
DROP POLICY IF EXISTS "read private bibles via access grant" ON storage.objects;
CREATE POLICY "read private bibles via access grant" ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'bibles-private'
        AND EXISTS (
            SELECT 1
            FROM public.bible_version_access ba
            WHERE ba.user_id = auth.uid()
              AND lower(ba.version_code) = split_part(storage.objects.name, '-', 1)
        )
    );

-- ─── 3. Grant Dave access to AFV ──────────────────────────────────────────────

INSERT INTO public.bible_version_access (user_id, version_code, note)
SELECT id, 'AFV', 'Owner — copyright permission for personal use'
FROM auth.users
WHERE email = 'dwyborn@gmail.com'
ON CONFLICT (user_id, version_code) DO NOTHING;

-- Sanity check (should return 1 row):
SELECT u.email, ba.version_code, ba.granted_at
FROM public.bible_version_access ba
JOIN auth.users u ON u.id = ba.user_id
WHERE ba.version_code = 'AFV';
