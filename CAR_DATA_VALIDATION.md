# Car Data Validation System

## Overview
Jab bhi naya car add hota hai, to yeh system ensure karta hai ke:
- API se sahi data fetch ho
- Koi bhi null values database mein save na hon
- Saari fields validated aur cleaned hon
- Invalid data ko sensible defaults se replace kiya jaye

## Features

### 1. Automatic Data Cleaning
- **Null values** ko remove karta hai ya sensible defaults set karta hai
- **Invalid strings** jaise "null", "undefined", "" ko clean karta hai
- **Invalid numbers** ko validate karta hai (min/max range check)
- **Arrays** se null/invalid items filter karta hai
- **URLs** validate karta hai (images must start with http)

### 2. Field Validation

#### Required Fields (with defaults)
- `make`: Default "Unknown"
- `model`: Default "Unknown"  
- `year`: Default current year
- `price`: Must be > 0

#### Optional Fields (with sensible defaults)
- `mileage`: Default 0
- `color`: Default "Not specified"
- `fuelType`: Default "Petrol"
- `transmission`: Default "manual"
- `engineSize`: Default 0
- `bodyType`: Default "Not specified"
- `doors`: Default 4
- `seats`: Default 5

#### Location Data
- `postcode`: Uppercase, cleaned
- `locationName`: Town name only (no "unparished area")
- `latitude/longitude`: Validated range (-90 to 90, -180 to 180)
- `location`: Only set if valid coordinates exist

#### Electric Vehicle Data (only for Electric fuel type)
- `electricRange`: 0-1000 miles
- `batteryCapacity`: 0-200 kWh
- `chargingTime`: 0-24 hours
- `homeChargingSpeed`: 0-50 kW
- `publicChargingSpeed`: 0-500 kW
- `rapidChargingSpeed`: 0-500 kW

### 3. Data Cleaning Examples

```javascript
// Input (dirty data)
{
  make: 'BMW',
  model: '5 Series',
  mileage: null,
  color: 'null',
  engineSize: 'null',
  features: [null, 'Leather Seats', undefined, 'Sat Nav'],
  images: ['http://example.com/img1.jpg', null, 'invalid']
}

// Output (cleaned data)
{
  make: 'BMW',
  model: '5 Series',
  mileage: 0,
  color: 'Not specified',
  engineSize: 0,
  features: ['Leather Seats', 'Sat Nav'],
  images: ['http://example.com/img1.jpg']
}
```

## Implementation

### Payment Controller Integration
Payment controller mein car create karne se pehle validation run hota hai:

```javascript
// Raw data prepare karo
const rawCarData = {
  make: vehicleData.make,
  model: vehicleData.model,
  // ... other fields
};

// Validate and clean
const cleanedCarData = CarDataValidator.validateAndClean(rawCarData);

// Check required fields
const validation = CarDataValidator.validateRequired(cleanedCarData);
if (!validation.isValid) {
  throw new Error(`Invalid car data: ${validation.errors.join(', ')}`);
}

// Save to database
const car = new Car(cleanedCarData);
await car.save();
```

## Testing

Test script run karne ke liye:
```bash
node backend/scripts/testCarDataValidation.js
```

Yeh script test karta hai:
1. Null values cleaning
2. Required fields validation
3. Invalid data handling
4. Electric vehicle data
5. String cleaning
6. Number cleaning

## Benefits

✅ **No Null Values**: Database mein koi null values save nahi hongi
✅ **Data Consistency**: Saari cars ke paas consistent data hoga
✅ **Better UX**: Frontend pe "null" ya "undefined" text nahi dikhega
✅ **API Safety**: API se invalid data aaye to bhi system handle karega
✅ **Validation**: Required fields missing hone pe error throw hoga

## Files Modified

1. **backend/utils/carDataValidator.js** - New validator utility
2. **backend/controllers/paymentController.js** - Uses validator before saving
3. **backend/scripts/testCarDataValidation.js** - Test script

## Future Enhancements

- Add validation for other vehicle types (Bikes, Vans)
- Add custom validation rules per field
- Add data transformation rules (e.g., capitalize make/model)
- Add logging for validation failures
- Add metrics for data quality
