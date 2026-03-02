# 🏗️ Architecture Refactor Plan - API Cost Prevention

## 🔥 Current Problem

### What's Wrong
- **Paid API calls inside Mongoose pre-save hooks** (Car.js, Bike.js, Van.js)
- No caching strategy
- No rate limiting
- No duplicate call prevention
- No audit trail
- Kill switch is temporary damage control, not a solution

### Financial Impact
- £1,800 already spent on duplicate API calls
- Every test/save triggers expensive API calls
- No visibility into API usage
- No cost controls

---

## ✅ Proper Architecture

### Layer Separation

```
┌─────────────────────────────────────────────────┐
│  CONTROLLER LAYER                               │
│  - Receives requests                            │
│  - Validates input                              │
│  - Calls services                               │
│  - Returns responses                            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  SERVICE LAYER                                  │
│  - Business logic                               │
│  - API calls (with caching + rate limiting)     │
│  - Data transformation                          │
│  - Error handling                               │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  MODEL LAYER (Pre-save hooks)                   │
│  - Data normalization ONLY                      │
│  - Field validation                             │
│  - Slug generation                              │
│  - Derived fields                               │
│  - NO EXTERNAL API CALLS                        │
└─────────────────────────────────────────────────┘
```

---

## 🛡️ Protection Mechanisms

### 1. Cache Layer (30-day TTL)
```javascript
// Check VehicleHistory cache FIRST
const cached = await VehicleHistory.findOne({ vrm }).sort({ checkDate: -1 });
if (cached && (Date.now() - cached.checkDate) < 30 * 24 * 60 * 60 * 1000) {
  return cached; // 💰 Saved API call
}
```

### 2. Rate Limiting
```javascript
// Max 10 API calls per minute per endpoint
const rateLimiter = new RateLimiter({
  maxCalls: 10,
  perMinutes: 1,
  endpoint: 'checkcardetails'
});
```

### 3. Duplicate Prevention
```javascript
// Check if car already exists in DB
const existing = await Car.findOne({ registrationNumber });
if (existing) {
  return existing; // 💰 Saved API call
}
```

### 4. Audit Logging
```javascript
// Log every API call with cost
await APICallLog.create({
  endpoint: 'vehiclespecs',
  vrm: registration,
  cost: 0.05,
  timestamp: new Date(),
  userId: req.user?.id
});
```

---

## 📋 Implementation Tasks

### Phase 1: Remove API Calls from Pre-Save Hooks ✅
- [x] Add kill switch to Car.js
- [x] Add kill switch to Bike.js  
- [x] Add kill switch to Van.js
- [ ] Remove ALL external API calls from pre-save hooks
- [ ] Keep ONLY normalization logic

### Phase 2: Move API Calls to Controllers
- [ ] vehicleController.js - Move API calls before car.save()
- [ ] bikeController.js - Move API calls before bike.save()
- [ ] vanController.js - Move API calls before van.save()
- [ ] advertController.js - Move API calls before car.save()

### Phase 3: Add Caching Layer
- [ ] Create APICache service
- [ ] Check cache BEFORE every API call
- [ ] 30-day TTL for all vehicle data
- [ ] Cache invalidation strategy

### Phase 4: Add Rate Limiting
- [ ] Create RateLimiter service
- [ ] Per-endpoint limits
- [ ] Per-user limits
- [ ] Queue system for burst requests

### Phase 5: Add Audit Trail
- [ ] Create APICallLog model
- [ ] Log every API call with cost
- [ ] Daily cost reports
- [ ] Alert on unusual usage

---

## 💰 Cost Breakdown (Per Vehicle)

### Current APIs
| API | Cost | When Called |
|-----|------|-------------|
| DVLA Lookup | £0.00 | Free (gov API) |
| Vehicle Specs | £0.05 | Every save |
| MOT History | £0.02 | Every save |
| Valuation | £0.12 | Every save |
| Vehicle History | £1.82 | After payment |

### Total Cost Per Vehicle
- **Minimum**: £0.19 (Specs + MOT + Valuation)
- **Full Check**: £2.01 (All APIs)

### With Proper Caching
- **First lookup**: £0.19-£2.01
- **Subsequent lookups (30 days)**: £0.00 ✅

---

## 🎯 Success Metrics

### Before Refactor
- ❌ API calls in pre-save hooks
- ❌ No caching
- ❌ No rate limiting
- ❌ No audit trail
- ❌ £1,800 wasted

### After Refactor
- ✅ API calls in controllers only
- ✅ 30-day cache (90%+ hit rate)
- ✅ Rate limiting (10 calls/min)
- ✅ Full audit trail
- ✅ 90% cost reduction

---

## 🚀 Next Steps

1. **Remove API calls from pre-save hooks** (keep kill switch until refactor complete)
2. **Move API calls to controllers** (before model.save())
3. **Add caching layer** (check cache first, always)
4. **Add rate limiting** (prevent abuse)
5. **Add audit logging** (track every penny)
6. **Remove kill switch** (once refactor is complete and tested)

---

## 📊 Expected Savings

### Current Monthly Cost (without caching)
- 1000 vehicles/month × £0.19 = £190/month
- With testing/edits: £500-£1000/month

### With Proper Architecture
- 1000 vehicles/month × £0.19 × 10% (cache miss rate) = £19/month
- **Savings: £171-£981/month** (90-95% reduction)

---

## ⚠️ Critical Rules

### Pre-Save Hooks Should NEVER:
- ❌ Make HTTP requests
- ❌ Call external APIs
- ❌ Fetch data from third parties
- ❌ Perform async operations that cost money

### Pre-Save Hooks Should ONLY:
- ✅ Normalize data (uppercase, trim, format)
- ✅ Generate slugs/display titles
- ✅ Calculate derived fields
- ✅ Validate data integrity
- ✅ Set default values

---

**Status**: Kill switch active, refactor in progress
**Priority**: HIGH - Financial impact
**Timeline**: Complete within 1-2 days
