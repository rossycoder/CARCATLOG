# 🔧 Integration Example - How to Use Safe API Service

## Before (Unsafe - API calls in pre-save hook)

```javascript
// ❌ OLD WAY - API calls happen in pre-save hook
const car = new Car({
  registrationNumber: 'AB12CDE',
  make: 'Ford',
  model: 'Focus',
  year: 2020,
  mileage: 50000
});

await car.save(); // Triggers expensive API calls in pre-save hook
// Problem: No caching, no rate limiting, no audit trail
```

---

## After (Safe - API calls in controller with protection)

```javascript
// ✅ NEW WAY - API calls in controller with full protection

const safeAPI = require('../services/safeAPIService');
const CheckCarDetailsClient = require('../clients/CheckCarDetailsClient');
const MOTHistoryService = require('../services/motHistoryService');
const ValuationService = require('../services/valuationService');

// Initialize clients
const checkCarClient = new CheckCarDetailsClient();
const motService = new MOTHistoryService();
const valuationService = new ValuationService();

async function createVehicle(req, res) {
  try {
    const { registrationNumber, mileage } = req.body;
    const userId = req.user?.id;
    
    // Step 1: Fetch Vehicle Specs (with caching + rate limiting + audit)
    const specsResult = await safeAPI.call(
      'vehiclespecs',
      registrationNumber,
      userId,
      async () => {
        return await checkCarClient.getVehicleSpecs(registrationNumber);
      }
    );
    
    // Step 2: Fetch MOT History (with caching + rate limiting + audit)
    const motResult = await safeAPI.call(
      'mothistory',
      registrationNumber,
      userId,
      async () => {
        return await motService.fetchAndSaveMOTHistory(registrationNumber, false);
      }
    );
    
    // Step 3: Fetch Valuation (with caching + rate limiting + audit)
    const valuationResult = await safeAPI.call(
      'valuation',
      registrationNumber,
      userId,
      async () => {
        return await valuationService.getValuation(registrationNumber, mileage);
      }
    );
    
    // Step 4: Merge all data
    const carData = {
      registrationNumber,
      mileage,
      // From specs
      make: specsResult.data.make,
      model: specsResult.data.model,
      variant: specsResult.data.variant,
      engineSize: specsResult.data.engineSize,
      // From MOT
      motHistory: motResult.data,
      motDue: motResult.data[0]?.expiryDate,
      // From valuation
      estimatedValue: valuationResult.data.estimatedValue?.private,
      valuation: valuationResult.data
    };
    
    // Step 5: Create car (NO API calls in pre-save hook)
    const car = new Car(carData);
    await car.save(); // ✅ Safe - no external calls
    
    res.status(201).json({
      success: true,
      data: car,
      cached: {
        specs: specsResult.cached,
        mot: motResult.cached,
        valuation: valuationResult.cached
      }
    });
    
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

---

## Parallel API Calls (Faster)

```javascript
// Make multiple API calls in parallel
const results = await safeAPI.callMultiple([
  {
    endpoint: 'vehiclespecs',
    vrm: registrationNumber,
    userId,
    apiCallFn: async () => await checkCarClient.getVehicleSpecs(registrationNumber)
  },
  {
    endpoint: 'mothistory',
    vrm: registrationNumber,
    userId,
    apiCallFn: async () => await motService.fetchAndSaveMOTHistory(registrationNumber, false)
  },
  {
    endpoint: 'valuation',
    vrm: registrationNumber,
    userId,
    apiCallFn: async () => await valuationService.getValuation(registrationNumber, mileage)
  }
]);

// Extract results
const [specsResult, motResult, valuationResult] = results;

// Check for failures
if (!specsResult.success) {
  console.error('Specs API failed:', specsResult.error);
}
```

---

## Check Safety Before API Call

```javascript
// Check if it's safe to make an API call
const safety = await safeAPI.checkSafety('vehiclespecs', registrationNumber, userId);

if (!safety.safe) {
  return res.status(429).json({
    success: false,
    error: safety.recommendation,
    monthlyCost: safety.monthlyCost
  });
}

// Safe to proceed
const result = await safeAPI.call(...);
```

---

## Get Usage Statistics

```javascript
// Get current API usage stats
const stats = await safeAPI.getUsageStats();

console.log('Cache Stats:', stats.cache);
// { total: 1500, valid: 1200, expired: 300, ttlDays: 30 }

console.log('Rate Limit Stats:', stats.rateLimit);
// { endpoints: {...}, global: { calls: 450, limit: 1000, remaining: 550 } }

console.log('Costs:', stats.costs);
// { today: 5.23, month: 87.45 }
```

---

## Error Handling

```javascript
try {
  const result = await safeAPI.call(
    'vehiclespecs',
    registrationNumber,
    userId,
    async () => await checkCarClient.getVehicleSpecs(registrationNumber)
  );
  
  // Use result.data
  
} catch (error) {
  if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.'
    });
  }
  
  if (error.message.includes('VEHICLE_NOT_FOUND')) {
    return res.status(404).json({
      success: false,
      error: 'Vehicle not found'
    });
  }
  
  // Generic error
  return res.status(500).json({
    success: false,
    error: 'API call failed'
  });
}
```

---

## Benefits

### 1. Automatic Caching
- First call: Makes API request (costs money)
- Subsequent calls (30 days): Returns cached data (FREE)
- 90%+ cost reduction

### 2. Rate Limiting
- Prevents abuse
- Protects against runaway costs
- Returns clear error messages

### 3. Audit Trail
- Every call logged with cost
- Monthly cost reports
- User-level tracking
- Cache hit rate monitoring

### 4. Error Handling
- Graceful failures
- Detailed error messages
- Automatic retry logic (optional)

### 5. Performance
- Parallel API calls
- Fast cache lookups
- Response time tracking

---

## Migration Checklist

For each controller that makes API calls:

- [ ] Import `safeAPI` service
- [ ] Move API calls from pre-save hook to controller
- [ ] Wrap each API call with `safeAPI.call()`
- [ ] Handle cached vs fresh data
- [ ] Add error handling
- [ ] Test with real data
- [ ] Monitor costs

---

## Testing

```javascript
// Test cache hit
const result1 = await safeAPI.call('vehiclespecs', 'AB12CDE', userId, apiCallFn);
console.log('First call - cached:', result1.cached); // false

const result2 = await safeAPI.call('vehiclespecs', 'AB12CDE', userId, apiCallFn);
console.log('Second call - cached:', result2.cached); // true ✅

// Test rate limiting
for (let i = 0; i < 15; i++) {
  try {
    await safeAPI.call('vehiclespecs', `TEST${i}`, userId, apiCallFn);
  } catch (error) {
    console.log(`Call ${i} failed:`, error.message); // Rate limit after 10 calls
  }
}

// Test cost tracking
const costs = await auditService.getTodayCosts();
console.log('Today\'s costs:', costs.summary.totalCost);
```

---

## Next Steps

1. Update `vehicleController.js` to use `safeAPI`
2. Update `bikeController.js` to use `safeAPI`
3. Update `vanController.js` to use `safeAPI`
4. Update `advertController.js` to use `safeAPI`
5. Clean up pre-save hooks (remove API calls)
6. Test thoroughly
7. Monitor costs for 1 week
8. Remove kill switch once confident

---

## Expected Results

### Before
- 1000 API calls/month
- £190/month cost
- No caching
- No visibility

### After
- 1000 requests/month
- 100 API calls/month (90% cache hit rate)
- £19/month cost
- Full visibility

**Savings: £171/month (90% reduction)** 🎉
