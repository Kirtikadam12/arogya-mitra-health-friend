-- ============================================
-- COMPLETE FIX - Copy ALL of this
-- ============================================

-- Step 1: Create bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-images', 'medical-images', false)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Verify bucket exists (this will show you the bucket if it was created)
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'medical-images';

-- Step 3: Add column to chat_history
ALTER TABLE public.chat_history 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Step 4: Create policies (drop old ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own medical images" ON storage.objects;

CREATE POLICY "Users can upload their own medical images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own medical images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own medical images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 5: Verify everything (should show the bucket)
SELECT id, name, public FROM storage.buckets WHERE id = 'medical-images';
