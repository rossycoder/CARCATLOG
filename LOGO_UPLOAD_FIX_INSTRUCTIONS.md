# Logo Upload Fix - Instructions

## Problem
Logo uploads were failing because the frontend was sending `Content-Type: application/json` header with FormData, which prevented the backend from receiving the file correctly.

## Fix Applied
Updated `src/services/api.js` to automatically remove the `Content-Type` header when sending FormData, allowing the browser to set the correct `multipart/form-data` header with boundary.

## Testing Results
✅ Backend test: Logo upload works correctly (test script confirmed)
✅ Direct API test: Successfully uploaded logo via API
❌ Frontend: Needs to apply the updated code

## How to Apply the Fix

### Option 1: If Running Development Server
1. Stop the current dev server (Ctrl+C)
2. Restart it:
   ```bash
   npm run dev
   ```
3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Clear browser cache if needed

### Option 2: If Using Production Build
1. Rebuild the frontend:
   ```bash
   npm run build
   ```
2. Restart your server
3. Clear browser cache

### Option 3: Quick Test Without Rebuild
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear all site data
4. Hard refresh (Ctrl+Shift+R)

## How to Test
1. Go to trade registration page: `/trade/register`
2. Fill in all required fields
3. **Click on the logo upload area**
4. **Select an actual image file** (PNG, JPG, etc.)
5. You should see a preview of the image
6. Complete registration
7. Check the database - logo field should have a Cloudinary URL

## Verification Script
Run this to check if logos are being saved:
```bash
node backend/scripts/testLogoUploadFlow.js
```

## What Was Changed
**File:** `src/services/api.js`

**Change:**
```javascript
// Added this check in the request interceptor:
if (config.data instanceof FormData) {
  delete config.headers['Content-Type'];
}
```

This ensures that when FormData is sent, the browser automatically sets the correct `Content-Type: multipart/form-data; boundary=...` header.

## Expected Behavior After Fix
- ✅ Logo preview shows in registration form
- ✅ Logo uploads to Cloudinary
- ✅ Logo URL saved in database
- ✅ Logo displays on dealer dashboard
- ✅ Logo displays on vehicle listings

## Troubleshooting
If logo still shows as `null`:
1. Check browser console for errors
2. Check network tab - look for the `/trade/auth/register` request
3. Verify the request has `Content-Type: multipart/form-data` header
4. Verify the FormData contains the logo file
5. Check backend logs for Cloudinary upload errors
