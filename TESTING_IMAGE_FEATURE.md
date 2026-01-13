# How to Test the Image Detection Feature

## Quick Start - See the Changes

### Step 1: Start the Development Server

The dev server should already be starting. Once it's running, you'll see:
```
  VITE v7.3.1  ready in XXX ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
```

### Step 2: Open Your Browser

1. Open your browser and go to: **http://localhost:8080/**
2. You should see your Arogya Mitra app

### Step 3: Look for the Image Upload Button

In the chat interface, you'll see:
- ✅ **Image Icon (📷)** - A new button next to the text input area
- ✅ **Updated placeholder text** - "Type your health question or upload an image..."
- ✅ **Image preview area** - Shows preview when you select an image

### Step 4: Test Image Upload (Without Authentication)

**Note:** You need to be signed in to upload images. If you're not signed in:
- Click the image button
- You'll get a toast notification: "Authentication required - Please sign in to upload images"

### Step 5: Test with Authentication

1. **Sign in** to your app (use EmailAuth component if available)
2. **Click the Image Icon** (📷) in the chat input
3. **Select an image file** (JPG, PNG, etc.)
4. **See the preview** - Image appears above the input with an X button to remove
5. **Add optional text** - You can type a description or just send the image
6. **Click Send** - Image uploads and AI analyzes it

## What You Should See

### In the UI:
1. **Image Upload Button**: 📷 icon button next to text input
2. **Image Preview**: Shows selected image before sending (with remove option)
3. **Images in Chat**: Uploaded images display inline in chat messages
4. **Loading States**: Spinner while image uploads and AI processes

### Expected Behavior:

#### Without Supabase Setup:
- App runs in "mock mode"
- Image upload shows: "Authentication required" if not signed in
- If signed in but no Supabase: Shows message about configuring environment variables

#### With Supabase Setup:
- Image uploads to Supabase Storage
- Image URL sent to AI for analysis
- AI provides disease/condition analysis based on the image
- Image and analysis saved in chat history

## Visual Changes to Look For

### Before (Old ChatBox):
- Only text input area
- Send button
- No image upload capability

### After (New ChatBox):
- ✅ Image icon button (📷) - LEFT side of input area
- ✅ Image preview - Shows above input when image selected
- ✅ Updated placeholder - Mentions "upload an image"
- ✅ Images in messages - Display inline with chat messages
- ✅ Upload progress - Spinner while uploading

## Testing Checklist

- [ ] Dev server is running (http://localhost:8080)
- [ ] Image button (📷) is visible in chat input
- [ ] Can click image button and select a file
- [ ] Image preview appears after selection
- [ ] Can remove image preview (X button)
- [ ] Sign in to enable upload
- [ ] Upload an image and see it in chat
- [ ] AI analyzes the image (if Supabase is configured)
- [ ] Image persists in chat history after refresh

## Troubleshooting

### "Cannot see image button"
- Make sure you've saved all files
- Check browser console for errors
- Restart dev server: `npm run dev`

### "Authentication required" message
- This is expected! You need to sign in first
- Check if EmailAuth or PhoneAuth component is available
- Create an account or sign in

### "Upload failed" error
- Check Supabase credentials in `.env` file
- Verify storage bucket `medical-images` exists
- Check browser console for detailed error

### Images not displaying
- Check if image_url is saved in database
- Verify signed URL is valid
- Check browser network tab for image requests

## Next Steps After Testing

1. **Run Database Migration** (if not done):
   ```bash
   supabase migration up
   ```

2. **Deploy Edge Function** (if Supabase is set up):
   ```bash
   supabase functions deploy medical-chat
   ```

3. **Configure Environment Variables** (if needed):
   Create `.env` file with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_key
   ```
