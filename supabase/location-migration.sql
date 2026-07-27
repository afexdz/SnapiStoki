-- Add city/country columns to profiles
-- Run this in Supabase SQL editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS location_city TEXT,
  ADD COLUMN IF NOT EXISTS location_country TEXT;

-- Backfill from wilaya for existing rows
UPDATE public.profiles
SET
  location_city = wilaya,
  location_country = 'Algérie'
WHERE wilaya IS NOT NULL
  AND location_city IS NULL;
