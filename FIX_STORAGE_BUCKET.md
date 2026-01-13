# Fix: Create Storage Bucket - Step by Step

## ⚠️ Error: "Storage bucket 'medical-images' not found"

## Solution: Follow These Steps EXACTLY

### Step 1: Open Supabase SQL Editor

1. Go to: **https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new**
2. Or navigate: Dashboard → SQL Editor → New Query

---

### Step 2: Copy the ENTIRE SQL Script

Open the file `CREATE_BUCKET_FIX.sql` in this folder, OR copy this complete SQL:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-images', 'medical-images', false)
ON CONFLICT (id) DO UPDATE 
SET name = 'medical-images', public = false;

-- Add image_url column to chat_history table
ALTER TABLE public.chat_history 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Remove existing policies (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own medical images" ON storage.objects;

-- Create INSERT policy
CREATE POLICY "Users can upload their own medical images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create SELECT policy
CREATE POLICY "Users can view their own medical images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create DELETE policy
CREATE POLICY "Users can delete their own medical images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify bucket was created
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'medical-images';
```

---

### Step 3: Paste and Run

1. **Paste** the entire SQL into the SQL Editor
2. **Click "Run"** button (or press Ctrl+Enter / Cmd+Enter)
3. **Wait for results** - Should see:
   - Multiple "Success" messages
   - At the end, a table showing the bucket was created

---

### Step 4: Verify It Worked

#### Check 1: Verify Bucket Exists

1. Go to: **https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets**
2. You should see **`medical-images`** in the list
3. Click on it - it should show as **Private**

#### Check 2: Verify Policies Exist

1. Still in the `medical-images` bucket page
2. Click **"Policies"** tab
3. You should see **3 policies**:
   - ✅ Users can upload their own medical images
   - ✅ Users can view their own medical images
   - ✅ Users can delete their own medical images

---

### Step 5: Test in Your App

1. **Refresh your browser** (where app is running) - Press Ctrl+R or Cmd+R
2. **Make sure you're signed in** (look for "Sign Out" button)
3. **Try uploading an image again** - Should work now! ✅

---

## If SQL Editor Shows Errors

### Error: "permission denied"
- **Solution**: Make sure you're logged into the correct Supabase account
- The account must be the project owner or have admin access

### Error: "relation already exists"
- **Solution**: This is OK! It means the bucket already exists
- Just continue to verify it works

### Error: "syntax error"
- **Solution**: Make sure you copied the ENTIRE SQL script
- Don't copy line numbers, only the SQL code
- Check for missing semicolons

---

## Alternative: Create Bucket via UI

If SQL doesn't work, try the UI method:

1. Go to: **https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets**
2. Click **"New Bucket"**
3. Fill in:
   - **Name:** `medical-images` (exact name, lowercase)
   - **Public bucket:** ❌ **UNCHECKED** (must be private)
4. Click **"Create bucket"**
5. Then add the policies using SQL Editor (just the policy parts)

---

## Still Not Working?

### Troubleshooting Steps:

1. **Check if you're signed in to your app**
   - You MUST be signed in to upload images
   - Look for "Sign Out" button in the app

2. **Check browser console** (F12 → Console)
   - Try uploading an image
   - Copy the exact error message

3. **Verify bucket is private**
   - Bucket MUST be private (not public)
   - If it's public, delete it and recreate as private

4. **Wait a few seconds**
   - Sometimes it takes 10-30 seconds for changes to propagate
   - Refresh your app and try again

5. **Check Supabase project**
   - Make sure you're using the correct project: `krrobfvpkgkmdvwvhkhi`
   - Verify your `.env` file has the correct credentials

---

## Quick Links

- **SQL Editor:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new
- **Storage Buckets:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets
- **Project Dashboard:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi

---

## After Success

Once the bucket is created and working:
- ✅ Images will upload to Supabase Storage
- ✅ Images will be analyzed by AI for disease detection
- ✅ Images will be saved in your chat history
- ✅ Everything will work seamlessly!
