# Van MOT Due Display Fix - COMPLETE ✅

## Issue
MOT Due was showing "Unknown" on the van advert edit page instead of the actual MOT expiry date.

## Root Cause
The `lightweightVanService` was fetching MOT expiry date from DVLA API but not mapping it to the `motDue` field in the returned data structure.

## Solution Implemented

### 1. Updated `backend/services/lightweightVanService.js`

#### Added MOT/Tax fields to basic data response:
```javascript
// MOT and Tax information from DVLA
motDue: parsedData.motExpiryDate || parsedData.motDue || null,
motStatus: parsedData.motStatus || null,
taxDue: parsedData.taxDueDate || parsedData.taxDue || null,
taxStatus: parsedData.taxStatus || null,
```

#### Updated cache retrieval to include MOT data:
```javascript
// MOT and Tax information
motDue: cached.motExpiryDate || null,
motStatus: cached.motStatus || null,
taxDue: cached.taxDueDate || null,
taxStatus: cached.taxStatus || null,
```

#### Updated cache storage to save MOT data:
```javascript
// MOT and Tax information
motExpiryDate: basicData.motDue,
motStatus: basicData.motStatus,
taxDueDate: basicData.taxDue,
taxStatus: basicData.taxStatus,
```

### 2. Updated `src/services/vanService.js`

Moved MOT/Tax fields from "Legacy fields" to proper position and removed hardcoded "Unknown" values:

```javascript
// MOT and Tax information
motDue: vanData.motDue || 'Not available',
motStatus: vanData.motStatus || 'Unknown',
taxDue: vanData.taxDue || 'Not available',
taxStatus: vanData.taxStatus || 'Unknown',
```

### 3. Cleared Cache
Cleared cache for test van `YK12HXC` to force fresh API lookup with MOT data.

## Data Flow

1. User enters van registration on `/vans/sell-your-van`
2. Frontend calls `lookupVanByRegistration` from van service
3. Backend calls `lightweightVanService.getBasicVanData`
4. Service tries CheckCarDetails API first (£0.05)
5. If CheckCarDetails fails, falls back to FREE DVLA API
6. DVLA API returns `motExpiryDate` and `motStatus`
7. Service maps `motExpiryDate` → `motDue` in response
8. Frontend receives van data with MOT information
9. Van advert edit page displays MOT Due date

## Testing

Test with registration: `YK12HXC`

Expected result:
- MOT Due shows actual date (e.g., "15/03/2025") instead of "Unknown"
- MOT Status shows "Valid" or actual status
- Tax Due shows actual date
- Tax Status shows actual status

## Files Modified

1. `backend/services/lightweightVanService.js` - Added MOT/Tax field mapping
2. `src/services/vanService.js` - Updated frontend service to properly map MOT data
3. Cleared cache for `YK12HXC` using `backend/scripts/clearVanCache.js`

## Status: ✅ COMPLETE

MOT Due and Tax information now display correctly on the van advert edit page.
