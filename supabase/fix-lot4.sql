-- ============================================================
-- PixRaise — Fix Lot 4 : Téléchargement produits gratuits
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Idempotent: safe to re-run.
-- ============================================================

-- Remplace la policy SELECT du bucket digital-products pour
-- autoriser les utilisateurs authentifiés à télécharger les
-- produits gratuits (is_free = true), en plus du vendeur et
-- des acheteurs ayant une commande payée.

DROP POLICY IF EXISTS "digital_products_select" ON storage.objects;

CREATE POLICY "digital_products_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'digital-products'
    AND (
      -- Le vendeur a toujours accès à ses propres fichiers
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Tout utilisateur authentifié peut télécharger un produit gratuit actif
      (
        auth.uid() IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.digital_products dp
          WHERE dp.is_free   = true
            AND dp.is_active = true
            AND dp.file_url  LIKE '%' || (storage.filename(name)) || '%'
        )
      )
      OR
      -- Acheteurs dont la commande est marquée payée
      EXISTS (
        SELECT 1
        FROM public.orders o
        JOIN public.digital_products dp ON dp.id = o.product_id
        WHERE o.buyer_id        = auth.uid()
          AND o.payment_status  = 'paid'
          AND dp.file_url       LIKE '%' || (storage.filename(name)) || '%'
      )
    )
  );
