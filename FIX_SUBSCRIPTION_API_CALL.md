# Fix Subscription via API Call

## Option 1: Using curl (from terminal)

### Step 1: Check Current Status

```bash
curl "https://your-backend-url.com/api/admin/check-subscription/rozeenacareers031@gmail.com?adminSecret=temp-fix-secret-123"
```

### Step 2: Fix the Subscription

```bash
curl -X POST https://your-backend-url.com/api/admin/fix-subscription \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rozeenacareers031@gmail.com",
    "adminSecret": "temp-fix-secret-123"
  }'
```

## Option 2: Using Postman or Insomnia

### Check Status
- **Method:** GET
- **URL:** `https://your-backend-url.com/api/admin/check-subscription/rozeenacareers031@gmail.com?adminSecret=temp-fix-secret-123`

### Fix Subscription
- **Method:** POST
- **URL:** `https://your-backend-url.com/api/admin/fix-subscription`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "rozeenacareers031@gmail.com",
  "adminSecret": "temp-fix-secret-123"
}
```

## Option 3: Using Browser Console

Open your deployed frontend in browser, open console (F12), and run:

```javascript
// Check status
fetch('https://your-backend-url.com/api/admin/check-subscription/rozeenacareers031@gmail.com?adminSecret=temp-fix-secret-123')
  .then(r => r.json())
  .then(console.log);

// Fix subscription
fetch('https://your-backend-url.com/api/admin/fix-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'rozeenacareers031@gmail.com',
    adminSecret: 'temp-fix-secret-123'
  })
})
  .then(r => r.json())
  .then(console.log);
```

## Option 4: Using PowerShell (Windows)

```powershell
# Check status
Invoke-RestMethod -Uri "https://your-backend-url.com/api/admin/check-subscription/rozeenacareers031@gmail.com?adminSecret=temp-fix-secret-123" -Method Get

# Fix subscription
$body = @{
    email = "rozeenacareers031@gmail.com"
    adminSecret = "temp-fix-secret-123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-backend-url.com/api/admin/fix-subscription" -Method Post -Body $body -ContentType "application/json"
```

## Replace URLs

Replace `https://your-backend-url.com` with your actual backend URL:
- If deployed on Render: `https://your-app.onrender.com`
- If deployed on Railway: `https://your-app.railway.app`
- If deployed on Heroku: `https://your-app.herokuapp.com`

## Security Note

After fixing the subscription, you should:

1. **Remove the admin fix routes** from `server.js`:
```javascript
// Remove this line:
app.use('/api/admin', adminFixRoutes);
```

2. **Or change the admin secret** in your production `.env`:
```bash
ADMIN_FIX_SECRET=your-new-secure-random-secret
```

## Expected Response

### Success Response:
```json
{
  "success": true,
  "message": "Subscription created and activated",
  "subscription": {
    "id": "...",
    "status": "active",
    "plan": "Starter",
    "listingsLimit": 50,
    "verified": true
  }
}
```

### Already Active Response:
```json
{
  "success": true,
  "message": "Subscription already active",
  "subscription": {
    "id": "...",
    "status": "active",
    "plan": "Starter"
  }
}
```

## After Fix

1. Deploy the updated backend code
2. Call the fix API endpoint
3. Test dealer login
4. Remove or secure the admin routes
