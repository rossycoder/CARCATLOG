# Authentication Debug Guide - My Listings Page

## Problem (مسئلہ)
Jab user already signed in hai aur "My Listings" page par jata hai, toh signin page par redirect ho raha hai.

## Possible Causes (ممکنہ وجوہات)

### 1. Token Expired (ٹوکن ختم ہو گیا)
- JWT token ki expiry time khatam ho gayi hai
- Backend 401 return kar raha hai

### 2. User Data Missing (یوزر ڈیٹا غائب)
- localStorage mein token hai lekin user object nahi hai
- AuthContext user ko null set kar deta hai

### 3. Token Invalid (ٹوکن غلط)
- Token corrupt ho gaya hai
- Backend verify nahi kar pa raha

## Debugging Steps (ڈیبگنگ کے قدم)

### Step 1: Check Browser Console
Browser console kholo (F12) aur dekho:
```
1. Koi error messages?
2. "[Vehicle Controller] Unauthenticated request to my-listings" message?
3. Network tab mein /api/vehicles/my-listings request ka status code?
```

### Step 2: Check localStorage
Browser console mein yeh commands run karo:
```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));

// Check if user exists
console.log('User:', localStorage.getItem('user'));

// Check token expiry (if JWT)
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token expires at:', new Date(payload.exp * 1000));
  console.log('Current time:', new Date());
  console.log('Token expired?', Date.now() > payload.exp * 1000);
}
```

### Step 3: Test API Call Manually
Browser console mein:
```javascript
// Test the API call
fetch('http://localhost:5000/api/vehicles/my-listings', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

## Solutions Applied (لاگو کیے گئے حل)

### 1. Improved AuthContext Loading
**File:** `src/context/AuthContext.jsx`

**Changes:**
- Pehle localStorage se user load hota hai (fast)
- Phir background mein backend se verify hota hai
- Agar token expire hai toh logout kar deta hai

### 2. Better API Error Handling
**File:** `src/services/api.js`

**Changes:**
- 401 error par properly cleanup hota hai
- Current path save hota hai redirect ke liye
- Signin/signup pages par already hone par redirect nahi hota

### 3. MyListingsPage Already Correct
**File:** `src/pages/MyListingsPage.jsx`

**Status:** ✅ No changes needed
- Properly waits for `authLoading`
- Handles 401 errors correctly

## Testing Steps (ٹیسٹنگ کے قدم)

### Test 1: Fresh Login
1. Browser mein `/signin` par jao
2. Login karo
3. `/my-listings` par jao
4. ✅ Listings show honi chahiye (ya empty state)

### Test 2: Page Refresh
1. `/my-listings` par ho
2. Page refresh karo (F5)
3. ✅ Listings wapas load honi chahiye (signin par nahi jana chahiye)

### Test 3: Expired Token
1. Backend mein token expiry time kam karo (testing ke liye)
2. Token expire hone do
3. `/my-listings` par jao
4. ✅ Signin page par redirect hona chahiye
5. ✅ Login ke baad wapas `/my-listings` par ana chahiye

## Common Issues & Fixes (عام مسائل اور حل)

### Issue 1: "Token is null"
**Fix:** Signin karo phir se

### Issue 2: "Token expired"
**Fix:** Backend mein JWT_EXPIRES_IN setting check karo
```javascript
// backend/.env
JWT_EXPIRES_IN=7d  // 7 days
```

### Issue 3: "User not found"
**Fix:** Database mein user exist karta hai check karo
```bash
# Backend directory mein
node -e "const User = require('./models/User'); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => User.find().then(users => console.log(users)));"
```

### Issue 4: CORS Error
**Fix:** Backend mein CORS properly configured hai check karo
```javascript
// backend/server.js
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true
}));
```

## Next Steps (اگلے قدم)

1. ✅ AuthContext improved - loads user faster
2. ✅ API interceptor improved - better error handling
3. ⏳ Test karo aur dekho issue resolve hua ya nahi
4. ⏳ Agar issue persist kare toh debugging steps follow karo

## Backend Token Expiry Check

Backend mein `.env` file check karo:
```bash
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

Agar `JWT_EXPIRES_IN` bahut kam hai (e.g., 1h), toh increase karo to 7d ya 30d.
