# Step-by-Step: Fix Storage Bucket Error

## Current Error:
"Storage bucket 'medical-images' not found"

## Solution: Follow These Steps EXACTLY

### ✅ Step 1: Open Supabase SQL Editor

**Click this link:**
👉 https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new

Or navigate manually:
1. Go to https://supabase.com/dashboard
2. Select your project: `krrobfvpkgkmdvwvhkhi`
3. Click **"SQL Editor"** in left sidebar
4. Click **"New Query"** button

---

### ✅ Step 2: Copy the SQL Code

**Open the file `CREATE_BUCKET_FIX.sql` in your project folder**

OR copy this complete SQL code:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-images', 'medical-images', false)
ON CONFLICT (id) DO UPDATE 
SET name = 'medical-images', public = false;

ALTER TABLE public.chat_history 
ADD COLUMN IF NOT EXISTS image_url TEXT;

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

SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'medical-images';
```

---

### ✅ Step 3: Paste in SQL Editor

1. **Paste** the entire SQL code into the SQL Editor
2. Make sure you pasted ALL the code (from INSERT to SELECT)

---

### ✅ Step 4: Run the SQL

1. Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
2. Wait for execution to complete
3. You should see:
   - Multiple "Success" messages
   - At the bottom, a table showing the bucket with:
     - id: medical-images
     - name: medical-images
     - public: false

---

### ✅ Step 5: Verify Bucket Was Created

**Option A: Check in Storage UI**
1. Go to: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets
2. Look for **`medical-images`** in the list
3. If you see it → ✅ Success! Go to Step 6
4. If you DON'T see it → See "Troubleshooting" below

**Option B: Check Policies**
1. Click on `medical-images` bucket
2. Go to **"Policies"** tab
3. You should see 3 policies:
   - Users can upload their own medical images
   - Users can view their own medical images
   - Users can delete their own medical images

---

### ✅ Step 6: Test in Your App

1. **Refresh your browser** (Ctrl+R or Cmd+R)
2. **Make sure you're signed in** (look for "Sign Out" button)
3. **Try uploading an image** - Should work now! ✅

---

## If SQL Shows Errors

### Error: "permission denied for table storage.buckets"
**Solution:** 
- You need to be the project owner or have admin access
- Make sure you're logged into the correct Supabase account
- Try logging out and back in

### Error: "relation already exists"
**Solution:** 
- This is OK! It means the bucket or policies already exist
- Continue to Step 5 to verify

### Error: "syntax error"
**Solution:**
- Make sure you copied the ENTIRE SQL code
- Don't copy line numbers or comments, just the SQL
- Check for missing semicolons (;) at the end of each statement

---

## Alternative: Create Bucket via UI

If SQL doesn't work, try this:

1. **Go to Storage:**
   https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets

2. **Click "New Bucket"**

3. **Fill in:**
   - **Name:** `medical-images` (exact, lowercase, with hyphen)
   - **Public bucket:** ❌ **UNCHECKED** (must be private!)

4. **Click "Create bucket"**

5. **Then add policies:**
   - Go back to SQL Editor
   - Run only the policy creation parts (the CREATE POLICY statements)

---

## Still Not Working? Check These:

### 1. Are you signed in to your app?
- You MUST be signed in to upload images
- Look for "Sign Out" button in your app
- If not signed in, sign in first

### 2. Did the SQL run successfully?
- Go back to SQL Editor
- Check if there were any red error messages
- Should see "Success" messages

### 3. Wait a few seconds
- Sometimes it takes 10-30 seconds for changes to propagate
- Wait, then refresh your app and try again

### 4. Check browser console
- Press F12 → Console tab
- Try uploading an image
- Copy the EXACT error message
- Share it for help

### 5. Verify project credentials
- Check your `.env` file has correct Supabase URL and key
- Make sure you're using project: `krrobfvpkgkmdvwvhkhi`

---

## Quick Verification Checklist

- [ ] SQL ran successfully in SQL Editor
- [ ] Bucket `medical-images` appears in Storage → Buckets
- [ ] Bucket is marked as **Private** (not public)
- [ ] 3 policies exist in bucket → Policies tab
- [ ] You're signed in to your app
- [ ] Browser refreshed after creating bucket
- [ ] Tried uploading image again

---

## Direct Links

- **SQL Editor:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new
- **Storage Buckets:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets
- **Project Dashboard:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi

---

## Need More Help?

If it's still not working after following all steps:
1. Take a screenshot of the SQL Editor after running the SQL
2. Take a screenshot of the Storage → Buckets page
3. Copy the exact error from browser console (F12)
4. Share these for specific troubleshooting
