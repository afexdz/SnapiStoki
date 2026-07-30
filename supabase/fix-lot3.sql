-- ============================================================
-- PixRaise — Fix Lot 3: Message Attachments
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Idempotent: safe to re-run.
-- ============================================================


-- ─────────────────────────────────────────
-- PART 1 — ALTER messages: add attachment columns + relax content
-- ─────────────────────────────────────────

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS attachment_path   text,
  ADD COLUMN IF NOT EXISTS attachment_type   text,
  ADD COLUMN IF NOT EXISTS attachment_name   text,
  ADD COLUMN IF NOT EXISTS attachment_size   integer,
  ADD COLUMN IF NOT EXISTS attachment_width  integer,
  ADD COLUMN IF NOT EXISTS attachment_height integer;

-- Make content nullable (was NOT NULL).
-- Existing rows keep their content; new rows may omit it if they have an attachment.
ALTER TABLE public.messages ALTER COLUMN content DROP NOT NULL;

-- Enforce the invariant: every message must have text, an attachment, or both.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'messages_has_content_or_attachment'
      AND conrelid = 'public.messages'::regclass
  ) THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_has_content_or_attachment
      CHECK (content IS NOT NULL OR attachment_path IS NOT NULL);
  END IF;
END;
$$;


-- ─────────────────────────────────────────
-- PART 2 — Index for per-user quota query
-- Allows SUM(attachment_size) WHERE sender_id = $1 to use an index scan
-- on a small subset of rows, avoiding a full table scan on every send.
-- ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_messages_sender_attachments
  ON public.messages (sender_id, attachment_size)
  WHERE attachment_size IS NOT NULL;


-- ─────────────────────────────────────────
-- PART 3 — Storage bucket: message-attachments (private)
-- ─────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  false,
  5242880,   -- 5 MB hard ceiling (images are compressed to < 1 MB before upload)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────
-- PART 4 — RLS for message-attachments bucket
-- Path structure: {conversation_id}/{path_uuid}/{filename}
-- Participant verification uses string comparison against conversation.id::text
-- to avoid a cast error when the first path segment is not a valid UUID.
-- ─────────────────────────────────────────

DROP POLICY IF EXISTS "msg_attach_insert_participant" ON storage.objects;
DROP POLICY IF EXISTS "msg_attach_select_participant" ON storage.objects;
DROP POLICY IF EXISTS "msg_attach_delete_participant" ON storage.objects;

-- INSERT: uploader must be a participant in the conversation (first path segment)
CREATE POLICY "msg_attach_insert_participant" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'message-attachments'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- SELECT (required for createSignedUrl from browser client)
CREATE POLICY "msg_attach_select_participant" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'message-attachments'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- DELETE (used for rollback when message INSERT fails after a successful upload)
CREATE POLICY "msg_attach_delete_participant" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'message-attachments'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );


-- ─────────────────────────────────────────
-- DONE
-- ─────────────────────────────────────────
-- What this script does:
--   1. Adds 6 attachment columns to messages (all nullable).
--   2. Makes messages.content nullable; adds CHECK ensuring content IS NOT NULL
--      OR attachment_path IS NOT NULL (a message must have at least one).
--   3. Adds a partial index on (sender_id, attachment_size) for fast quota queries.
--   4. Creates the private 'message-attachments' bucket (5 MB limit, MIME allowlist).
--   5. Adds three RLS policies (INSERT / SELECT / DELETE) scoped to conversation
--      participants, verified via the first path segment (conversation_id).
--
-- Per-user quota query (to run before each upload):
--   SELECT COALESCE(SUM(attachment_size), 0) AS used_bytes
--   FROM public.messages
--   WHERE sender_id = '<user_id>'
--     AND attachment_size IS NOT NULL;
--   → Uses idx_messages_sender_attachments. Limit: 50 MB (52428800 bytes).
-- ─────────────────────────────────────────
