# Image-Based Disease Detection Feature

## Overview
Added the ability for users to upload medical images (skin conditions, wounds, rashes, X-rays, etc.) and get AI-powered analysis to help identify potential diseases or conditions.

## Features Added

### 1. Image Upload UI
- Image upload button (📷 icon) in the chat input area
- Image preview before sending
- Support for all common image formats (JPG, PNG, GIF, etc.)
- File size validation (max 10MB)
- Image removal option before sending

### 2. Database Changes
- Added `image_url` column to `chat_history` table
- Created `medical-images` storage bucket in Supabase
- Set up Row Level Security (RLS) policies for private image storage
- Users can only access their own images

### 3. Image Analysis
- Integrated with Gemini Vision API via Edge Function
- AI analyzes images and provides:
  - Visual observations (color, texture, shape, size, location)
  - Potential condition matches
  - Recommendations for professional medical consultation
- Multi-language support (same languages as text chat)

### 4. Image Display
- Images are displayed inline in chat messages
- User images shown with their messages
- Images persist in chat history when logged in
- Responsive image display (max height: 256px)

## How to Use

### For Users:
1. Click the 📷 icon in the chat input area
2. Select an image file from your device
3. Optionally add a text description
4. Click Send
5. The AI will analyze the image and provide observations

### Setup Requirements:

1. **Run Database Migration**
   ```bash
   supabase migration up
   ```
   Or apply the migration manually in your Supabase dashboard:
   - File: `supabase/migrations/20260111000000_add_image_support.sql`

2. **Configure Storage Bucket** (if not created automatically)
   - Go to Supabase Dashboard → Storage
   - Verify `medical-images` bucket exists
   - Ensure RLS policies are applied

3. **Deploy Edge Function** (if modified)
   ```bash
   supabase functions deploy medical-chat
   ```

## Technical Details

### File Storage
- Images are stored in Supabase Storage bucket: `medical-images`
- Storage path format: `{user_id}/{timestamp}.{extension}`
- Private bucket with signed URLs (valid for 1 year)
- Each user can only access their own images

### API Integration
- Edge Function: `supabase/functions/medical-chat/index.ts`
- Uses Gemini 3 Flash Preview model with vision capabilities
- Supports both text-only and image+text messages
- Streaming responses for real-time analysis

### Message Format
- Text messages: `{ role: "user", content: "text" }`
- Image messages: `{ role: "user", content: "text", image_url: "https://..." }`
- Vision API format: Content array with text and image_url objects

## Security & Privacy

✅ **Private Storage**: Images stored in private bucket
✅ **User Isolation**: RLS policies ensure users only see their own images
✅ **Signed URLs**: Time-limited access URLs for image retrieval
✅ **Authentication Required**: Users must be logged in to upload images

## Important Disclaimers

⚠️ **Medical Disclaimer**: This feature provides informational observations only, NOT medical diagnoses. Always consult healthcare professionals for proper diagnosis and treatment.

⚠️ **Image Analysis Limitations**:
- AI analysis is preliminary and informational
- Not a replacement for professional medical evaluation
- Visual analysis may have limitations
- Always seek professional medical advice for visible conditions

## Supported Use Cases

- Skin condition analysis (rashes, moles, wounds)
- Visual symptom documentation
- Preliminary observations before doctor visits
- General health image questions
- Educational health image analysis

## Future Enhancements

Potential improvements:
- Image annotation tools
- Multiple image uploads
- Image comparison over time
- Integration with health records
- Export analysis reports

## Troubleshooting

### Images not uploading?
- Check if user is authenticated (sign in required)
- Verify Supabase storage bucket exists
- Check browser console for errors
- Ensure file size is under 10MB

### Images not displaying?
- Check if image_url is saved in database
- Verify signed URL is valid
- Check storage bucket RLS policies

### Analysis not working?
- Verify Edge Function is deployed
- Check LOVABLE_API_KEY is configured
- Ensure Gemini Vision API is accessible
- Check Edge Function logs for errors
