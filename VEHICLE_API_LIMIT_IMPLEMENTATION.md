# Vehicle API Limit Implementation

## Overview

Har vehicle ke liye sirf **4 API calls** ki limit implement ki gayi hai:

1. **MOT History** - Vehicle ka MOT history
2. **Valuation** - Vehicle ki valuation
3. **CheckCarDetails (History)** - Vehicle history check
4. **Vehicle Specs** - Vehicle specifications

## Key Features

### ✅ Duplicate Call Prevention
- Har endpoint ke liye sirf **1 API call** per vehicle
- Agar data already cached hai, to API call nahi hogi
- Agar API call already ho chuki hai, to dobara nahi hogi

### 💾 Cache-First Approach
- Pehle cache check hota hai
- Agar cache mein data hai, to API call skip ho jati hai
- Cache validity: **30 days**

### 📊 Complete Tracking
- Har API call log hoti hai database mein
- Cost tracking per vehicle
- Endpoint-wise call tracking
- Success/failure tracking

### 🚫 Automatic Blocking
- Duplicate calls automatically block ho jati hain
- Clear error messages
- Existing data return hota hai agar available ho

## Implementation Details

### New Service: `vehicleAPILimitService.js`

```javascript
// Check if API call is allowed
const limitCheck = await vehicleAPILimit.checkVehicleAPILimit(vrm, endpoint);

if (!limitCheck.allowed) {
  // Use existing data or block call
  return limitCheck.existingData;
}
```

### Updated Service: `safeAPIService.js`

Ab `safeAPIService` automatically vehicle limits check karta hai:

```javascript
const result = await safeAPI.call('mothistory', vrm, userId, async () => {
  return await motHistoryAPI.getData(vrm);
});
```

### Flow Diagram

```
Request for Vehicle Data
         ↓
Check Vehicle API Limit
         ↓
    Has Cache? ──Yes──> Return Cached Data (FREE)
         ↓ No
    Already Called? ──Yes──> Block Call (Error)
         ↓ No
    Check Rate Limit
         ↓
    Make API Call
         ↓
    Cache Result
         ↓
    Log Call
         ↓
    Return Data
```

## API Endpoints (Admin Only)

### 1. Get Overall API Stats
```
GET /api/admin/api-stats
```

Response:
```json
{
  "success": true,
  "data": {
    "usage": {
      "cache": {...},
      "rateLimit": {...},
      "costs": {
        "today": 5.50,
        "month": 125.00
      }
    },
    "topVehicles": [...],
    "excessiveCalls": 3
  }
}
```

### 2. Get Vehicle-Specific Stats
```
GET /api/admin/vehicle-api/:vrm
```

Response:
```json
{
  "success": true,
  "data": {
    "summary": {
      "vrm": "AB12CDE",
      "hasCachedData": true,
      "totalAPICalls": 4,
      "totalCost": 2.01,
      "callsByEndpoint": {
        "mothistory": {
          "called": true,
          "lastCall": "2024-01-15",
          "totalCalls": 1,
          "totalCost": 0.02
        },
        ...
      }
    },
    "report": "..."
  }
}
```

### 3. Find Excessive API Calls
```
GET /api/admin/excessive-api-calls?threshold=4
```

Response:
```json
{
  "success": true,
  "data": {
    "threshold": 4,
    "count": 5,
    "vehicles": [
      {
        "vrm": "XY99ZZZ",
        "totalCalls": 8,
        "totalCost": 4.02,
        "status": "⚠️ Over limit"
      }
    ]
  }
}
```

## Testing

Test script run karne ke liye:

```bash
cd backend
node scripts/testVehicleAPILimits.js
```

Test script ye check karega:
- ✅ Initial state (all calls allowed)
- ✅ After API calls (all calls blocked)
- ✅ With cached data (uses cache)
- ✅ Vehicle summary generation
- ✅ Report generation
- ✅ Excessive calls detection

## Cost Savings

### Before Implementation
- Duplicate API calls possible
- No tracking per vehicle
- Potential for excessive costs

### After Implementation
- ✅ Maximum 4 calls per vehicle
- ✅ Cache reuse (FREE)
- ✅ Complete cost visibility
- ✅ Automatic duplicate prevention

### Example Savings

For 1000 vehicles:
- **Without limits**: Potentially 10+ calls per vehicle = 10,000 calls
- **With limits**: Maximum 4 calls per vehicle = 4,000 calls
- **With cache**: ~1-2 calls per vehicle = 1,500 calls

**Savings: 85% reduction in API costs!**

## Error Messages

### VEHICLE_API_LIMIT
```
VEHICLE_API_LIMIT: Data already cached
VEHICLE_API_LIMIT: API already called for this vehicle (5 days ago)
```

### RATE_LIMIT_EXCEEDED
```
RATE_LIMIT_EXCEEDED: Endpoint rate limit exceeded (10 calls/min)
RATE_LIMIT_EXCEEDED: User rate limit exceeded (100 calls/hour)
```

## Monitoring

### Console Logs

```
🔍 [Vehicle API Limit] Checking cache for mothistory - AB12CDE
✅ [Vehicle API Limit] Cache HIT - Using cached data for AB12CDE
💰 API call NOT needed - data already available
```

### Database Logs

Har call `APICallLog` collection mein store hoti hai:
- Endpoint name
- VRM
- Cost
- Success/failure
- Cache hit/miss
- Timestamp

## Configuration

### Limits (in `vehicleAPILimitService.js`)

```javascript
this.MAX_CALLS_PER_ENDPOINT = 1;  // 1 call per endpoint per vehicle

this.ALLOWED_ENDPOINTS = [
  'mothistory',
  'valuation', 
  'vehiclehistory',
  'vehiclespecs'
];
```

### Cache Duration (in `apiCacheService.js`)

```javascript
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
```

## Integration

Existing code automatically use karega new limits:

```javascript
// Old code (still works)
const data = await safeAPI.call('mothistory', vrm, userId, async () => {
  return await motAPI.getData(vrm);
});

// New behavior:
// 1. Checks vehicle API limit
// 2. Uses cache if available
// 3. Blocks duplicate calls
// 4. Logs everything
```

## Benefits

1. **Cost Control**: Maximum 4 API calls per vehicle
2. **Performance**: Cache-first approach
3. **Visibility**: Complete tracking and reporting
4. **Automatic**: No code changes needed
5. **Safe**: Fail-open on errors

## Next Steps

1. ✅ Service implemented
2. ✅ Admin endpoints added
3. ✅ Test script created
4. ⏳ Deploy to production
5. ⏳ Monitor for 1 week
6. ⏳ Review cost savings

## Support

Agar koi issue ho to:
1. Check console logs
2. Check `APICallLog` collection
3. Run test script
4. Check admin API stats endpoint

---

**Implementation Date**: March 2, 2026
**Status**: ✅ Complete and Ready for Testing
