# Debug Image Upload Issues

## Step 1: Check Browser Console

1. **Open your browser** (where the app is running)
2. **Press F12** to open Developer Tools
3. **Click the "Console" tab**
4. **Try uploading an image**
5. **Look for red error messages**

Copy the exact error message you see!

---

## Step 2: Check What Error You're Seeing

### Common Error Messages:

1. **"Authentication required"**
   - ✅ Solution: Sign in first

2. **"Storage bucket 'medical-images' not found"**
   - ✅ Solution: Create the bucket (see QUICK_FIX_IMAGE_UPLOAD.md)

3. **"Permission denied"**
   - ✅ Solution: Set up storage policies

4. **"new row violates row-level security policy"**
   - ✅ Solution: Storage policies not set up correctly

5. **"The resource already exists"**
   - ✅ Solution: File already uploaded, this is OK - ignore or delete old file

6. **"Failed to create signed URL"**
   - ✅ Solution: Check bucket permissions

---

## Step 3: Check Network Tab

1. **Press F12** → **Network tab**
2. **Try uploading an image**
3. **Look for failed requests** (they'll be red)
4. **Click on the failed request**
5. **Check the "Response" tab** for error details

---

## Step 4: Verify Setup

Run these checks:

### ✅ Check 1: Are you signed in?
- Look for "Sign Out" button in the app
- If you don't see it, you need to sign in first

### ✅ Check 2: Does the bucket exist?
1. Go to: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets
2. Look for `medical-images` bucket
3. If it doesn't exist, create it (see QUICK_FIX_IMAGE_UPLOAD.md)

### ✅ Check 3: Check Environment Variables
Open `.env` file - should have:
```
VITE_SUPABASE_URL=https://krrobfvpkgkmdvwvhkhi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

---

## Step 5: Quick Test in Browser Console

Open browser console (F12) and paste this to test:

```javascript
// Test if Supabase is configured
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Set' : 'Not set');

// Test storage bucket access
import { supabase } from '/src/integrations/supabase/client';
supabase.storage.listBuckets().then(console.log);
```

---

## What to Share for Help:

1. **Exact error message** from the toast notification
2. **Console errors** (F12 → Console tab)
3. **Network errors** (F12 → Network tab → failed requests)
4. **Are you signed in?** (Yes/No)
5. **Does the bucket exist?** (Check Supabase Dashboard)

---

## Quick Fixes to Try:

1. **Refresh the page** (Ctrl+R or Cmd+R)
2. **Sign out and sign in again**
3. **Clear browser cache** (Ctrl+Shift+Delete)
4. **Restart dev server**: Stop (Ctrl+C) and run `npm run dev` again
5. **Check Supabase Dashboard** → Storage → Verify bucket exists
