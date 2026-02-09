# Write-Off Category Auto-Save - Complete Explanation

## English Version

### How It Works Automatically

When you add a new vehicle registration, the write-off category is **automatically** fetched and saved:

#### Step-by-Step Flow:

1. **User adds new vehicle** with registration number
   ```javascript
   POST /api/vehicles/lookup
   { registrationNumber: "ABC123", mileage: 50000, ... }
   ```

2. **Car model pre-save hook triggers** (automatically)
   - File: `backend/models/Car.js` (line 873-906)
   - Checks if `historyCheckStatus === 'pending'`
   - Calls `historyService.checkVehicleHistory(registrationNumber)`

3. **History Service fetches data** from API
   - File: `backend/services/historyService.js`
   - Calls CheckCarDetails API
   - Gets vehicle history including write-off data

4. **Parser extracts write-off category**
   - File: `backend/utils/historyResponseParser.js`
   - Parses API response
   - Extracts write-off category (A, B, C, D, S, N, or none)
   - Creates writeOffDetails object

5. **Data saved to database**
   - VehicleHistory record created with write-off category
   - Car record linked via `historyCheckId`
   - Write-off category stored as: "A", "B", "C", "D", "S", "N", or "none"

### What Gets Saved Automatically:

```javascript
{
  vrm: "ABC123",
  isWrittenOff: true,
  writeOffCategory: "N",  // ✅ Automatically saved!
  writeOffDetails: {
    category: "N",
    date: "2020-05-15",
    status: "CAT N VEHICLE DAMAGED",
    description: "CAT N VEHICLE DAMAGED"
  },
  accidentDetails: {
    count: 1,
    severity: "N",
    dates: ["2020-05-15"]
  }
}
```

### No Manual Work Required!

- ✅ Write-off category automatically fetched from API
- ✅ Automatically parsed and validated
- ✅ Automatically saved to database
- ✅ Automatically linked to vehicle record
- ✅ Works for all write-off categories (A, B, C, D, S, N)

---

## Urdu/Hindi Version (اردو/हिंदी)

### Kaise Automatically Kaam Karta Hai

Jab aap naya vehicle registration add karte hain, write-off category **automatically** fetch aur save ho jati hai:

#### Step-by-Step Process:

1. **User naya vehicle add karta hai** registration number ke saath
   ```javascript
   POST /api/vehicles/lookup
   { registrationNumber: "ABC123", mileage: 50000, ... }
   ```

2. **Car model ka pre-save hook automatically trigger hota hai**
   - File: `backend/models/Car.js` (line 873-906)
   - Check karta hai agar `historyCheckStatus === 'pending'`
   - Call karta hai `historyService.checkVehicleHistory(registrationNumber)`

3. **History Service API se data fetch karti hai**
   - File: `backend/services/historyService.js`
   - CheckCarDetails API ko call karti hai
   - Vehicle history milti hai including write-off data

4. **Parser write-off category extract karta hai**
   - File: `backend/utils/historyResponseParser.js`
   - API response ko parse karta hai
   - Write-off category extract karta hai (A, B, C, D, S, N, ya none)
   - writeOffDetails object banata hai

5. **Data database mein save ho jata hai**
   - VehicleHistory record create hota hai write-off category ke saath
   - Car record link ho jata hai `historyCheckId` se
   - Write-off category save hoti hai: "A", "B", "C", "D", "S", "N", ya "none"

### Kya Automatically Save Hota Hai:

```javascript
{
  vrm: "ABC123",
  isWrittenOff: true,
  writeOffCategory: "N",  // ✅ Automatically save hota hai!
  writeOffDetails: {
    category: "N",
    date: "2020-05-15",
    status: "CAT N VEHICLE DAMAGED",
    description: "CAT N VEHICLE DAMAGED"
  },
  accidentDetails: {
    count: 1,
    severity: "N",
    dates: ["2020-05-15"]
  }
}
```

### Koi Manual Kaam Nahi Chahiye!

- ✅ Write-off category automatically API se fetch hoti hai
- ✅ Automatically parse aur validate hoti hai
- ✅ Automatically database mein save hoti hai
- ✅ Automatically vehicle record se link hoti hai
- ✅ Sabhi write-off categories ke liye kaam karti hai (A, B, C, D, S, N)

### Example:

Agar aap registration "XYZ789" add karte hain aur wo Category N write-off hai:

```javascript
// Aap sirf yeh bhejte hain:
{
  registrationNumber: "XYZ789",
  mileage: 50000,
  price: 10000
}

// System automatically yeh save kar deta hai:
{
  registrationNumber: "XYZ789",
  historyCheckId: "507f1f77bcf86cd799439011",
  historyCheckStatus: "verified"
}

// Aur VehicleHistory mein automatically yeh save hota hai:
{
  vrm: "XYZ789",
  writeOffCategory: "N",  // ✅ Automatic!
  isWrittenOff: true,
  writeOffDetails: { ... }
}
```

### Testing:

Test karne ke liye:
```bash
cd backend
node test-new-registration-writeoff.js
```

Yeh test dikhayega ki kaise naya registration add karne par write-off category automatically save hoti hai.

---

## Important Notes / Zaroori Baatein:

### Requirements:
1. ✅ MongoDB running hona chahiye
2. ✅ `CHECKCARD_API_KEY` configured hona chahiye `.env` file mein
3. ✅ API daily limit exceed nahi honi chahiye

### What Happens if API Fails:
- Agar API daily limit exceed ho gayi: Status "pending" rahega, baad mein retry hoga
- Agar API key missing hai: History check skip ho jayega
- Agar network error hai: Status "failed" ho jayega

### All Write-Off Categories Supported:
- **A**: Scrap only (sabse zyada severe)
- **B**: Break for parts only
- **C**: Repairable (purana system, pre-2017)
- **D**: Repairable (purana system, pre-2017)
- **S**: Structural damage (naya system, post-2017)
- **N**: Non-structural damage (naya system, post-2017)
- **none**: Koi write-off nahi
- **unknown**: Category pata nahi

---

## Summary / Khulasa:

**Haan, bilkul!** Jab bhi aap naya registration add karenge:
1. ✅ System automatically API call karega
2. ✅ Write-off category automatically parse hogi
3. ✅ Database mein automatically save hogi
4. ✅ Vehicle record se automatically link hogi

**Aapko kuch manually karne ki zaroorat nahi hai!** 🎉
