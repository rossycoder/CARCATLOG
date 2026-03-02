# Van History Display Fix - Complete

## Issue
Van detail page was showing "Contact seller" messages for vehicle history and MOT history instead of displaying the actual data from the database.

## Root Cause
Two issues were preventing the data from displaying:

1. **VanDetailPage not passing data**: The page was only passing `vrm` prop to the history components, but not the actual van data (`carData` prop)

2. **VehicleHistorySection field mismatch**: The component was checking for `carData.historyCheckId` (used by cars), but vans store history data in `carData.historyCheckData`

## Fixes Applied

### 1. VanDetailPage.jsx - Pass van data to components
**File**: `src/pages/Vans/VanDetailPage.jsx`

**Before**:
```jsx
<VehicleHistorySection 
  vrm={van.registrationNumber || van.vrm}
  historyCheckId={van.historyCheckId}
/>

<MOTHistorySection 
  vrm={van.registrationNumber || van.vrm}
/>
```

**After**:
```jsx
<VehicleHistorySection 
  vrm={van.registrationNumber || van.vrm}
  historyCheckId={van.historyCheckId}
  carData={van}
/>

<MOTHistorySection 
  vrm={van.registrationNumber || van.vrm}
  carData={van}
/>
```

### 2. VehicleHistorySection.jsx - Support both field names
**File**: `src/components/VehicleHistory/VehicleHistorySection.jsx`

**Before**:
```jsx
if (carData && carData.historyCheckId) {
  console.log('[VehicleHistory] Using vehicle history from car data:', carData.historyCheckId);
  setHistoryData(carData.historyCheckId);
  setIsLoading(false);
  return;
}
```

**After**:
```jsx
if (carData && (carData.historyCheckId || carData.historyCheckData)) {
  const historySource = carData.historyCheckId || carData.historyCheckData;
  console.log('[VehicleHistory] Using vehicle history from car data:', historySource);
  setHistoryData(historySource);
  setIsLoading(false);
  return;
}
```

## Data Structure Differences

### Cars
- Store history in: `historyCheckId` (reference to VehicleHistory document)
- MOT data: `motHistory`, `motStatus`, `motDue`

### Vans/Bikes
- Store history in: `historyCheckData` (embedded object)
- MOT data: `motHistory`, `motStatus`, `motDue`

## Current Van Data Status

For van `EU60EKO` (69a5f0bcbb53d45cd238fcf4):
- ✅ Registration number: `EU60EKO`
- ✅ Vehicle history: Available (`historyCheckData` with 0 previous keepers)
- ✅ History check status: `completed`
- ⚠️ MOT history: Empty array (van may be exempt or no history available)
- ⚠️ MOT status: `null`

## Expected Display

### Vehicle History Section
Should now show:
- Previous keepers: 0
- Not stolen
- Not scrapped
- Not exported
- Write-off status: None

### MOT History Section
Will show:
- "No MOT history available for this vehicle"
- This is correct for this particular van (2010 Ford Transit with no MOT records)

## Testing
1. Navigate to van detail page: `/vans/69a5f0bcbb53d45cd238fcf4`
2. Scroll to "This vehicle's history" section
3. Should see vehicle history data instead of "Contact seller"
4. MOT section will show "No MOT history available" (expected for this van)

## Date: March 3, 2026
