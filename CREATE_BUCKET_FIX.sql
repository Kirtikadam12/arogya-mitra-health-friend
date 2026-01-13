-- ============================================
-- COMPLETE SQL TO CREATE BUCKET AND POLICIES
-- Copy ALL of this and paste in Supabase SQL Editor
-- ============================================

-- Step 1: Create the storage bucket
-- This will create the 'medical-images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-images', 'medical-images', false)
ON CONFLICT (id) DO UPDATE 
SET name = 'medical-images', public = false;

-- Step 2: Add image_url column to chat_history table (if not exists)
ALTER TABLE public.chat_history 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Step 3: Remove any existing policies with the same name (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own medical images" ON storage.objects;

-- Step 4: Create INSERT policy (allows authenticated users to upload)
CREATE POLICY "Users can upload their own medical images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 5: Create SELECT policy (allows users to view their own images)
CREATE POLICY "Users can view their own medical images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 6: Create DELETE policy (allows users to delete their own images)
CREATE POLICY "Users can delete their own medical images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 7: Verify bucket was created (this should show the bucket)
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'medical-images';
