-- PixRaise Admin Migration
-- Run in Supabase Dashboard → SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wilaya TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_position TEXT DEFAULT 'center center';
ALTER TABLE services ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT true;
ALTER TABLE digital_products ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT true;

-- Orders: ensure total_price column exists (may have been renamed from price)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price INTEGER;
UPDATE orders SET total_price = price WHERE total_price IS NULL;

CREATE TABLE IF NOT EXISTS platform_settings (
  key         TEXT        PRIMARY KEY,
  value       JSONB,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type  TEXT        NOT NULL,
  target_id    UUID        NOT NULL,
  reason       TEXT        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default platform settings
INSERT INTO platform_settings (key, value) VALUES
  ('maintenance_mode', 'false'::jsonb),
  ('featured_freelancers', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;
