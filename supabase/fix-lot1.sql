-- ============================================================
-- PixRaise — Fix Lot 1
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Idempotent: safe to re-run.
-- ============================================================


-- ─────────────────────────────────────────
-- ENSURE COLUMNS EXIST (admin-migration may already have added them)
-- ─────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wilaya         text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url      text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_position text DEFAULT 'center center';


-- ─────────────────────────────────────────
-- PART 1 — RESTORE PROFILE TRIGGER (safely)
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, wilaya)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.raw_user_meta_data->>'role' = 'seller'
         THEN 'seller'::user_role ELSE 'buyer'::user_role END,
    NEW.raw_user_meta_data->>'wilaya'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────
-- BACKFILL: existing users who have no profile row
-- ─────────────────────────────────────────

INSERT INTO public.profiles (id, full_name, role)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
       CASE WHEN u.raw_user_meta_data->>'role' = 'seller'
            THEN 'seller'::user_role
            ELSE 'buyer'::user_role END
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;


-- ─────────────────────────────────────────
-- SYNC role FROM metadata FOR EXISTING ROWS THAT DISAGREE
-- ─────────────────────────────────────────

UPDATE public.profiles p
SET role = CASE
             WHEN u.raw_user_meta_data->>'role' = 'seller' THEN 'seller'::user_role
             ELSE 'buyer'::user_role
           END
FROM auth.users u
WHERE p.id = u.id
  AND p.role IS DISTINCT FROM (
    CASE
      WHEN u.raw_user_meta_data->>'role' = 'seller' THEN 'seller'::user_role
      ELSE 'buyer'::user_role
    END
  );


-- ─────────────────────────────────────────
-- PART 3 — DATABASE-LEVEL SELLER-ONLY INSERT POLICIES
-- ─────────────────────────────────────────

-- Services
DROP POLICY IF EXISTS "services_insert_own"    ON public.services;
DROP POLICY IF EXISTS "services_insert_seller" ON public.services;

CREATE POLICY "services_insert_seller" ON public.services FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('seller', 'both')
    )
  );

-- Digital products
DROP POLICY IF EXISTS "products_insert_own"    ON public.digital_products;
DROP POLICY IF EXISTS "products_insert_seller" ON public.digital_products;

CREATE POLICY "products_insert_seller" ON public.digital_products FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('seller', 'both')
    )
  );


-- ─────────────────────────────────────────
-- PART 8 — COVERS BUCKET + SECURE POLICIES
-- ─────────────────────────────────────────

-- Ensure the covers bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop any existing (possibly permissive) covers policies
DROP POLICY IF EXISTS "covers_all"          ON storage.objects;
DROP POLICY IF EXISTS "covers_select"       ON storage.objects;
DROP POLICY IF EXISTS "covers_insert"       ON storage.objects;
DROP POLICY IF EXISTS "covers_update"       ON storage.objects;
DROP POLICY IF EXISTS "covers_delete"       ON storage.objects;
DROP POLICY IF EXISTS "covers_select_public" ON storage.objects;
DROP POLICY IF EXISTS "covers_insert_own"   ON storage.objects;
DROP POLICY IF EXISTS "covers_update_own"   ON storage.objects;
DROP POLICY IF EXISTS "covers_delete_own"   ON storage.objects;

-- New folder-based policies (upload path: {user_id}/cover-{timestamp}.jpg)
CREATE POLICY "covers_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "covers_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "covers_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "covers_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- ─────────────────────────────────────────
-- PART 8 — CLEANUP UNUSED BUCKETS
-- WARNING: verify each bucket is empty in Storage → {bucket} before running!
-- Uncomment and run manually after verifying they are empty.
-- ─────────────────────────────────────────

/*
-- Drop policies on the 'services' bucket (created by publishing-migration.sql)
DROP POLICY IF EXISTS "services_bucket_select" ON storage.objects;
DROP POLICY IF EXISTS "services_bucket_insert" ON storage.objects;
DROP POLICY IF EXISTS "services_bucket_delete" ON storage.objects;
DROP POLICY IF EXISTS "services_all"           ON storage.objects;

-- Drop policies on the 'products-previews' bucket
DROP POLICY IF EXISTS "products_previews_select" ON storage.objects;
DROP POLICY IF EXISTS "products_previews_insert" ON storage.objects;
DROP POLICY IF EXISTS "products_previews_delete" ON storage.objects;
DROP POLICY IF EXISTS "products_previews_all"    ON storage.objects;

-- Drop policies on the 'products-files' bucket
DROP POLICY IF EXISTS "products_files_insert" ON storage.objects;
DROP POLICY IF EXISTS "products_files_select" ON storage.objects;
DROP POLICY IF EXISTS "products_files_delete" ON storage.objects;
DROP POLICY IF EXISTS "products_files_auth"   ON storage.objects;

-- Delete all objects first (DANGER — irreversible!)
DELETE FROM storage.objects WHERE bucket_id = 'services';
DELETE FROM storage.objects WHERE bucket_id = 'products-previews';
DELETE FROM storage.objects WHERE bucket_id = 'products-files';

-- Then drop the buckets
DELETE FROM storage.buckets WHERE id IN ('services', 'products-previews', 'products-files');
*/


-- ─────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────
-- What this script does:
--   1. Adds missing columns (wilaya, cover_url, cover_position) to profiles if absent
--   2. Recreates handle_new_user trigger with EXCEPTION guard (can never block signup)
--   3. Backfills profiles for existing users who have none
--   4. Syncs profiles.role from user_metadata where they disagree
--   5. Replaces services + digital_products INSERT policies to require seller/both role
--   6. Creates covers bucket (idempotent) + folder-based RLS policies
--   7. Provides commented cleanup for 3 unused legacy buckets
--
-- MANUAL STEPS after running:
--   a) Storage → verify 'covers' bucket exists and is public
--   b) Verify 'service-images' bucket exists and is public (code uses it)
--   c) Verify 'digital-products' bucket exists and is private
--   d) Check Storage → Policies that the new covers_* policies are active
--   e) If 'services', 'products-previews', 'products-files' buckets are empty,
--      uncomment and run the cleanup block above
-- ─────────────────────────────────────────
