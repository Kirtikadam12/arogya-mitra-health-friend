# 🎯 EXACT STEPS TO FIX THE ERROR

## Error You're Seeing:
```
StorageApiError: Bucket not found
Storage bucket 'medical-images' not found
```

## ✅ SOLUTION: Do These 3 Steps

### STEP 1: Open SQL Editor

**Click this link:**
👉 **https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new**

---

### STEP 2: Copy the SQL

**Open the file `COPY_THIS_SQL.sql` in your project folder**

OR copy this complete SQL (everything below):

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-images', 'medical-images', false)
ON CONFLICT (id) DO NOTHING;

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

SELECT id, name, public FROM storage.buckets WHERE id = 'medical-images';
```

---

### STEP 3: Paste and Run

1. **Paste** the SQL into the SQL Editor
2. **Click "Run"** button (or press Ctrl+Enter)
3. **Wait for results** - You should see:
   - Multiple "Success" messages
   - At the bottom, a table showing:
     - id: medical-images
     - name: medical-images
     - public: false

---

### STEP 4: Verify It Worked

1. **Go to Storage:**
   👉 https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets

2. **Look for `medical-images`** in the list
   - ✅ If you see it → SUCCESS! Go to Step 5
   - ❌ If you DON'T see it → See "Troubleshooting" below

---

### STEP 5: Test in Your App

1. **Refresh your browser** (Ctrl+R or Cmd+R)
2. **Make sure you're signed in** (look for "Sign Out" button)
3. **Try uploading an image** - Should work now! ✅

---

## 🔍 Troubleshooting

### If bucket still doesn't appear:

1. **Wait 30 seconds** - Sometimes it takes time to show up
2. **Refresh the Storage page**
3. **Check if SQL ran successfully:**
   - Go back to SQL Editor
   - Look for any red error messages
   - Should see "Success" messages

### If SQL shows errors:

**Error: "permission denied"**
- Make sure you're logged into the correct Supabase account
- You need to be the project owner
- Try logging out and back in

**Error: "syntax error"**
- Make sure you copied the ENTIRE SQL
- Don't copy line numbers, just the SQL code
- Check for missing semicolons (;)

### Alternative: Create via UI

If SQL doesn't work:

1. Go to: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets
2. Click **"New Bucket"**
3. Name: `medical-images` (exact spelling)
4. **UNCHECK** "Public bucket" (must be private!)
5. Click **"Create bucket"**
6. Then run only the policy SQL (the CREATE POLICY parts)

---

## ✅ Verification Checklist

After running the SQL, check:

- [ ] SQL ran without errors
- [ ] Bucket appears in Storage → Buckets
- [ ] Bucket is marked as **Private**
- [ ] 3 policies exist (check Policies tab)
- [ ] Refreshed browser/app
- [ ] Signed in to app
- [ ] Tried uploading image

---

## 🎯 Quick Links

- **SQL Editor:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new
- **Storage:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets

---

**The SQL in `COPY_THIS_SQL.sql` will create everything you need. Just copy it, paste in SQL Editor, and run!**
