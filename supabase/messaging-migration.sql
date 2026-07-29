-- ============================================================
-- SnapiStoki — Messaging System Migration
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Idempotent: safe to re-run.
-- ============================================================


-- ─────────────────────────────────────────
-- 1. CONVERSATIONS TABLE
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversations (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_type   text        NOT NULL CHECK (listing_type IN ('service', 'product')),
  listing_id     uuid        NOT NULL,   -- polymorphic: no FK (points to services OR digital_products)
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT conversations_different_parties CHECK (buyer_id <> seller_id),
  UNIQUE (buyer_id, seller_id, listing_type, listing_id)
);


-- ─────────────────────────────────────────
-- 2. ALTER MESSAGES TABLE
--    Add conversation_id + read_at; make receiver_id nullable
--    so new-style messages (conversation-based) don't need a receiver_id.
-- ─────────────────────────────────────────

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE;

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Make receiver_id nullable (old messages keep their value; new messages omit it)
ALTER TABLE public.messages ALTER COLUMN receiver_id DROP NOT NULL;


-- ─────────────────────────────────────────
-- 3. INDEX
-- ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON public.messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id
  ON public.conversations(buyer_id);

CREATE INDEX IF NOT EXISTS idx_conversations_seller_id
  ON public.conversations(seller_id);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at
  ON public.conversations(last_message_at DESC);


-- ─────────────────────────────────────────
-- 4. TRIGGER: keep last_message_at in sync
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_conversation_last_message_at()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_conv_last_message_at ON public.messages;
CREATE TRIGGER trg_conv_last_message_at
  AFTER INSERT ON public.messages
  FOR EACH ROW
  WHEN (NEW.conversation_id IS NOT NULL)
  EXECUTE FUNCTION public.update_conversation_last_message_at();


-- ─────────────────────────────────────────
-- 5. RLS — CONVERSATIONS
-- ─────────────────────────────────────────

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_select_participants" ON public.conversations;
CREATE POLICY "conversations_select_participants" ON public.conversations
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "conversations_insert_buyer" ON public.conversations;
CREATE POLICY "conversations_insert_buyer" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);


-- ─────────────────────────────────────────
-- 6. RLS — MESSAGES (update to cover conversation-based messages)
-- ─────────────────────────────────────────

DROP POLICY IF EXISTS "messages_select_participants" ON public.messages;
CREATE POLICY "messages_select_participants" ON public.messages
  FOR SELECT USING (
    -- old-style: direct receiver/sender
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
    -- new-style: via conversation membership
    OR (
      conversation_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = conversation_id
          AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "messages_insert_sender" ON public.messages;
CREATE POLICY "messages_insert_sender" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND (
      -- old-style: must have a receiver that is not yourself
      (receiver_id IS NOT NULL AND receiver_id <> auth.uid())
      OR
      -- new-style: must be participant in the conversation
      (
        conversation_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id = conversation_id
            AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
        )
      )
    )
  );

DROP POLICY IF EXISTS "messages_update_receiver" ON public.messages;
CREATE POLICY "messages_update_receiver" ON public.messages
  FOR UPDATE USING (
    auth.uid() = receiver_id
    OR (
      conversation_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = conversation_id
          AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "messages_delete_sender" ON public.messages;
CREATE POLICY "messages_delete_sender" ON public.messages
  FOR DELETE USING (auth.uid() = sender_id);


-- ─────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────
-- What this script does:
--   1. Creates `conversations` table (polymorphic listing_id — no FK by design)
--   2. Adds conversation_id and read_at columns to messages
--   3. Makes messages.receiver_id nullable (backward compatible)
--   4. Adds indexes for query performance
--   5. Adds trigger to auto-update conversations.last_message_at on new messages
--   6. Adds RLS for conversations (participants can read/insert)
--   7. Updates RLS for messages to cover both old-style and conversation-based messages
--
-- MANUAL STEPS after running:
--   a) Verify the conversations table appears in the Supabase Table Editor
--   b) Check that messages table has conversation_id and read_at columns
--   c) Confirm RLS policies are active on both tables
-- ─────────────────────────────────────────
