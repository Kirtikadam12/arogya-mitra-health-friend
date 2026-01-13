# Troubleshooting Image Upload Errors

## Common Errors and Solutions

### 1. "Authentication required" Error

**Error Message:**
```
"Please sign in to upload images"
```

**Solution:**
- ✅ You must be signed in to upload images
- Click on the sign-in button (EmailAuth component)
- Create an account or sign in with existing credentials
- Images are stored securely per user account

---

### 2. "Storage bucket 'medical-images' not found" Error

**Error Message:**
```
"Storage bucket 'medical-images' not found. Please run the database migration."
```

**Solution:**
1. **Run the database migration:**
   ```bash
   supabase migration up
   ```
   
2. **Or manually create the bucket in Supabase Dashboard:**
   - Go to Supabase Dashboard → Storage
   - Click "New Bucket"
   - Name: `medical-images`
   - Make it **Private** (not public)
   - Click "Create bucket"

3. **Set up storage policies** (from migration file):
   - The migration automatically creates RLS policies
   - Or manually add policies in Storage → Policies for `medical-images` bucket

---

### 3. "Permission denied" Error

**Error Message:**
```
"Permission denied. Please check storage policies in Supabase."
```

**Solution:**
1. Go to Supabase Dashboard → Storage → `medical-images` → Policies
2. Ensure these policies exist:

   **INSERT Policy:**
   ```sql
   CREATE POLICY "Users can upload their own medical images"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'medical-images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   **SELECT Policy:**
   ```sql
   CREATE POLICY "Users can view their own medical images"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'medical-images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

---

### 4. "Supabase not configured" Warning

**Message:**
```
"Please configure Supabase to upload images. Using local image preview instead."
```

**Solution:**
This is actually a **fallback mode** - the app will work with local image previews!

To enable full functionality:
1. Create `.env` file in project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

2. Restart the dev server:
   ```bash
   npm run dev
   ```

---

### 5. "JWT" or "Authentication error"

**Error Message:**
```
"Authentication error. Please sign in again."
```

**Solution:**
- Your session may have expired
- Click "Sign Out" and sign in again
- Clear browser cache if issue persists
- Check Supabase project settings for auth configuration

---

### 6. Image Preview Shows but Upload Fails

**Symptoms:**
- Image preview appears correctly
- Error when clicking "Send"

**Solutions:**
1. Check browser console (F12) for detailed error
2. Verify you're signed in
3. Check Supabase Storage bucket exists
4. Verify network connection
5. Check file size (max 10MB)

---

### 7. Images Not Displaying After Upload

**Symptoms:**
- Upload succeeds but image doesn't show in chat

**Solutions:**
1. Check if `image_url` column exists in `chat_history` table:
   ```sql
   ALTER TABLE public.chat_history 
   ADD COLUMN IF NOT EXISTS image_url TEXT;
   ```

2. Verify signed URL is valid (check browser network tab)
3. Check browser console for CORS errors
4. Ensure image_url is being saved to database

---

## Step-by-Step Setup Checklist

To ensure image upload works:

- [ ] **1. Run Database Migration**
  ```bash
  supabase migration up
  ```
  
- [ ] **2. Create Storage Bucket** (if migration didn't create it)
  - Supabase Dashboard → Storage → New Bucket
  - Name: `medical-images`
  - Private: Yes

- [ ] **3. Configure Environment Variables**
  - Create `.env` file with Supabase credentials
  - Restart dev server

- [ ] **4. Sign In**
  - Use EmailAuth component to create account/sign in
  - Verify user is authenticated

- [ ] **5. Test Upload**
  - Click image icon
  - Select an image (JPG, PNG, etc.)
  - Click Send
  - Check for errors in console

---

## Quick Diagnostic Steps

1. **Check Browser Console:**
   - Press F12 → Console tab
   - Look for red error messages
   - Copy the exact error message

2. **Check Network Tab:**
   - Press F12 → Network tab
   - Try uploading an image
   - Look for failed requests (red)
   - Check request/response details

3. **Verify Supabase Connection:**
   - Check `.env` file exists
   - Verify credentials are correct
   - Test in Supabase Dashboard → Storage

4. **Check Authentication:**
   - Verify you're signed in
   - Check user object exists: `console.log(user)` in browser console

---

## Still Having Issues?

1. **Check the exact error message** in the toast notification
2. **Check browser console** (F12) for detailed errors
3. **Verify all setup steps** from the checklist above
4. **Try a different image** (smaller file, different format)
5. **Clear browser cache** and try again

---

## Fallback Mode (No Supabase)

If Supabase isn't configured, the app will:
- ✅ Show image preview
- ✅ Display images in chat using data URLs
- ⚠️ Images won't persist after page refresh
- ⚠️ Images won't be stored in cloud storage

This is useful for testing the UI, but you'll need Supabase for full functionality.
