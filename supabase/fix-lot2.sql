-- ============================================================
-- PixRaise — Fix Lot 2: Security Hardening (Audit C2, H1, H2, H3)
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Idempotent: safe to re-run.
-- ============================================================


-- ─────────────────────────────────────────
-- PART 1 — C1 SUPPLEMENT: Column-level privileges on messages
-- ─────────────────────────────────────────
-- This privilege change was already applied manually in production.
-- Included here so a recreated database is secure from scratch.
-- A column-level GRANT is a stronger control than a WITH CHECK policy:
-- RLS policies cannot restrict which *columns* are written, only which rows.
REVOKE UPDATE ON public.messages FROM authenticated;
GRANT  UPDATE (read_at) ON public.messages TO authenticated;


-- ─────────────────────────────────────────
-- PART 2 — C2: Enable RLS on reports and platform_settings
-- ─────────────────────────────────────────

ALTER TABLE public.reports           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- reports: reporters may insert and view their own reports.
-- The service role (admin client) bypasses RLS for full moderation access.
DROP POLICY IF EXISTS "reports_insert_auth" ON public.reports;
DROP POLICY IF EXISTS "reports_select_own"  ON public.reports;

CREATE POLICY "reports_insert_auth" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_select_own" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- platform_settings: authenticated users may read; all writes go through
-- the admin client (service role), which bypasses RLS.
DROP POLICY IF EXISTS "platform_settings_select_auth" ON public.platform_settings;

CREATE POLICY "platform_settings_select_auth" ON public.platform_settings
  FOR SELECT USING (auth.role() = 'authenticated');


-- ─────────────────────────────────────────
-- PART 3 — H1: Protect sensitive profile columns from self-modification
-- ─────────────────────────────────────────
-- is_verified, suspended  → admin-only columns; must never be set by a user.
-- rating, total_reviews   → computed by the rating trigger; must not be set
--                           by a direct authenticated update, but the trigger
--                           itself must be allowed to recompute them.
--
-- Detection logic:
--   • current_setting('role', true) = 'service_role'
--       → admin client; allow all columns (RETURN NEW immediately).
--   • pg_trigger_depth() > 1
--       → we are inside the rating trigger chain; allow rating/total_reviews
--         to be updated but still protect the admin-only fields.
--   • otherwise (direct authenticated update)
--       → restore all four protected columns to their old values.

CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF pg_trigger_depth() > 1 THEN
    NEW.is_verified   := OLD.is_verified;
    NEW.suspended     := OLD.suspended;
    RETURN NEW;
  END IF;

  NEW.is_verified   := OLD.is_verified;
  NEW.suspended     := OLD.suspended;
  NEW.rating        := OLD.rating;
  NEW.total_reviews := OLD.total_reviews;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();


-- ─────────────────────────────────────────
-- PART 4 — H2: Scope storage INSERT policies to the uploader's folder
-- ─────────────────────────────────────────
-- The UPDATE and DELETE policies for these buckets already check
-- (storage.foldername(name))[1] = auth.uid()::text. This part brings
-- INSERT into alignment so a user cannot upload into another user's folder.

-- avatars
DROP POLICY IF EXISTS "avatars_insert_auth" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_own"  ON storage.objects;
CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- service-images
DROP POLICY IF EXISTS "service_images_insert_auth" ON storage.objects;
DROP POLICY IF EXISTS "service_images_insert_own"  ON storage.objects;
CREATE POLICY "service_images_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'service-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- digital-products
DROP POLICY IF EXISTS "digital_products_insert_auth" ON storage.objects;
DROP POLICY IF EXISTS "digital_products_insert_own"  ON storage.objects;
CREATE POLICY "digital_products_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'digital-products'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- ─────────────────────────────────────────
-- PART 5 — H3: Restrict documents bucket SELECT to the file owner
-- ─────────────────────────────────────────
-- The documents bucket is private and stores KYC / identity files.
-- The previous policy granted SELECT to all authenticated users.

DROP POLICY IF EXISTS "documents_select_auth" ON storage.objects;
DROP POLICY IF EXISTS "documents_select_own"  ON storage.objects;
CREATE POLICY "documents_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- ─────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────
-- What this script does:
--   1. (C1 supplement) Restricts UPDATE on messages to read_at column only for
--      the authenticated role — already applied manually in production; included
--      here so a recreated database is protected.
--   2. (C2) Enables RLS on reports and platform_settings:
--        - reports      : insert + select scoped to the reporter; admin via service role.
--        - platform_settings : read by authenticated; writes by service role only.
--   3. (H1) BEFORE UPDATE trigger on profiles that prevents authenticated users
--      from modifying is_verified, suspended, rating, total_reviews.
--      - Service role (Pixo admin) may update all columns.
--      - The internal rating recomputation trigger (pg_trigger_depth > 1)
--        may update rating/total_reviews but not is_verified/suspended.
--      - Direct authenticated updates have all four columns silently restored.
--   4. (H2) Replaces the permissive INSERT policies on storage.objects for
--      avatars, service-images, and digital-products with folder-scoped
--      policies that enforce (foldername)[1] = auth.uid()::text.
--   5. (H3) Replaces the open documents SELECT policy with one that restricts
--      access to the document's own uploader.
-- ─────────────────────────────────────────
