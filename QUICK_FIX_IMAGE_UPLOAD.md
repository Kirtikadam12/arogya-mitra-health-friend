# Quick Fix for Image Upload Error

## Your Supabase is Configured ✅

Your `.env` file shows Supabase is set up. The error is likely because:

**The `medical-images` storage bucket doesn't exist yet.**

## Quick Solution:

### Option 1: Run the Migration (Recommended)

Run this in your terminal:
```bash
supabase migration up
```

If that doesn't work, manually create the bucket:

### Option 2: Create Bucket Manually

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `krrobfvpkgkmdvwvhkhi`

2. **Create Storage Bucket:**
   - Click **Storage** in the left sidebar
   - Click **New Bucket** button
   - Name: `medical-images`
   - **Important:** Make it **Private** (not public)
   - Click **Create bucket**

3. **Set up Policies:**
   - Go to Storage → `medical-images` → Policies
   - Click **New Policy** → **For full customization**
   - Copy and paste these policies:

   **Policy 1: Allow users to upload**
   ```sql
   CREATE POLICY "Users can upload their own medical images"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'medical-images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   **Policy 2: Allow users to view**
   ```sql
   CREATE POLICY "Users can view their own medical images"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'medical-images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   **Policy 3: Allow users to delete**
   ```sql
   CREATE POLICY "Users can delete their own medical images"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'medical-images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

### Option 3: Use SQL Editor

1. Go to Supabase Dashboard → SQL Editor
2. Click **New Query**
3. Paste this SQL:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-images', 'medical-images', false)
ON CONFLICT (id) DO NOTHING;

-- Add image_url column to chat_history (if not exists)
ALTER TABLE public.chat_history 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage policies
CREATE POLICY IF NOT EXISTS "Users can upload their own medical images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can view their own medical images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete their own medical images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

4. Click **Run**

---

## After Setup:

1. **Make sure you're signed in** (EmailAuth component)
2. **Refresh your browser**
3. **Try uploading an image again**

---

## If Still Not Working:

1. **Check if you're signed in:**
   - Look for a "Sign Out" button in the header
   - If you don't see it, click "Sign In" first

2. **Check browser console (F12):**
   - Look for specific error messages
   - Share the exact error if it persists

3. **Verify bucket exists:**
   - Go to Supabase Dashboard → Storage
   - You should see `medical-images` bucket listed

---

## Common Error Messages:

| Error | Solution |
|-------|----------|
| "Authentication required" | Sign in first |
| "Storage bucket not found" | Create the bucket (see above) |
| "Permission denied" | Set up storage policies (see above) |
| "JWT error" | Sign out and sign in again |
