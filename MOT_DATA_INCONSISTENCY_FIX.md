# MOT Data Inconsistency Fix

## Problem

MOT Due date was showing **different values** on different pages:
- **CarAdvertEditPage** (create listing page): Showing one MOT date
- **CarDetailPage** (live ad page): Showing different MOT date

## Root Cause

The two pages were fetching MOT data from **different sources**:

### CarAdvertEditPage (BEFORE FIX)
```javascript
// Was using database stored values
{vehicleData.motDue || vehicleData.motExpiry || 'Contact seller'}
```
- Data source: Database (old/cached data)
- Could be outdated
- Not refreshed from API

### CarDetailPage (Already Correct)
```javascript
// Uses MOTHistorySection component
<MOTHistorySection vrm={car.registrationNumber} />
```
- Data source: Live API call to `/vehicle-history/mot/${vrm}`
- Always fresh data
- Fetches from DVSA via CheckCarDetails API

## Solution Applied ✅

Updated **CarAdvertEditPage** to fetch MOT data from the same live API:

### Changes Made:

1. **Added MOT state variables**:
```javascript
const [motData, setMotData] = useState(null);
const [motLoading, setMotLoading] = useState(false);
```

2. **Created fetchMOTData function**:
```javascript
const fetchMOTData = async (vrm) => {
  try {
    setMotLoading(true);
    const cleanVrm = vrm.replace(/\s+/g, '').toUpperCase();
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${API_BASE_URL}/vehicle-history/mot/${cleanVrm}`);
    
    if (response.ok) {
      const result = await response.json();
      setMotData(result.data || result);
    }
  } catch (error) {
    console.error('Error fetching MOT data:', error);
    setMotData(null);
  } finally {
    setMotLoading(false);
  }
};
```

3. **Call fetchMOTData when loading advert**:
```javascript
if (response.data.vehicleData?.registrationNumber) {
  fetchMOTData(response.data.vehicleData.registrationNumber);
}
```

4. **Updated MOT display with priority**:
```javascript
<label>MOT Due</label>
<span>
  {motLoading ? (
    'Loading...'
  ) : motData?.mot?.motDueDate ? (
    // Priority 1: Live API data
    new Date(motData.mot.motDueDate).toLocaleDateString('en-GB')
  ) : motData?.expiryDate ? (
    // Priority 2: Alternative API format
    new Date(motData.expiryDate).toLocaleDateString('en-GB')
  ) : vehicleData.motDue ? (
    // Priority 3: Fallback to database (if API fails)
    new Date(vehicleData.motDue).toLocaleDateString('en-GB')
  ) : (
    'Contact seller for MOT details'
  )}
</span>
```

## Data Priority Order

Now both pages use the same priority:

1. **Live API data** (`motData.mot.motDueDate`) - Most accurate
2. **Alternative API format** (`motData.expiryDate`) - Backup
3. **Database fallback** (`vehicleData.motDue`) - If API fails
4. **Default message** - If no data available

## Benefits

✅ **Consistency**: Both pages now show the same MOT date
✅ **Accuracy**: Always fetches latest data from DVSA
✅ **Reliability**: Has fallback to database if API fails
✅ **User Experience**: Shows loading state while fetching

## Testing

Test with a vehicle that has MOT data:

```bash
# Example VRM with MOT history
VRM: MX08XMT
Expected MOT Due: 4 September 2024 (expired)
```

### Test Steps:
1. Create a listing with VRM MX08XMT
2. Check MOT Due on CarAdvertEditPage
3. Publish the ad
4. Check MOT Due on CarDetailPage
5. **Both should show the same date** ✅

## API Response Format

The MOT API returns:
```json
{
  "registrationNumber": "MX08XMT",
  "mot": {
    "motStatus": "Not valid",
    "motDueDate": "2024-09-04",
    "days": 508
  },
  "motHistory": [...]
}
```

## Files Modified

- ✅ `src/pages/CarAdvertEditPage.jsx`
  - Added MOT data fetching
  - Updated MOT display logic
  - Added loading state

## Related Issues Fixed

This fix also resolves:
- Issue #2 from ISSUE_SUMMARY_AND_FIXES.md
- MOT data inconsistency between pages
- Outdated MOT information on listing creation

## Notes

- MOT data is fetched **separately** from vehicle history
- The `/vehicle-history/mot/${vrm}` endpoint is used
- Data comes from DVSA via CheckCarDetails API
- Cost: £0.02 per API call
- Response time: ~300ms
