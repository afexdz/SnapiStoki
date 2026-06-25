-- ============================================================
-- PixRaise — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================


-- ─────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────

CREATE TYPE user_role       AS ENUM ('buyer', 'seller', 'both');
CREATE TYPE account_type    AS ENUM ('freelance', 'digital', 'both');
CREATE TYPE order_type_enum AS ENUM ('service', 'product');
CREATE TYPE order_status    AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE payment_status  AS ENUM ('pending', 'paid', 'refunded');


-- ─────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────

-- 1. PROFILES (extends auth.users)
CREATE TABLE public.profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     text,
  username      text        UNIQUE,
  avatar_url    text,
  bio           text,
  role          user_role   NOT NULL DEFAULT 'buyer',
  account_type  account_type         DEFAULT 'freelance',
  location      text,
  phone         text,
  is_verified   boolean     NOT NULL DEFAULT false,
  rating        decimal(3,2)         DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_reviews integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 2. SERVICES (freelance offers)
CREATE TABLE public.services (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         text        NOT NULL,
  description   text,
  category      text        NOT NULL,
  price         integer     NOT NULL CHECK (price > 0),   -- in DA
  delivery_days integer     NOT NULL CHECK (delivery_days > 0),
  images        text[]               DEFAULT '{}',
  is_active     boolean     NOT NULL DEFAULT true,
  rating        decimal(3,2)         DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_orders  integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 3. DIGITAL PRODUCTS
CREATE TABLE public.digital_products (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title          text        NOT NULL,
  description    text,
  category       text        NOT NULL,
  price          integer     NOT NULL CHECK (price > 0),   -- in DA
  file_url       text,
  preview_images text[]               DEFAULT '{}',
  file_format    text,
  file_size      text,
  downloads      integer     NOT NULL DEFAULT 0,
  is_active      boolean     NOT NULL DEFAULT true,
  rating         decimal(3,2)         DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- 4. ORDERS
CREATE TABLE public.orders (
  id             uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id       uuid           NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  seller_id      uuid           NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  service_id     uuid           REFERENCES public.services(id) ON DELETE SET NULL,
  product_id     uuid           REFERENCES public.digital_products(id) ON DELETE SET NULL,
  order_type     order_type_enum NOT NULL,
  status         order_status   NOT NULL DEFAULT 'pending',
  price          integer        NOT NULL CHECK (price > 0),
  payment_status payment_status NOT NULL DEFAULT 'pending',
  created_at     timestamptz    NOT NULL DEFAULT now(),
  -- Enforce that the item matches the order type
  CONSTRAINT order_has_item CHECK (
    (order_type = 'service' AND service_id IS NOT NULL) OR
    (order_type = 'product' AND product_id IS NOT NULL)
  ),
  -- Buyer and seller must be different
  CONSTRAINT buyer_not_seller CHECK (buyer_id <> seller_id)
);

-- 5. REVIEWS
CREATE TABLE public.reviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reviewer_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      integer     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- One review per order per reviewer
  UNIQUE (order_id, reviewer_id)
);

-- 6. MESSAGES
CREATE TABLE public.messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id    uuid        REFERENCES public.orders(id) ON DELETE SET NULL,
  content     text        NOT NULL,
  is_read     boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT not_self_message CHECK (sender_id <> receiver_id)
);


-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────

-- Profiles
CREATE INDEX idx_profiles_username      ON public.profiles(username);
CREATE INDEX idx_profiles_role          ON public.profiles(role);

-- Services
CREATE INDEX idx_services_seller_id     ON public.services(seller_id);
CREATE INDEX idx_services_category      ON public.services(category);
CREATE INDEX idx_services_is_active     ON public.services(is_active);
CREATE INDEX idx_services_price         ON public.services(price);
CREATE INDEX idx_services_rating        ON public.services(rating DESC);

-- Digital products
CREATE INDEX idx_products_seller_id     ON public.digital_products(seller_id);
CREATE INDEX idx_products_category      ON public.digital_products(category);
CREATE INDEX idx_products_is_active     ON public.digital_products(is_active);
CREATE INDEX idx_products_price         ON public.digital_products(price);
CREATE INDEX idx_products_rating        ON public.digital_products(rating DESC);

-- Orders
CREATE INDEX idx_orders_buyer_id        ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller_id       ON public.orders(seller_id);
CREATE INDEX idx_orders_status          ON public.orders(status);
CREATE INDEX idx_orders_service_id      ON public.orders(service_id);
CREATE INDEX idx_orders_product_id      ON public.orders(product_id);
CREATE INDEX idx_orders_payment_status  ON public.orders(payment_status);

-- Reviews
CREATE INDEX idx_reviews_reviewed_id    ON public.reviews(reviewed_id);
CREATE INDEX idx_reviews_reviewer_id    ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_order_id       ON public.reviews(order_id);

-- Messages
CREATE INDEX idx_messages_sender_id     ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id   ON public.messages(receiver_id);
CREATE INDEX idx_messages_order_id      ON public.messages(order_id);
CREATE INDEX idx_messages_is_read       ON public.messages(is_read) WHERE is_read = false;
CREATE INDEX idx_messages_created_at    ON public.messages(created_at DESC);


