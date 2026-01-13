# Troubleshooting: Bucket Not Creating

## Common Issues and Solutions

### Issue 1: SQL Runs But Bucket Doesn't Appear

**Possible Causes:**
- Bucket was created but not visible (refresh needed)
- Permission issue
- Wrong project

**Solutions:**
1. **Wait 30 seconds** and refresh the Storage page
2. **Check you're in the correct project:** `krrobfvpkgkmdvwvhkhi`
3. **Try the UI method** (see CREATE_BUCKET_UI_METHOD.md)

---

### Issue 2: "Permission Denied" Error

**Cause:** You don't have admin access to the project

**Solutions:**
1. Make sure you're logged into the correct Supabase account
2. Verify you're the project owner or have admin role
3. Try logging out and back in
4. Contact project owner to grant you access

---

### Issue 3: SQL Shows Success But Bucket Still Missing

**Check:**
1. Run this verification query in SQL Editor:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'medical-images';
   ```
   
2. If this returns a row → Bucket exists! The UI might just need a refresh

3. If this returns nothing → Bucket wasn't created, try UI method

---

### Issue 4: "Bucket Already Exists" Error

**This is actually GOOD!** It means the bucket exists.

**Next Steps:**
1. Go to Storage → Buckets
2. Look for `medical-images`
3. If you see it → Just add the policies (see Step 5 in UI method)
4. If you don't see it → Refresh the page

---

## Alternative: Use Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project
supabase link --project-ref krrobfvpkgkmdvwvhkhi

# Create bucket
supabase storage create-bucket medical-images --private
```

---

## Manual Verification Steps

### Step 1: Check if Bucket Exists (SQL Query)

Run this in SQL Editor:
```sql
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'medical-images';
```

**Expected Result:**
- If you see a row → Bucket exists! ✅
- If you see "0 rows" → Bucket doesn't exist ❌

### Step 2: Check Storage UI

1. Go to: https://supabase.com/dashboard/project/krrobfvpkgkmdvwvhkhi/storage/buckets
2. Look in the list
3. Check if `medical-images` appears

### Step 3: Check Browser Console

1. Open your app
2. Press F12 → Console tab
3. Try uploading an image
4. Look for any additional error messages

---

## Still Not Working?

**Please provide:**
1. Screenshot of SQL Editor after running the SQL
2. Screenshot of Storage → Buckets page
3. Result of this query:
   ```sql
   SELECT * FROM storage.buckets;
   ```
   (This shows ALL buckets - does `medical-images` appear?)

4. Any error messages from SQL Editor

---

## Quick Test: Can You Create ANY Bucket?

Try creating a test bucket via UI:
1. Go to Storage → New Bucket
2. Name: `test-bucket`
3. Private: Yes
4. Create it

**If this works:**
- Your permissions are OK
- The issue is specific to `medical-images`
- Try creating `medical-images` via UI

**If this doesn't work:**
- You have a permission issue
- Need to contact project owner
