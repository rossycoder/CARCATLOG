# MG ZS Electric Vehicle Data Fix

## Issue
MG ZS 60kWh SUV showing incorrect electric vehicle data:
- Electric Range: 200 miles (INCORRECT - generic default)
- Battery Capacity: 60kWh (INCORRECT - no such variant exists)

## Root Cause
MG vehicles were not included in the electric vehicle enhancement database, so they were falling back to generic defaults (200 miles range, 60kWh battery).

## Actual MG ZS EV Specifications

### Standard Range (51kWh)
- Battery: 51kWh
- Range: 163 miles (WLTP)
- Motor Power: 105kW (143 bhp)
- Rapid Charging: 76kW (10-80% in 42 mins)

### Long Range / Extended Range (72.6kWh)
- Battery: 72.6kWh
- Range: 273 miles (WLTP)
- Motor Power: 130kW (177 bhp)
- Rapid Charging: 92kW (10-80% in 47 mins)

## Fix Applied

### 1. Added MG to Electric Vehicle Enhancement Database
**File**: `backend/services/electricVehicleEnhancementService.js`

Added comprehensive MG electric vehicle data:
- MG ZS (Standard, Long Range, Extended Range)
- MG4 (Standard, Long Range)
- MG5

### 2. Added MG Fallback Defaults
**File**: `backend/services/autoDataPopulationService.js`

Added MG-specific defaults for cases where exact variant isn't matched:
- MG ZS: Defaults to Long Range specs (273 miles, 72.6kWh)
- MG4: Defaults to Long Range specs (281 miles, 64kWh)
- MG5: Standard specs (214 miles, 61.1kWh)

### 3. Added Electric Vehicle Enhancement to Advert Controller
**File**: `backend/controllers/advertController.js`

Added electric vehicle enhancement when creating new adverts:
- Automatically detects electric vehicles (fuelType === 'Electric')
- Applies comprehensive EV data from enhancement service
- Saves all EV fields (range, battery, charging speeds, etc.)
- Works for ALL electric vehicles, not just MG

This ensures that:
- ✅ New MG electric cars get correct data automatically
- ✅ New Tesla, BMW, Audi EVs also get correct data
- ✅ All electric vehicle fields are populated before saving
- ✅ No manual intervention needed

## Data Included
For each MG variant:
- ✅ Electric range (miles)
- ✅ Battery capacity (kWh)
- ✅ Charging times (home, public, rapid)
- ✅ Motor power and torque
- ✅ Charging port types
- ✅ Battery warranty (7 years / 80,000 miles)
- ✅ Energy consumption
- ✅ Regenerative braking details

## Result
MG ZS vehicles will now display accurate specifications based on their actual variant:
- Correct battery capacity (51kWh or 72.6kWh, not 60kWh)
- Correct electric range (163 or 273 miles, not 200 miles)
- Accurate charging speeds and times
- Proper motor specifications

## Automatic Enhancement for New Cars
✅ **YES! New electric cars will automatically get correct data!**

When you add a new electric car (MG, Tesla, BMW, Audi, etc.):
1. System detects fuelType === 'Electric'
2. Automatically fetches correct specs from enhancement database
3. Saves all EV fields (range, battery, charging, motor)
4. No manual intervention needed!

This works in:
- ✅ Vehicle lookup/creation (`vehicleController.js`)
- ✅ Advert creation (`advertController.js`)
- ✅ All electric vehicle routes

## Note on "60kWh" Variant Name
The "60kWh" mentioned in variant names is likely:
1. A rounded/marketing figure
2. Incorrect data from the source
3. Should be either 51kWh (Standard) or 72.6kWh (Long Range)

The system will now use the correct specifications regardless of what the variant name says.

## How to Update Existing Cars

### Option 1: Update Specific MG ZS (YF70CZL)
```bash
cd backend
node update-mg-zs.js
```
Or double-click: `backend/UPDATE_MG_ZS.bat`

### Option 2: Update ALL MG Electric Vehicles
```bash
cd backend
node update-all-mg-evs.js
```
Or double-click: `backend/UPDATE_ALL_MG_EVS.bat`

This will:
- Find all MG electric vehicles in the database
- Update their electric range, battery capacity, charging speeds
- Update motor power and torque specifications
- Set correct CO2 emissions (0) and annual tax (£0)
- Update both individual fields and runningCosts object

### What Gets Updated
- ✅ Electric range (miles)
- ✅ Battery capacity (kWh)
- ✅ Charging times (home, public, rapid)
- ✅ Charging speeds (kW)
- ✅ Motor power (kW) and torque (Nm)
- ✅ Charging port type
- ✅ Fast charging capability
- ✅ CO2 emissions (0 g/km)
- ✅ Annual tax (£0)

### After Update
Restart the backend server and refresh the frontend to see the corrected data.
