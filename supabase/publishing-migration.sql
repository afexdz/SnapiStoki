-- PixRaise Publishing Migration
-- Run in: Supabase Dashboard → SQL Editor

-- ── Services additions ─────────────────────────────────────────
ALTER TABLE services ADD COLUMN IF NOT EXISTS packages      JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS gallery       JSONB    DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS faq           JSONB    DEFAULT '[]';
ALTER TABLE services ADD COLUMN IF NOT EXISTS tags          TEXT[]   DEFAULT '{}';
ALTER TABLE services ADD COLUMN IF NOT EXISTS orders_count  INT      DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS avg_rating    NUMERIC(3,2) DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS reviews_count INT      DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS video_url     TEXT;

-- ── Digital products additions ─────────────────────────────────
ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS preview_urls   JSONB    DEFAULT '[]';
ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS license        TEXT     DEFAULT 'personnel';
ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS tags           TEXT[]   DEFAULT '{}';
ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS is_free        BOOLEAN  DEFAULT false;
ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS sales_count    INT      DEFAULT 0;
ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS avg_rating     NUMERIC(3,2) DEFAULT 0;
ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS reviews_count  INT      DEFAULT 0;
ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS format         TEXT;

-- ── Storage buckets ────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES
  ('services',          'services',          true),
  ('products-previews', 'products-previews', true),
  ('products-files',    'products-files',    false)
ON CONFLICT (id) DO NOTHING;

-- ── RLS: services bucket (public read, auth write) ─────────────
CREATE POLICY "services_bucket_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'services');

CREATE POLICY "services_bucket_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'services' AND auth.role() = 'authenticated');

CREATE POLICY "services_bucket_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'services' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── RLS: products-previews bucket (public read, auth write) ────
CREATE POLICY "products_previews_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products-previews');

CREATE POLICY "products_previews_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products-previews' AND auth.role() = 'authenticated');

CREATE POLICY "products_previews_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products-previews' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── RLS: products-files bucket (private — seller + paid buyers) ─
CREATE POLICY "products_files_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products-files' AND auth.role() = 'authenticated');

CREATE POLICY "products_files_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'products-files'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.orders o
        JOIN public.digital_products dp ON dp.id = o.product_id
        WHERE o.buyer_id = auth.uid()
          AND o.payment_status = 'paid'
          AND dp.file_url LIKE '%' || (storage.filename(name)) || '%'
      )
    )
  );

CREATE POLICY "products_files_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products-files' AND auth.uid()::text = (storage.foldername(name))[1]);
