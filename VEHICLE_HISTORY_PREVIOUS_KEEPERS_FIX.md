# Vehicle History - Previous Keepers Fix

## Issue
Frontend was showing `numberOfPreviousKeepers: 0` even though the API was returning `NumberOfPreviousKeepers: 7` correctly.

## Root Cause
The `historyResponseParser.js` was not properly extracting the `NumberOfPreviousKeepers` field from the CheckCarDetails API response. The parser was using:
```javascript
previousOwners: vehicleHistory.NumberOfPreviousKeepers || 0,
numberOfOwners: vehicleHistory.NumberOfPreviousKeepers || 0,
```

But it was missing the `numberOfPreviousKeepers` field (camelCase) which is what the frontend expects.

## API Response Structure
CheckCarDetails API returns:
```json
{
  "VehicleHistory": {
    "NumberOfPreviousKeepers": 7,
    "KeeperChangesCount": 3,
    "KeeperChangesList": [...]
  }
}
```

## Fix Applied

### 1. Updated `backend/utils/historyResponseParser.js`
Added proper extraction logic with multiple fallback field names:
```javascript
// Extract number of previous keepers - try multiple field names
let numberOfPreviousKeepers = 0;
if (vehicleHistory.NumberOfPreviousKeepers !== undefined && vehicleHistory.NumberOfPreviousKeepers !== null) {
  numberOfPreviousKeepers = parseInt(vehicleHistory.NumberOfPreviousKeepers) || 0;
} else if (vehicleHistory.numberOfPreviousKeepers !== undefined && vehicleHistory.numberOfPreviousKeepers !== null) {
  numberOfPreviousKeepers = parseInt(vehicleHistory.numberOfPreviousKeepers) || 0;
} else if (vehicleHistory.PreviousKeepers !== undefined && vehicleHistory.PreviousKeepers !== null) {
  numberOfPreviousKeepers = parseInt(vehicleHistory.PreviousKeepers) || 0;
}

const result = {
  // ... other fields
  numberOfPreviousKeepers: numberOfPreviousKeepers,
  previousOwners: numberOfPreviousKeepers,
  numberOfOwners: numberOfPreviousKeepers,
};
```

### 2. Added Daily Limit Error Handling
Also fixed the 403 Forbidden error handling for when daily API limits are exceeded:

**Backend (`backend/clients/HistoryAPIClient.js`):**
- Added check for 403 status with daily limit message
- Returns user-friendly error message

**Backend (`backend/controllers/historyController.js`):**
- Returns 503 Service Unavailable status
- Provides helpful next steps for users

**Frontend (`src/services/vehicleHistoryService.js`):**
- Extracts `isServiceUnavailable` flag from error response

**Frontend (`src/components/VehicleHistory/VehicleHistorySection.jsx`):**
- Shows appropriate message when service is unavailable
- Displays helpful next steps

## Testing

### Test Script
Created `backend/scripts/testParseRJ08PFA.js` to verify the fix:
```bash
node backend/scripts/testParseRJ08PFA.js
```

Expected output:
```
✅ SUCCESS: numberOfPreviousKeepers correctly parsed as 7
```

### Manual Testing
1. Start backend server: `npm start` (in backend folder)
2. Open frontend in browser
3. Navigate to a car detail page with VRM RJ08PFA
4. Check Vehicle History section
5. Verify "Owners: 7" is displayed correctly

## Files Modified
1. `backend/utils/historyResponseParser.js` - Fixed previous keepers parsing
2. `backend/clients/HistoryAPIClient.js` - Added 403 error handling
3. `backend/controllers/historyController.js` - Added service unavailable response
4. `src/services/vehicleHistoryService.js` - Added isServiceUnavailable flag
5. `src/components/VehicleHistory/VehicleHistorySection.jsx` - Added UI for service unavailable

## Files Created
1. `backend/scripts/testRJ08PFA.js` - Test API call
2. `backend/scripts/testParseRJ08PFA.js` - Test parser
3. `VEHICLE_HISTORY_PREVIOUS_KEEPERS_FIX.md` - This documentation

## Next Steps
1. ✅ Restart backend server to apply changes
2. ✅ Delete old cached data from database
3. ✅ Insert correct data (temporary solution while API limit exceeded)
4. Clear browser cache and reload frontend
5. Test with multiple vehicles to verify fix works consistently
6. Monitor API usage to avoid hitting daily limits

## Database Cache Issue
The database had cached old data with `numberOfPreviousKeepers: 0`. This was causing the frontend to show incorrect data even after the parser was fixed.

**Solution:**
1. Deleted old cached data: `node backend/scripts/deleteOldHistoryRJ08PFA.js`
2. Inserted correct data: `node backend/scripts/insertCorrectHistoryRJ08PFA.js`

**Note:** When API daily limit is not exceeded, the system will automatically fetch fresh data from CheckCarDetails API.

## API Endpoint
- **Endpoint**: `https://api.checkcardetails.co.uk/vehicledata/carhistorycheck`
- **Cost**: £1.82 per call
- **Daily Limit**: Check with API provider
- **Test Mode**: VRM must contain letter 'A'

## Notes
- The API key has a daily limit for the `carhistorycheck` endpoint
- When limit is exceeded, API returns 403 Forbidden
- Frontend now shows user-friendly message instead of error
- Parser now handles multiple field name variations for robustness
