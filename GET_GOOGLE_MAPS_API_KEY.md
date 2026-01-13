# Step-by-Step: Get Google Maps API Key

Follow these exact steps to get your Google Maps API key:

---

## Step 1: Go to Google Cloud Console

1. **Open your browser** and go to:
   ```
   https://console.cloud.google.com/
   ```

2. **Sign in** with your Google account
   - If you don't have a Google account, create one first

---

## Step 2: Create or Select a Project

1. **At the top of the page**, click the project dropdown (it might say "Select a project" or show a project name)

2. **Click "New Project"** (or select an existing project if you have one)

3. **Fill in project details:**
   - **Project name**: `Arogya Mitra` (or any name you like)
   - **Organization**: Leave as default (if shown)
   - **Location**: Leave as default

4. **Click "Create"**

5. **Wait a few seconds** for the project to be created

6. **Select your new project** from the dropdown at the top

---

## Step 3: Enable Required APIs

1. **Click the hamburger menu** (☰) in the top left

2. **Go to "APIs & Services" → "Library"**

3. **Search for and enable these APIs one by one:**

   ### a) Maps JavaScript API
   - Search: `Maps JavaScript API`
   - Click on it
   - Click **"Enable"** button
   - Wait for it to enable

   ### b) Places API
   - Go back to "Library"
   - Search: `Places API`
   - Click on it
   - Click **"Enable"** button
   - Wait for it to enable

   ### c) Geocoding API (Optional but recommended)
   - Go back to "Library"
   - Search: `Geocoding API`
   - Click on it
   - Click **"Enable"** button

---

## Step 4: Create API Key

1. **Go to "APIs & Services" → "Credentials"** (from the left menu)

2. **Click the "+ CREATE CREDENTIALS" button** at the top

3. **Select "API key"** from the dropdown

4. **Your API key will be created!** 
   - A popup will show your API key
   - **COPY IT NOW** - it looks like: `AIzaSy...` (long string)

5. **Click "Close"** on the popup

---

## Step 5: (Optional but Recommended) Restrict API Key

**Important**: Restricting your API key prevents unauthorized use and saves money.

1. **In the Credentials page**, click on your newly created API key

2. **Under "API restrictions":**
   - Select **"Restrict key"**
   - Check these boxes:
     - ✅ Maps JavaScript API
     - ✅ Places API
     - ✅ Geocoding API (if you enabled it)

3. **Under "Application restrictions":**
   - Select **"HTTP referrers (web sites)"**
   - Click **"Add an item"**
   - Add these (one per line):
     ```
     http://localhost:*
     http://localhost:5173/*
     http://localhost:3000/*
     https://yourdomain.com/*
     ```
   - Replace `yourdomain.com` with your actual domain when you deploy

4. **Click "Save"** at the bottom

---

## Step 6: Add API Key to Your Project

1. **Open your project folder** in a code editor

2. **Create or edit `.env` file** in the root directory:
   - If `.env` doesn't exist, create it
   - If it exists, open it

3. **Add this line:**
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your_actual_key_here
   ```
   - Replace `AIzaSy...your_actual_key_here` with your actual API key

4. **Save the file**

---

## Step 7: Restart Your Dev Server

1. **Stop your dev server** (if running):
   - Press `Ctrl + C` in the terminal

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **The API key will now be loaded!**

---

## Step 8: Test the Feature

1. **Open your app** in the browser (usually `http://localhost:5173`)

2. **Click the "Hospitals" button** in the header

3. **Allow location access** when your browser asks

4. **You should see:**
   - A map loading
   - Your location marker (blue dot)
   - Nearby hospitals (red markers)
   - A list of hospitals on the right

---

## Troubleshooting

### "API key not valid"
- Make sure you copied the entire API key
- Check for extra spaces in `.env` file
- Restart dev server after adding key

### "This API project is not authorized"
- Make sure you enabled the APIs (Step 3)
- Wait a few minutes after enabling (sometimes takes time)

### "RefererNotAllowedMapError"
- Your API key restrictions are too strict
- Go to API key settings and add `http://localhost:*` to referrers
- Or temporarily remove restrictions for testing

### "Location access denied"
- Click the lock icon in your browser address bar
- Allow location permissions
- Or manually allow in browser settings

### Map shows but no hospitals
- Check browser console for errors (F12)
- Make sure Places API is enabled
- Verify your location is accurate

---

## Billing Information

### Free Tier:
- **$200 free credit per month**
- Covers approximately:
  - 28,000 map loads
  - 40,000 place searches

### Typical Costs (after free tier):
- Map loads: ~$7 per 1,000
- Place searches: ~$17 per 1,000

### For Most Apps:
- Free tier is sufficient for development and small apps
- You'll only pay if you exceed $200/month usage

---

## Security Best Practices

1. **Always restrict your API key** (Step 5)
2. **Never commit `.env` file to Git**
3. **Use different keys for development and production**
4. **Monitor usage** in Google Cloud Console
5. **Set up billing alerts** to avoid surprises

---

## Quick Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Maps JavaScript API
- [ ] Enabled Places API
- [ ] Created API key
- [ ] (Optional) Restricted API key
- [ ] Added key to `.env` file
- [ ] Restarted dev server
- [ ] Tested the feature

---

## Need Help?

If you encounter any issues:
1. Check browser console (F12) for errors
2. Verify API key is correct in `.env`
3. Make sure APIs are enabled
4. Check Google Cloud Console for any error messages

---

**You're all set!** Once you complete these steps, the Google Maps feature will work perfectly! 🎉
