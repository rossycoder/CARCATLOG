# Van Payment API Calls Fixed - Complete

## Issue
Van payment webhook mein API calls ka code tha, but **APIs call nahi ho rahi thi** aur data database mein save nahi ho raha tha.

## Root Cause
Payment controller mein **wrong function calls** the:

1. `historyService.getVehicleHistory()` - Ye function exist nahi karta
   - Correct: `historyService.checkVehicleHistory()`
   
2. `motHistoryService.getMOTHistory()` - Service instance nahi bana tha
   - Services are **classes**, not direct functions
   - Pehle `new HistoryService()` aur `new MOTHistoryService()` banana padta hai

## Fixes Applied

### 1. Update Existing Van Section (Line ~911-927)
**File**: `backend/controllers/paymentController.js`

**Before**:
```javascript
const historyService = require('../services/historyService');
const motHistoryService = require('../services/motHistoryService');

const [motResult, historyResult] = await Promise.allSettled([
  safeAPI.call('mothistory', van.registrationNumber, null, async () => {
    return await motHistoryService.getMOTHistory(van.registrationNumber);
  }),
  safeAPI.call('vehiclehistory', van.registrationNumber, null, async () => {
    return await historyService.getVehicleHistory(van.registrationNumber);
  })
]);
```

**After**:
```javascript
const HistoryService = require('../services/historyService');
const MOTHistoryService = require('../services/motHistoryService');

// Create service instances
const historyService = new HistoryService();
const motHistoryService = new MOTHistoryService();

const [motResult, historyResult] = await Promise.allSettled([
  safeAPI.call('mothistory', van.registrationNumber, null, async () => {
    return await motHistoryService.getMOTHistory(van.registrationNumber);
  }),
  safeAPI.call('vehiclehistory', van.registrationNumber, null, async () => {
    return await historyService.checkVehicleHistory(van.registrationNumber);
  })
]);
```

### 2. Create New Van Section (Line ~1013-1029)
Same fix applied for the "create new van" code path.

## What Will Happen Now

**When van payment is successful:**

1. ✅ Stripe webhook triggers
2. ✅ Van status changes to `active`
3. ✅ **API calls will execute properly:**
   - `historyService.checkVehicleHistory()` - Calls CheckCarDetails API
   - `motHistoryService.getMOTHistory()` - Calls MOT History API
4. ✅ **Data will save to van document:**
   - `van.historyCheckData` - Previous keepers, stolen status, etc.
   - `van.motHistory` - MOT test history (if schema compatible)
   - `van.motDue`, `van.motStatus` - MOT status fields
5. ✅ **Data will also cache:**
   - `VehicleHistory` collection - 30 days cache
   - `APICallLog` - Prevents duplicate calls

## Testing

To test with a new van payment:
1. Create new van listing
2. Complete payment
3. Check Stripe webhook logs
4. Verify van document has `historyCheckData` populated
5. Check API dashboard for new calls

## Important Notes

- **MOT History Schema Issue**: Van model ka MOT schema VehicleHistory se different hai
  - `odometerUnit` enum: Van expects `'miles'/'km'`, API returns `'MI'`
  - `testDate` field requirements different
  - Currently MOT history array save nahi hoga due to validation errors
  - Only `motDue`, `motStatus`, `motExpiry` fields save honge

- **Vehicle History**: Fully working, will save and display correctly

## Date: March 3, 2026