-- ─────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────

-- updated_at auto-refresh
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Auto-create profile on auth.users insert (signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE
      WHEN NEW.raw_user_meta_data->>'account_type' = 'seller' THEN 'seller'::user_role
      ELSE 'buyer'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Recompute profile rating & total_reviews after any review change
CREATE OR REPLACE FUNCTION public.update_profile_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_id uuid;
BEGIN
  -- Determine which profile to update (INSERT/UPDATE use NEW, DELETE uses OLD)
  target_id := COALESCE(NEW.reviewed_id, OLD.reviewed_id);

  UPDATE public.profiles
  SET
    rating        = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews
      WHERE reviewed_id = target_id
    ), 0),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE reviewed_id = target_id
    )
  WHERE id = target_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change_update_profile
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_rating();


-- Increment service/product rating & total_orders when an order completes
CREATE OR REPLACE FUNCTION public.update_service_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- total_orders: increment when status moves to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    IF NEW.order_type = 'service' AND NEW.service_id IS NOT NULL THEN
      UPDATE public.services
      SET total_orders = total_orders + 1
      WHERE id = NEW.service_id;
    ELSIF NEW.order_type = 'product' AND NEW.product_id IS NOT NULL THEN
      UPDATE public.digital_products
      SET downloads = downloads + 1
      WHERE id = NEW.product_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_complete_update_stats
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_service_stats();


-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages        ENABLE ROW LEVEL SECURITY;


-- ── Profiles ──────────────────────────────

CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- (no DELETE — cascade handled by auth.users deletion)


-- ── Services ──────────────────────────────

-- Everyone sees active services; sellers see their own regardless
CREATE POLICY "services_select"
  ON public.services FOR SELECT
  USING (is_active = true OR auth.uid() = seller_id);

CREATE POLICY "services_insert_own"
  ON public.services FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "services_update_own"
  ON public.services FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "services_delete_own"
  ON public.services FOR DELETE
  USING (auth.uid() = seller_id);


-- ── Digital products ──────────────────────

CREATE POLICY "products_select"
  ON public.digital_products FOR SELECT
  USING (is_active = true OR auth.uid() = seller_id);

CREATE POLICY "products_insert_own"
  ON public.digital_products FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "products_update_own"
  ON public.digital_products FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "products_delete_own"
  ON public.digital_products FOR DELETE
  USING (auth.uid() = seller_id);


-- ── Orders ────────────────────────────────

-- Only buyer & seller of the order can see it
CREATE POLICY "orders_select_participants"
  ON public.orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "orders_insert_buyer"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Both parties can update (buyer cancels, seller accepts/completes)
CREATE POLICY "orders_update_participants"
  ON public.orders FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);


-- ── Reviews ───────────────────────────────

CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT USING (true);

-- Only reviewer (who participated in the order) can create
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id
        AND status = 'completed'
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "reviews_delete_own"
  ON public.reviews FOR DELETE
  USING (auth.uid() = reviewer_id);


-- ── Messages ──────────────────────────────

CREATE POLICY "messages_select_participants"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "messages_insert_sender"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Only receiver can mark as read
CREATE POLICY "messages_update_receiver"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

CREATE POLICY "messages_delete_sender"
  ON public.messages FOR DELETE
  USING (auth.uid() = sender_id);


-- ─────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'avatars',
    'avatars',
    true,
    5242880,   -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'service-images',
    'service-images',
    true,
    10485760,  -- 10 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'digital-products',
    'digital-products',
    false,
    524288000, -- 500 MB
    NULL       -- any file type
  ),
  (
    'documents',
    'documents',
    false,
    52428800,  -- 50 MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
  )
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────
-- STORAGE RLS
-- ─────────────────────────────────────────

-- avatars (public bucket)
CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- service-images (public bucket)
CREATE POLICY "service_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-images');

CREATE POLICY "service_images_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'service-images' AND auth.role() = 'authenticated');

CREATE POLICY "service_images_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'service-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "service_images_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'service-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- digital-products (private — only seller + paying buyers)
CREATE POLICY "digital_products_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'digital-products'
    AND (
      -- Seller always has access to their own files
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Buyers who paid can download
      EXISTS (
        SELECT 1
        FROM public.orders o
        JOIN public.digital_products dp ON dp.id = o.product_id
        WHERE o.buyer_id   = auth.uid()
          AND o.payment_status = 'paid'
          AND dp.file_url  LIKE '%' || (storage.filename(name)) || '%'
      )
    )
  );

CREATE POLICY "digital_products_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'digital-products' AND auth.role() = 'authenticated');

CREATE POLICY "digital_products_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'digital-products' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "digital_products_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'digital-products' AND auth.uid()::text = (storage.foldername(name))[1]);

-- documents (private — authenticated users only)
CREATE POLICY "documents_select_auth"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "documents_insert_auth"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "documents_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "documents_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ─────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────
-- Tables  : profiles, services, digital_products, orders, reviews, messages
-- Enums   : user_role, account_type, order_type_enum, order_status, payment_status
-- Triggers: updated_at, auto-create profile, update ratings, update order stats
-- RLS     : enabled on all 6 tables + storage buckets
-- Storage : avatars, service-images, digital-products, documents
