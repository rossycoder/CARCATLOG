# Van Model Updated to Match Car Model - COMPLETE ✅

## Summary
Updated the Van model (`backend/models/Van.js`) to include all the same fields as the Car model, enabling full feature parity between cars and vans.

## Fields Added to Van Model

### 1. User/Seller Fields
```javascript
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  index: true
}
```
- Links van to the user who created it (for private sellers)
- Enables "My Listings" functionality

### 2. Vehicle Features
```javascript
features: {
  type: [String],
  default: []
}
```
- Array of feature strings (e.g., "Air Conditioning", "Parking Sensors", "Bluetooth")
- Allows users to add van features on the advert edit page

### 3. Service History
```javascript
serviceHistory: {
  type: String,
  enum: ['Contact seller', 'Full service history', 'Partial service history', 'No service history'],
  default: 'Contact seller'
}
```
- Tracks service history status
- Displayed on van detail pages

### 4. Running Costs
```javascript
runningCosts: {
  fuelEconomy: {
    urban: { type: Number, default: null },
    extraUrban: { type: Number, default: null },
    combined: { type: Number, default: null }
  },
  co2Emissions: { type: Number, default: null },
  insuranceGroup: { type: String, default: null },
  annualTax: { type: Number, default: null }
}

// Individual fields for backward compatibility
fuelEconomyUrban: { type: Number, default: null },
fuelEconomyExtraUrban: { type: Number, default: null },
fuelEconomyCombined: { type: Number, default: null },
co2Emissions: { type: Number, default: null },
insuranceGroup: { type: String, default: null },
annualTax: { type: Number, default: null }
```
- Stores fuel economy data (urban, extra-urban, combined MPG)
- CO2 emissions
- Insurance group
- Annual tax cost

### 5. MOT History
```javascript
motDue: { type: Date },
motExpiry: { type: Date },
motHistory: [{
  testDate: { type: Date, required: true },
  expiryDate: { type: Date },
  testResult: { type: String, enum: ['PASSED', 'FAILED', 'REFUSED'], required: true },
  odometerValue: { type: Number, min: 0 },
  odometerUnit: { type: String, enum: ['mi', 'km'], default: 'mi' },
  testNumber: { type: String, trim: true },
  defects: [{
    type: { type: String, enum: ['ADVISORY', 'MINOR', 'MAJOR', 'DANGEROUS', 'FAIL', 'PRS', 'USER ENTERED'] },
    text: String,
    dangerous: { type: Boolean, default: false }
  }],
  advisoryText: [String]
}]
```
- MOT expiry dates
- Complete MOT test history with results, defects, and advisories

### 6. Video URL
```javascript
videoUrl: {
  type: String,
  trim: true,
  validate: {
    validator: function(v) {
      if (!v) return true;
      return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(v);
    },
    message: 'Please provide a valid YouTube URL'
  }
}
```
- YouTube video URL for van adverts
- Validated to ensure proper YouTube URL format

### 7. VAT Status (for Trade Dealers)
```javascript
vatStatus: {
  type: String,
  enum: ['no_vat', 'plus_vat', 'including_vat'],
  default: 'no_vat'
}
```
- VAT status for trade dealer listings
- Options: No VAT, Plus VAT, Including VAT

### 8. Image Limit Increased
```javascript
images: {
  type: [{ type: String, trim: true }],
  validate: {
    validator: function(images) {
      return images.length <= 100; // Changed from 10 to 100
    },
    message: 'Maximum 100 images allowed per van'
  }
}
```
- Increased from 10 to 100 images (matching cars)

## Van Advert Edit Page Sections

The Van Advert Edit Page (`src/pages/Vans/VanAdvertEditPage.jsx`) already has placeholders for these sections:

1. **Van features** (⭐) - Line 610-614
   - Will allow users to add/edit van features
   
2. **Running costs** (💰) - Line 615-619
   - Will display and allow editing of fuel economy, tax, insurance, CO2
   
3. **Advert video** (🎥) - Line 620-624
   - Will allow users to add YouTube video URL

## Next Steps

To make these sections functional, you'll need to:

1. Add state management for features, runningCosts, and videoUrl in VanAdvertEditPage
2. Create expandable sections (like in CarAdvertEditPage) for each feature
3. Add form inputs for:
   - Features (checkbox list or text input)
   - Running costs (number inputs for MPG, tax, insurance, CO2)
   - Video URL (text input with YouTube validation)
4. Update the save/publish handlers to include these fields
5. Update the van controller to save these fields to database

## Database Compatibility

The updated Van model is now fully compatible with the Car model structure, enabling:
- Shared components between cars and vans
- Consistent data structure across vehicle types
- Easy migration of features from cars to vans
- Trade dealer support with VAT status
- Complete MOT history tracking
- Video adverts
- Feature lists
- Running costs display

## Files Modified

1. `backend/models/Van.js` - Added all new fields to match Car model

## Status: ✅ COMPLETE

Van model now has feature parity with Car model. The database schema is ready for all van features.
