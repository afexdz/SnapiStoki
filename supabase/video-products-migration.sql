-- Add video MIME types to the product-files bucket
-- digital-products bucket already has allowed_mime_types = NULL (all types accepted)

-- Create product-files bucket with video support if it doesn't exist yet
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-files',
  'product-files',
  false,
  52428800,  -- 50 MB hard limit
  ARRAY[
    'application/zip',
    'application/x-zip-compressed',
    'application/pdf',
    'application/postscript',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'application/octet-stream',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET allowed_mime_types = ARRAY[
    'application/zip',
    'application/x-zip-compressed',
    'application/pdf',
    'application/postscript',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'application/octet-stream',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo'
  ],
  file_size_limit = 52428800;

-- digital-products bucket: ensure file_size_limit is 50 MB (was 500 MB)
-- and explicitly allow video types alongside the existing NULL (any-type) policy
-- If you want to keep NULL (unrestricted) on digital-products, skip the UPDATE below.
-- Uncomment only if you want explicit allowlisting on digital-products too:
--
-- UPDATE storage.buckets
-- SET allowed_mime_types = ARRAY[
--   'application/zip', 'application/x-zip-compressed', 'application/pdf',
--   'image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/octet-stream',
--   'video/mp4', 'video/quicktime', 'video/x-msvideo'
-- ]
-- WHERE id = 'digital-products';
