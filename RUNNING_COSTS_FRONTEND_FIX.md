# Running Costs Frontend Display Fix

## Problem
Running costs fields are empty on frontend even though data is coming from API.

## Console Logs Analysis
From your console logs:
```
🏃 Running costs in clean data: Object
🏃 Updating running costs from enhanced data: Object
🏃 New running costs to set: Object
```

This shows:
- ✅ Data is coming from backend API
- ✅ Frontend is receiving the data
- ✅ Frontend is trying to update the form
- ❌ But form fields are still empty

## Root Cause
The data is being received but the values inside the `runningCosts` object are likely `null` or `undefined` because:

1. **API Response Structure**: The `enhancedVehicleLookup` endpoint returns running costs in this structure:
```javascript
runningCosts: {
  fuelEconomy: {
    urban: value,
    extraUrban: value,
    combined: value
  },
  co2Emissions: value,
  insuranceGroup: value,
  annualTax: value
}
```

2. **Data Flow**: 
   - Backend fetches from `universalService.getVehicleData()`
   - Data gets structured in `enhancedVehicleLookup` controller
   - Data gets unwrapped by `unwrapVehicleData()` method
   - Frontend receives and tries to populate form

## Solution Steps

### Step 1: Verify Backend is Returning Data ✅

Added console log in `vehicleController.js` line 1707:
```javascript
console.log('🏃 [Vehicle Controller] Unwrapped runningCosts:', JSON.stringify(unwrapped.runningCosts, null, 2));
```

This will show exactly what's being sent to frontend.

### Step 2: Check What Frontend is Receiving

In browser console, look for:
```
🏃 Running costs in clean data: Object
```

Click on "Object" to expand and see actual values. If values are null, then backend is not returning data.

### Step 3: Verify Database Has Data

Run this test:
```bash
cd backend
node test-running-costs-display.js
```

This will show if cars in database have running costs data.

### Step 4: If Database is Empty, Update Existing Cars

The issue is that existing cars in database don't have running costs because:
- They were added before the fix
- API didn't return running costs at that time
- Or parser wasn't extracting running costs

**Solution**: Re-fetch data for existing cars:

```javascript
// In backend, create a script to update existing cars
const Car = require('./models/Car');
const UniversalAutoCompleteService = require('./services/universalAutoCompleteService');

async function updateExistingCars() {
  const service = new UniversalAutoCompleteService();
  const cars = await Car.find({ 'runningCosts.combinedMpg': null });
  
  for (const car of cars) {
    try {
      const data = await service.fetchCompleteVehicleData(car.registrationNumber);
      
      // Update running costs
      car.runningCosts = {
        fuelEconomy: {
          urban: data.urbanMpg,
          extraUrban: data.extraUrbanMpg,
          combined: data.combinedMpg
        },
        co2Emissions: data.co2Emissions,
        insuranceGroup: data.insuranceGroup,
        annualTax: data.annualTax
      };
      
      await car.save();
      console.log(`✅ Updated ${car.registrationNumber}`);
    } catch (error) {
      console.error(`❌ Failed to update ${car.registrationNumber}:`, error.message);
    }
  }
}
```

## Quick Fix for Testing

To test if the form works with data, manually add running costs in browser console:

```javascript
// In browser console on CarAdvertEditPage
setAdvertData(prev => ({
  ...prev,
  runningCosts: {
    fuelEconomy: {
      urban: '37.2',
      extraUrban: '57.7',
      combined: '47.9'
    },
    annualTax: '180',
    insuranceGroup: '25E',
    co2Emissions: '156'
  }
}));
```

If fields populate, then the issue is backend data, not frontend code.

## Expected Behavior After Fix

1. **Backend logs** should show:
```
🏃 [Vehicle Controller] Unwrapped runningCosts: {
  "fuelEconomy": {
    "urban": 37.2,
    "extraUrban": 57.7,
    "combined": 47.9
  },
  "co2Emissions": 156,
  "insuranceGroup": "25E",
  "annualTax": 180
}
```

2. **Frontend logs** should show:
```
🏃 Running costs in clean data: {
  fuelEconomy: { urban: 37.2, extraUrban: 57.7, combined: 47.9 },
  co2Emissions: 156,
  insuranceGroup: "25E",
  annualTax: 180
}
```

3. **Form fields** should be populated with values

## Files Modified

1. ✅ `backend/utils/apiResponseParser.js` - Prioritize SmmtDetails
2. ✅ `backend/services/universalAutoCompleteService.js` - Extract from SmmtDetails
3. ✅ `backend/controllers/vehicleController.js` - Added debug logging

## Next Steps

1. **Restart backend server** (IMPORTANT!)
2. **Check backend console** for the new log: `🏃 [Vehicle Controller] Unwrapped runningCosts:`
3. **Check browser console** to see what data frontend is receiving
4. **If data is null**, run the database test to see if cars have running costs
5. **If database is empty**, either:
   - Add a new car (will fetch fresh data)
   - Or run update script to refresh existing cars

## Status

- ✅ Parser fixed to use SmmtDetails
- ✅ Service fixed to extract running costs
- ✅ Controller fixed to structure data properly
- ⏳ Waiting for backend restart and testing
- ⏳ May need to update existing cars in database

## Testing

After backend restart:
1. Go to car advert edit page
2. Open browser console
3. Look for running costs logs
4. Check if form fields are populated
5. If not, check backend console for the unwrapped data

If backend shows data but frontend doesn't, then there's a frontend issue.
If backend shows null, then database needs updating.
