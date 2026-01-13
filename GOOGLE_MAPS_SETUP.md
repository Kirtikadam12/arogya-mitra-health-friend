# Google Maps - Nearby Hospitals Feature Setup

## ✅ Feature Added!

A Google Maps feature has been added to show nearby hospitals to users.

### Features:
- 📍 **Automatic location detection** - Gets user's current location
- 🏥 **Finds nearby hospitals** - Shows hospitals within 10km radius
- 🗺️ **Interactive map** - Displays hospitals on Google Maps
- 📋 **Hospital list** - Shows details: name, address, distance, rating
- 🧭 **Get directions** - Opens Google Maps with directions
- 📞 **Call hospital** - Direct call button for each hospital
- 🔄 **Refresh** - Update hospital list anytime

---

## Setup Instructions

### Step 1: Get Google Maps API Key

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a new project** (or select existing)

3. **Enable APIs:**
   - Go to "APIs & Services" → "Library"
   - Enable these APIs:
     - ✅ **Maps JavaScript API**
     - ✅ **Places API**
     - ✅ **Geocoding API** (optional, for better address handling)

4. **Create API Key:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key

5. **Restrict API Key (Recommended for Production):**
   - Click on the API key to edit
   - Under "API restrictions", select:
     - Maps JavaScript API
     - Places API
   - Under "Application restrictions", add your domain

---

### Step 2: Add API Key to Project

1. **Create or edit `.env` file** in project root:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

---

### Step 3: Test the Feature

1. **Click "Hospitals" button** in the header
2. **Allow location access** when prompted
3. **See nearby hospitals** on the map and in the list
4. **Click "Directions"** to get directions
5. **Click phone icon** to call a hospital

---

## How It Works

### User Flow:
1. User clicks "Hospitals" button in header
2. Browser requests location permission
3. App gets user's current location (lat/lng)
4. Google Places API searches for hospitals within 10km
5. Results displayed on map with markers
6. List shows hospitals sorted by distance
7. User can get directions or call hospitals

### Features:
- **Map View**: Interactive Google Map with markers
- **Hospital Markers**: Red markers for hospitals, blue for user location
- **Info Windows**: Click markers to see hospital details
- **Distance Calculation**: Shows distance from user to each hospital
- **Ratings**: Displays Google ratings and review counts
- **Phone Numbers**: Shows contact numbers when available

---

## API Requirements

### Required APIs:
- **Maps JavaScript API** - For displaying the map
- **Places API** - For finding nearby hospitals

### Billing:
- Google Maps offers **$200 free credit per month**
- This covers approximately:
  - 28,000 map loads
  - 40,000 place searches
- For most apps, this is sufficient for free tier

---

## Component Structure

### Files Created:
- `src/components/NearbyHospitals.tsx` - Main component

### Files Modified:
- `src/components/Header.tsx` - Added Hospitals button
- `src/pages/Index.tsx` - Integrated hospital finder

---

## Usage

### In Header:
- "Hospitals" button appears next to Emergency button
- Clicking opens the hospital finder dialog

### In Dialog:
- **Left side**: Interactive Google Map
- **Right side**: List of nearby hospitals
- **Features**:
  - Auto-searches when opened
  - Shows distance, rating, address
  - Directions and call buttons

---

## Without API Key

If API key is not configured:
- Component shows helpful error message
- Instructs user to add `VITE_GOOGLE_MAPS_API_KEY` to `.env`
- Feature gracefully degrades

---

## Customization

### Change Search Radius:
Edit in `NearbyHospitals.tsx`:
```typescript
radius: 10000, // Change to desired radius in meters
```

### Change Number of Results:
```typescript
.slice(0, 10) // Change 10 to desired number
```

### Change Map Zoom:
```typescript
zoom: 13, // Adjust zoom level (1-20)
```

---

## Troubleshooting

### "Google Maps API key not configured"
- Add `VITE_GOOGLE_MAPS_API_KEY` to `.env` file
- Restart dev server

### "Location access denied"
- User needs to allow location permission
- Check browser settings

### "No hospitals found"
- Try increasing search radius
- Check if location is accurate
- Verify Places API is enabled

### Map not loading
- Check API key is correct
- Verify Maps JavaScript API is enabled
- Check browser console for errors

---

## Security Notes

- **API Key Restrictions**: Always restrict your API key in production
- **Domain Restrictions**: Add your domain to prevent unauthorized use
- **API Restrictions**: Limit to only required APIs (Maps, Places)

---

## Cost Estimation

For a typical app:
- **Map loads**: ~$7 per 1,000 loads
- **Place searches**: ~$17 per 1,000 searches
- **Free tier**: $200/month credit
- **Estimated usage**: 2,000-5,000 users/month = Free tier sufficient

---

## Next Steps

1. **Get Google Maps API key**
2. **Add to `.env` file**
3. **Restart dev server**
4. **Test the feature!**

The feature is ready to use once you add the API key! 🎉
