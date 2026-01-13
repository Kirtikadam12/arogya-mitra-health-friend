# Verify Your Bucket Setup

## Quick Verification Steps

### Step 1: Check if Bucket Exists

1. Go to: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets
2. Look for `medical-images` in the list
3. If you don't see it, **CREATE IT NOW** using the SQL below

---

### Step 2: Run This Complete SQL (Copy All of It)

Go to: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new

**Paste this ENTIRE SQL block:**

```sql
-- Step 1: Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-images', 'medical-images', false)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Add image_url column to chat_history table
ALTER TABLE public.chat_history 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Step 3: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own medical images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own medical images" ON storage.objects;

-- Step 4: Create INSERT policy (allows upload)
CREATE POLICY "Users can upload their own medical images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 5: Create SELECT policy (allows viewing)
CREATE POLICY "Users can view their own medical images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 6: Create DELETE policy (allows deletion)
CREATE POLICY "Users can delete their own medical images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Click "Run"**

---

### Step 3: Verify Everything Was Created

1. **Check Bucket:**
   - Go to: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets
   - Click on `medical-images`
   - It should show: **Private** bucket

2. **Check Policies:**
   - Still in the `medical-images` bucket page
   - Click **"Policies"** tab
   - You should see **3 policies**:
     - Users can upload their own medical images (INSERT)
     - Users can view their own medical images (SELECT)
     - Users can delete their own medical images (DELETE)

3. **Check Database Column:**
   - Go to: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/editor
   - Find `chat_history` table
   - Verify `image_url` column exists

---

### Step 4: Test in Your App

1. **Refresh your browser** (where app is running) - Ctrl+R
2. **Make sure you're signed in** (look for "Sign Out" button)
3. **Try uploading an image** again

---

## If Still Not Working:

### Check These:

1. **Are you signed in?**
   - You MUST be signed in to upload
   - Look for "Sign Out" button in the app
   - If not signed in, sign in first

2. **Did the SQL run successfully?**
   - Go back to SQL Editor
   - Check if there were any errors
   - Should say "Success. No rows returned" or similar

3. **Check Browser Console (F12):**
   - Open browser console
   - Try uploading an image
   - Copy the EXACT error message

4. **Verify Bucket is Private:**
   - Bucket must be **Private** (not public)
   - If it's public, delete it and recreate as private

---

## Common Issues:

### "Bucket not found" after creating it
- **Solution:** Wait 10 seconds, refresh browser, try again
- Sometimes it takes a moment to propagate

### "Permission denied" error
- **Solution:** Run the SQL policies again (Step 2 above)
- Make sure all 3 policies are created

### "Authentication required" error
- **Solution:** You must sign in first
- Look for EmailAuth component and sign in

### Still seeing errors?
- Check browser console (F12) for the exact error
- Share the error message for specific help

---

## Quick Links:

- **SQL Editor:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new
- **Storage Buckets:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets
- **Table Editor:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/editor
