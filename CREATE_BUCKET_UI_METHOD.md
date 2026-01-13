# Create Bucket Using UI (Easiest Method)

## If SQL Doesn't Work, Use This Method

### Step 1: Go to Storage

**Click this link:**
👉 https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets

---

### Step 2: Create New Bucket

1. Click the **"New Bucket"** button (usually top right)
2. A form will appear

---

### Step 3: Fill in the Form

**Bucket name:** `medical-images`
- Must be exactly: `medical-images` (lowercase, with hyphen)
- No spaces, no capital letters

**Public bucket:** ❌ **UNCHECK THIS**
- The checkbox should be **UNCHECKED**
- Bucket must be **PRIVATE**

---

### Step 4: Create

Click **"Create bucket"** button

---

### Step 5: Add Policies (After Bucket is Created)

Once the bucket is created, you need to add policies:

1. **Go to SQL Editor:**
   👉 https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new

2. **Copy and paste this SQL:**

```sql
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
```

3. **Click "Run"**

---

### Step 6: Verify

1. Go back to: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets
2. Click on `medical-images` bucket
3. Go to **"Policies"** tab
4. You should see 3 policies listed

---

### Step 7: Test

1. Refresh your app (Ctrl+R)
2. Make sure you're signed in
3. Try uploading an image

---

## If "New Bucket" Button Doesn't Appear

This might mean:
1. You don't have permission (need to be project owner)
2. Try refreshing the page
3. Check if you're in the correct project

## If Bucket Creation Fails

Check the error message:
- "Bucket name already exists" → Bucket might already exist, check the list
- "Permission denied" → You need admin access
- Other error → Copy the exact error message
