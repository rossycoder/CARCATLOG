# Van My Listings Fix Complete

## Issue Fixed

**Problem**: Van listings "My Listings" page par show nahi ho rahi thi, even though database mein `pending_payment` status ke saath save ho rahi thi.

**Root Cause**: `getUserVehicles` function (vehicle controller) mein sirf `Car` aur `Bike` models fetch ho rahe the, `Van` model include nahi tha.

## Solution

Vehicle controller mein `Van` model ko include kiya aur user ke vans bhi fetch karne laga diya.

**File Modified**: `backend/controllers/vehicleController.js`

### Before:
```javascript
// Import Bike model
const Bike = require('../models/Bike');

// Find vehicles (cars and bikes)
const [cars, bikes] = await Promise.all([
  Car.find(query).lean().populate('userId', 'email name').sort({ createdAt: -1 }),
  Bike.find(query).lean().populate('userId', 'email name').sort({ createdAt: -1 })
]);

console.log('[Vehicle Controller] Found', cars.length, 'cars and', bikes.length, 'bikes');

// Combine and mark vehicle types
const allListings = [
  ...cars.map(car => ({ ...car, vehicleType: 'car', ... })),
  ...bikes.map(bike => ({ ...bike, vehicleType: 'bike', ... }))
];
```

### After:
```javascript
// Import Bike and Van models
const Bike = require('../models/Bike');
const Van = require('../models/Van');

// Find vehicles (cars, bikes, and vans)
const [cars, bikes, vans] = await Promise.all([
  Car.find(query).lean().populate('userId', 'email name').sort({ createdAt: -1 }),
  Bike.find(query).lean().populate('userId', 'email name').sort({ createdAt: -1 }),
  Van.find(query).lean().populate('userId', 'email name').sort({ createdAt: -1 })
]);

console.log('[Vehicle Controller] Found', cars.length, 'cars,', bikes.length, 'bikes, and', vans.length, 'vans');

// Combine and mark vehicle types
const allListings = [
  ...cars.map(car => ({ ...car, vehicleType: 'car', ... })),
  ...bikes.map(bike => ({ ...bike, vehicleType: 'bike', ... })),
  ...vans.map(van => ({ ...van, vehicleType: 'van', advertStatus: van.status, ... }))
];
```

## How It Works Now

### Van Listing Flow:

1. **User adds van** → Van check page par registration enter karta hai
2. **Van lookup** → API call hoti hai, van data milta hai
3. **Advert edit** → User price, description, photos add karta hai
4. **Payment** → User advertising package select karta hai aur payment karta hai
5. **Van created** → Database mein van `pending_payment` status ke saath save hoti hai
6. **My Listings** → Van immediately "My Listings" page par show hoti hai with "Pending Payment" badge
7. **Stripe webhook** → Payment success hone par webhook trigger hota hai
8. **Status updated** → Van status `pending_payment` → `active` ho jati hai
9. **MOT & History** → Webhook handler MOT aur vehicle history APIs call karta hai aur data save karta hai

### Status Flow:
- `pending_payment` → Payment pending (van visible in My Listings with badge)
- `active` → Payment complete, van live on site
- `sold` → Van sold
- `expired` → Advertising package expired

## Frontend Support

My Listings page already has support for `pending_payment` status:

```javascript
const statusMap = {
  active: { label: 'Active', className: 'status-active' },
  sold: { label: 'Sold', className: 'status-sold' },
  expired: { label: 'Expired', className: 'status-expired' },
  draft: { label: 'Draft', className: 'status-draft' },
  pending_payment: { label: 'Pending Payment', className: 'status-pending' }
};
```

## Testing Checklist

- [x] Van model includes `userId` field
- [x] Van controller creates van with `pending_payment` status
- [x] Vehicle controller fetches vans for user
- [x] My Listings page displays vans with correct status badge
- [x] Pending payment vans show "Pending Payment" badge
- [x] Active vans show "Active" badge
- [x] Webhook updates van status to active after payment

## Files Modified

1. `backend/controllers/vehicleController.js` - Added Van model to getUserVehicles function

## Related Documents

- `VAN_HISTORY_MOT_FIX_COMPLETE.md` - MOT/history API implementation
- `VAN_ADVERT_EDIT_FIXES_COMPLETE.md` - Price and date formatting fixes
- `PAYMENT_CONTROLLER_API_LIMITS_FIXED.md` - Payment webhook handler
