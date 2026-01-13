# 🚨 ULTIMATE FIX: Storage Bucket Error

## The Problem:
"Storage bucket 'medical-images' not found"

## ✅ SOLUTION: Follow These Steps EXACTLY

### Method 1: Quick One-Line Fix (Try This First!)

1. **Open SQL Editor:**
   👉 https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new

2. **Copy and paste this ONE line:**
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('medical-images', 'medical-images', false) ON CONFLICT (id) DO NOTHING;
   ```

3. **Click "Run"**

4. **Then run this to verify:**
   ```sql
   SELECT id, name, public FROM storage.buckets WHERE id = 'medical-images';
   ```
   
   **You should see a table with:**
   - id: medical-images
   - name: medical-images  
   - public: false

5. **If you see the bucket above, then add the policies:**
   ```sql
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

---

### Method 2: Complete Fix (All at Once)

1. **Open SQL Editor:**
   👉 https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new

2. **Open the file `VERIFY_AND_FIX_BUCKET.sql` in your project**

3. **Copy ALL the SQL from that file**

4. **Paste and click "Run"**

5. **Check the results** - You should see the bucket in the final SELECT query

---

### Method 3: Create via UI (If SQL Doesn't Work)

1. **Go to Storage:**
   👉 https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets

2. **Click "New Bucket" button**

3. **Fill in exactly:**
   - **Name:** `medical-images` (lowercase, with hyphen, exact spelling)
   - **Public bucket:** ❌ **UNCHECK THIS** (must be private!)

4. **Click "Create bucket"**

5. **Then add policies using SQL Editor** (the CREATE POLICY statements from Method 1)

---

## ✅ After Creating Bucket: Verify It Works

### Check 1: Bucket Exists
1. Go to: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets
2. You should see `medical-images` in the list
3. Click on it - should show as **Private**

### Check 2: Policies Exist
1. In the `medical-images` bucket page
2. Click **"Policies"** tab
3. Should see 3 policies:
   - ✅ Users can upload their own medical images
   - ✅ Users can view their own medical images
   - ✅ Users can delete their own medical images

### Check 3: Test in App
1. **Refresh your browser** (Ctrl+R)
2. **Make sure you're signed in** (look for "Sign Out" button)
3. **Try uploading an image**

---

## 🔍 Troubleshooting

### If SQL says "permission denied":
- You need to be the project owner
- Make sure you're logged into the correct Supabase account
- Try logging out and back in

### If bucket still doesn't appear:
1. **Wait 30 seconds** - Sometimes it takes time to propagate
2. **Refresh the Storage page**
3. **Check if you're in the correct project** (krrobfvpkgkmdvwvhkhi)

### If you see "relation already exists":
- This is OK! It means the bucket exists
- Just continue to add the policies

### If still not working:
1. **Check browser console** (F12 → Console)
2. **Copy the exact error message**
3. **Verify you're signed in** to your app
4. **Check the bucket exists** in Supabase Dashboard

---

## 📋 Quick Checklist

- [ ] Ran SQL to create bucket
- [ ] Verified bucket appears in Storage → Buckets
- [ ] Bucket is marked as **Private** (not public)
- [ ] Added 3 policies (INSERT, SELECT, DELETE)
- [ ] Refreshed browser/app
- [ ] Signed in to the app
- [ ] Tried uploading image again

---

## 🎯 Direct Links

- **SQL Editor:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new
- **Storage Buckets:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets
- **Project:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi

---

## 💡 Pro Tip

If you're still having issues, try this verification query in SQL Editor:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'medical-images';

-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%medical%';
```

This will show you exactly what exists and what's missing!
