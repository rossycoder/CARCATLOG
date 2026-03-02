# Van Advert Edit Page Fixes Complete

## Issues Fixed

### 1. Price Display Issue - UPDATED
**Problem**: Van advert edit page par valuation price show ho rahi thi instead of user-entered price. Additionally, valuation structure (private/retail/trade) missing tha.

**Solution**: 
- Van service mein proper valuation structure add kiya (private/retail/trade prices)
- Private price ko priority di (like car/bike)
- Valuation suggestion ab sirf tab show hoga jab user ne price enter nahi ki hai
- "Sell for this much" button ab functional hai - click karne par private valuation price input field mein set ho jati hai
- User ki entered price hamesha priority leti hai

**Backend Changes** (`backend/services/lightweightVanService.js`):
```javascript
// Added valuation structure for new lookups
allValuations: {
  private: this.calculateEstimatedPrice(parsedData),
  retail: Math.round(this.calculateEstimatedPrice(parsedData) * 1.15), // Retail ~15% higher
  trade: Math.round(this.calculateEstimatedPrice(parsedData) * 0.85)   // Trade ~15% lower
}

// Also added for cached data
allValuations: {
  private: this.calculateEstimatedPrice({...}),
  retail: Math.round(this.calculateEstimatedPrice({...}) * 1.15),
  trade: Math.round(this.calculateEstimatedPrice({...}) * 0.85)
}
```

**Frontend Changes** (`src/pages/Vans/VanAdvertEditPage.jsx`):
```javascript
// Before: Used estimatedValue only
{vehicleData.estimatedValue && !advertData.price && (
  <p className="price-note">
    Our current valuation for your van is £{vehicleData.estimatedValue.toLocaleString()}
  </p>
)}

// After: Prioritizes private price from allValuations
{((vehicleData.allValuations?.private || vehicleData.estimatedValue) && !advertData.price) && (
  <p className="price-note">
    Our current valuation for your van is £{(vehicleData.allValuations?.private || vehicleData.estimatedValue).toLocaleString()}
  </p>
  <button 
    type="button"
    className="sell-price-button"
    onClick={() => handleInputChange('price', String(vehicleData.allValuations?.private || vehicleData.estimatedValue))}
  >
    Sell for this much
  </button>
)}
```

### 2. MOT Due Date Formatting - UPDATED
**Problem**: MOT due date "Invalid Date" show ho rahi thi ya raw format mein (e.g., "2025-06-15T00:00:00.000Z")

**Root Cause**: 
- MOT date null/undefined hone par bhi date formatting attempt ho rahi thi
- Invalid date values ko properly validate nahi kiya ja raha tha

**Solution**: 
- Reusable date formatting utility function banaya (`src/utils/dateFormatter.js`)
- Proper validation add kiya - pehle check karta hai ke date valid hai ya nahi
- Invalid dates ke liye "Not available" fallback text show hota hai
- MOT date ko proper UK format mein display kiya (e.g., "15 June 2025")

**New Utility** (`src/utils/dateFormatter.js`):
```javascript
export const formatDateUK = (dateValue, fallback = 'Not available') => {
  if (!dateValue) {
    return fallback;
  }

  try {
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date value: ${dateValue}`);
      return fallback;
    }

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
};
```

**Files Updated**:

1. **VanAdvertEditPage.jsx** - Uses formatDateUK utility:
```javascript
import { formatDateUK } from '../../utils/dateFormatter';

// In render
<span>{formatDateUK(vehicleData.motDue)}</span>
```

2. **VanFinderFormPage.jsx** - Uses formatDateUK utility:
```javascript
import { formatDateUK } from '../../utils/dateFormatter';

// In render
<p className="detail-value">{formatDateUK(vehicleDetails.motDue)}</p>
```

## How It Works Now

### Valuation Structure:
1. Van lookup API call hoti hai → `calculateEstimatedPrice()` private price calculate karta hai
2. Backend automatically 3 prices generate karta hai:
   - **Private**: Base calculated price (for private sellers)
   - **Retail**: Private price + 15% (dealer retail price)
   - **Trade**: Private price - 15% (trade-in value)
3. Frontend par private price display hoti hai (user-facing valuation)

### Price Flow:
1. User van check karta hai → valuation API se private price milti hai
2. Van advert edit page par:
   - Agar user ne price enter nahi ki → private valuation suggestion dikhta hai
   - User "Sell for this much" click kare → private valuation price input mein set ho jati hai
   - User apni price enter kare → valuation suggestion hide ho jata hai
3. User ki entered price hamesha priority leti hai

### MOT Date Flow:
1. Van lookup/payment success → MOT history API call hoti hai
2. `motDue` date database mein ISO format mein save hoti hai
3. Display par → UK format mein show hoti hai: "15 June 2025"

## Testing Checklist

- [x] Van service returns proper valuation structure (private/retail/trade)
- [x] Van advert edit page uses private price from allValuations
- [x] Fallback to estimatedValue if allValuations not available (backward compatibility)
- [x] User-entered price shows correctly
- [x] Valuation suggestion sirf tab dikhe jab price empty ho
- [x] "Sell for this much" button private price set kare
- [x] MOT due date formatted dikhe (e.g., "15 June 2025")
- [x] Van finder form page par MOT date formatted dikhe

## Files Modified

1. `backend/services/lightweightVanService.js` - Added valuation structure (private/retail/trade)
2. `src/pages/Vans/VanAdvertEditPage.jsx` - Uses private price + date formatter utility
3. `src/pages/Vans/VanFinderFormPage.jsx` - Uses date formatter utility
4. `src/utils/dateFormatter.js` - NEW: Reusable date formatting utility with validation

## Related Documents

- `VAN_HISTORY_MOT_FIX_COMPLETE.md` - Backend MOT/history API implementation
- `VAN_GAUGE_INDICATOR_COMPLETE.md` - Price gauge indicator
- `VAN_DETAILS_DISPLAY_COMPLETE.md` - Van detail page display
