-- ============================================
-- COPY EVERYTHING BELOW AND PASTE IN SQL EDITOR
-- ============================================

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-images', 'medical-images', false)
ON CONFLICT (id) DO NOTHING;

-- Add column to chat_history
ALTER TABLE public.chat_history 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Remove old policies
DROP POLICY IF EXISTS "Users can upload their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own medical images" ON storage.objects;

-- Create upload policy
CREATE POLICY "Users can upload their own medical images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create view policy
CREATE POLICY "Users can view their own medical images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create delete policy
CREATE POLICY "Users can delete their own medical images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify it worked (should show the bucket)
SELECT id, name, public FROM storage.buckets WHERE id = 'medical-images';
