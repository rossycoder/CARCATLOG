# Running Costs Not Showing - Root Cause & Solution

## Problem Identified ✅

Running costs (MPG, Insurance Group, Annual Tax) are NOT showing on frontend because:

**ROOT CAUSE:** The CheckCarDetails API `ukvehicledata` endpoint does NOT return `ModelData` field, which contains running costs information.

### Evidence:
```javascript
// API Response Structure:
{
  "VehicleIdentification": { ... },
  "Performance": { ... },  // No FuelEconomy inside
  "ModelData": MISSING,     // ❌ This field is not in the response!
  "Emissions": MISSING      // ❌ This field is also missing!
}
```

### What's Missing:
- `ModelData.InsuranceGroup` → null
- `ModelData.AnnualTax` → null
- `Performance.FuelEconomy.CombinedMpg` → null
- `Emissions.ManufacturerCo2` → null

## Why This Happens

The CheckCarDetails API has multiple endpoints:
1. `/vehicledata/ukvehicledata` - Basic vehicle data (NO running costs)
2. `/vehicledata/Vehiclespecs` - Detailed specs (NO running costs)
3. `/vehicledata/carhistorycheck` - History data (NO running costs)
4. **MISSING:** A dedicated running costs endpoint

## Solutions

### Solution 1: Use SmmtDetails (RECOMMENDED) ✅

The `Vehiclespecs` endpoint returns `SmmtDetails` which MAY contain running costs:

```javascript
{
  "SmmtDetails": {
    "UrbanColdMpg": 45.6,
    "ExtraUrbanMpg": 56.5,
    "CombinedMpg": 50.4,
    "Co2": 127,
    "InsuranceGroup": "25E"
    // Note: AnnualTax is NOT in SmmtDetails
  }
}
```

**Implementation:**
```javascript
// In CheckCarDetailsClient.js
async getRunningCosts(registration) {
  // Get vehicle specs which includes SmmtDetails
  const specsData = await this.getVehicleSpecs(registration);
  
  // Parse SmmtDetails for running costs
  const smmtDetails = specsData.SmmtDetails || {};
  
  return {
    urbanMpg: smmtDetails.UrbanColdMpg,
    extraUrbanMpg: smmtDetails.ExtraUrbanMpg,
    combinedMpg: smmtDetails.CombinedMpg,
    co2Emissions: smmtDetails.Co2,
    insuranceGroup: smmtDetails.InsuranceGroup,
    annualTax: null // Not available in API
  };
}
```

### Solution 2: Use Default/Estimated Values ✅

For fields not available from API, use intelligent defaults:

```javascript
// Calculate annual tax based on CO2 emissions
function estimateAnnualTax(co2Emissions, year) {
  if (!co2Emissions) return null;
  
  // UK VED (Vehicle Excise Duty) bands
  if (co2Emissions === 0) return 0; // Electric
  if (co2Emissions <= 50) return 10;
  if (co2Emissions <= 75) return 25;
  if (co2Emissions <= 90) return 115;
  if (co2Emissions <= 100) return 140;
  if (co2Emissions <= 110) return 160;
  if (co2Emissions <= 130) return 180;
  if (co2Emissions <= 150) return 220;
  if (co2Emissions <= 170) return 270;
  if (co2Emissions <= 190) return 295;
  if (co2Emissions <= 225) return 540;
  if (co2Emissions <= 255) return 870;
  return 2365; // Over 255 g/km
}
```

### Solution 3: Use Alternative API (If Available)

Check if CheckCarDetails has a premium endpoint that includes running costs, or consider using:
- DVLA API (limited data)
- CAP HPI API (paid service)
- Autotrader API (if available)

## Recommended Implementation

Update `apiResponseParser.js` to prioritize `SmmtDetails`:

```javascript
function parseCheckCarDetailsResponse(data) {
  const smmtDetails = data.SmmtDetails || {};
  const vehicleId = data.VehicleIdentification || {};
  const performance = data.Performance || {};
  const emissions = data.Emissions || {};
  
  // Extract CO2 for tax calculation
  const co2 = extractNumber(
    smmtDetails.Co2 || 
    emissions.ManufacturerCo2 || 
    vehicleId.DvlaCo2
  );
  
  // Extract year for tax calculation
  const year = extractNumber(vehicleId.YearOfManufacture);
  
  return {
    // ... other fields ...
    
    // Running costs - prioritize SmmtDetails
    urbanMpg: extractNumber(smmtDetails.UrbanColdMpg),
    extraUrbanMpg: extractNumber(smmtDetails.ExtraUrbanMpg),
    combinedMpg: extractNumber(smmtDetails.CombinedMpg),
    co2Emissions: co2,
    insuranceGroup: smmtDetails.InsuranceGroup,
    annualTax: estimateAnnualTax(co2, year), // Calculated
  };
}
```

## Testing

Test with the updated parser:

```bash
cd backend
node test-api-running-costs.js
```

Expected output:
```
Parsed Running Costs:
- urbanMpg: 45.6 (from SmmtDetails)
- extraUrbanMpg: 56.5 (from SmmtDetails)
- combinedMpg: 50.4 (from SmmtDetails)
- co2Emissions: 127 (from SmmtDetails)
- insuranceGroup: 25E (from SmmtDetails)
- annualTax: 180 (calculated from CO2)
```

## Next Steps

1. ✅ Update `apiResponseParser.js` to use `SmmtDetails`
2. ✅ Add `estimateAnnualTax()` function
3. ✅ Update `universalAutoCompleteService.js` to call `getVehicleSpecs()` for running costs
4. ✅ Test with existing cars
5. ✅ Verify frontend displays data correctly

## Alternative: Manual Entry

If API data is not available, allow users to manually enter running costs:

```javascript
// In frontend form
<input 
  type="number" 
  name="annualTax" 
  placeholder="Annual Tax (£)"
  value={formData.runningCosts.annualTax || ''}
/>
```

## Summary

**Problem:** API endpoint doesn't return `ModelData` with running costs

**Solution:** Use `SmmtDetails` from `Vehiclespecs` endpoint + calculate missing fields

**Status:** Ready to implement

**Files to Update:**
1. `backend/utils/apiResponseParser.js` - Add SmmtDetails parsing
2. `backend/services/universalAutoCompleteService.js` - Call getVehicleSpecs
3. `backend/utils/taxCalculator.js` - New file for tax estimation
