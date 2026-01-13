# Fix: Create Storage Bucket "medical-images"

## Error Message:
"Storage bucket 'medical-images' not found"

## Solution: Create the Bucket

### Method 1: Using Supabase SQL Editor (FASTEST - 2 minutes)

1. **Go to Supabase SQL Editor:**
   - Open: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new
   
2. **Paste this SQL code:**
   ```sql
   -- Create storage bucket
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('medical-images', 'medical-images', false)
   ON CONFLICT (id) DO NOTHING;

   -- Add image_url column to chat_history (if not exists)
   ALTER TABLE public.chat_history 
   ADD COLUMN IF NOT EXISTS image_url TEXT;

   -- Create storage policies for users to upload their own images
   CREATE POLICY IF NOT EXISTS "Users can upload their own medical images"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'medical-images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Create policy for users to view their own images
   CREATE POLICY IF NOT EXISTS "Users can view their own medical images"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'medical-images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Create policy for users to delete their own images
   CREATE POLICY IF NOT EXISTS "Users can delete their own medical images"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'medical-images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

3. **Click "Run" button** (or press Ctrl+Enter)

4. **Wait for success message** - Should say "Success. No rows returned"

5. **Refresh your app** (Ctrl+R or Cmd+R)

6. **Try uploading an image again** - It should work now! ✅

---

### Method 2: Using Supabase Dashboard UI

1. **Go to Storage:**
   - Open: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets

2. **Click "New Bucket" button**

3. **Fill in the form:**
   - **Name:** `medical-images`
   - **Public bucket:** ❌ NO (uncheck this - it should be private)
   - Click **"Create bucket"**

4. **Set up Policies:**
   - Click on the `medical-images` bucket you just created
   - Go to **"Policies"** tab
   - Click **"New Policy"** → Select **"For full customization"**
   
   **Create 3 policies:**

   **Policy 1 - INSERT (Upload):**
   ```sql
   CREATE POLICY "Users can upload their own medical images"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'medical-images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   **Policy 2 - SELECT (View):**
   ```sql
   CREATE POLICY "Users can view their own medical images"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'medical-images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   **Policy 3 - DELETE:**
   ```sql
   CREATE POLICY "Users can delete their own medical images"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'medical-images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

5. **Refresh your app** and try again!

---

## After Creating the Bucket:

1. ✅ **Refresh your browser** (where the app is running)
2. ✅ **Make sure you're signed in**
3. ✅ **Try uploading an image again**

---

## Verify It Works:

1. Go to: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets
2. You should see `medical-images` in the list
3. Click on it → Go to **Policies** tab
4. You should see 3 policies listed

---

## Quick Links:

- **SQL Editor:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/sql/new
- **Storage Buckets:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets
- **Your Project:** https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi

---

**Recommendation: Use Method 1 (SQL Editor) - it's faster and sets everything up at once!**
