# Production Deployment Guide - Stripe Payment Setup

## Current Status
✅ Test mode active - Using Stripe test keys
⚠️  Production deployment requires live keys

## Step-by-Step Production Setup

### 1. Stripe Dashboard Configuration

#### A. Get Live API Keys
1. Login to Stripe Dashboard: https://dashboard.stripe.com
2. Toggle from "Test mode" to "Live mode" (top right)
3. Go to Developers → API Keys
4. Copy these keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

#### B. Setup Webhook Endpoint
1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Enter your production URL: `https://your-domain.com/api/payments/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

#### C. Create Live Price IDs
1. Go to Products → Add Product
2. Create products for each advertising package:
   - Bronze Package (£X.XX)
   - Silver Package (£X.XX)
   - Gold Package (£X.XX)
3. Copy each **Price ID** (starts with `price_`)

### 2. Update Environment Variables

#### Backend (.env file)
```env
# Change from test to live keys
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
STRIPE_PRICE_ID=price_YOUR_LIVE_PRICE_ID

# Set to production
NODE_ENV=production
```

#### Frontend (.env.production file)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY_HERE
```

### 3. Database Considerations

#### Current Test Data
Aapke database mein jo data hai wo test payments se hai:
- Test Stripe session IDs
- Test payment intent IDs
- Test customer data

#### Production Cleanup Options

**Option 1: Clean Database (Recommended)**
```javascript
// Delete all test payment records
db.advertisingpackagepurchases.deleteMany({
  stripeSessionId: { $regex: /^cs_test_/ }
});

// Delete all test cars/bikes/vans
db.cars.deleteMany({
  'advertisingPackage.stripeSessionId': { $regex: /^cs_test_/ }
});
```

**Option 2: Keep Test Data (Add Flag)**
```javascript
// Add isTestMode flag to existing records
db.advertisingpackagepurchases.updateMany(
  { stripeSessionId: { $regex: /^cs_test_/ } },
  { $set: { isTestMode: true } }
);

// Filter out test data in queries
const purchases = await AdvertisingPackagePurchase.find({
  isTestMode: { $ne: true }
});
```

**Option 3: Separate Databases**
```env
# Use different database for production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/carcatalog-production
```

### 4. Code Changes Required

#### A. Add Test Mode Detection
```javascript
// backend/services/stripeService.js
class StripeService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
    
    if (this.isTestMode && process.env.NODE_ENV === 'production') {
      console.warn('⚠️  WARNING: Using test Stripe keys in production!');
    }
  }
}
```

#### B. Update Purchase Model
```javascript
// backend/models/AdvertisingPackagePurchase.js
const advertisingPackagePurchaseSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // Add test mode flag
  isTestMode: {
    type: Boolean,
    default: false
  }
});

// Auto-detect test mode from Stripe session ID
advertisingPackagePurchaseSchema.pre('save', function(next) {
  if (this.stripeSessionId) {
    this.isTestMode = this.stripeSessionId.startsWith('cs_test_');
  }
  next();
});
```

#### C. Filter Test Data in Queries
```javascript
// backend/controllers/advertController.js
async function getActiveCars(req, res) {
  const cars = await Car.find({
    status: 'active',
    // Exclude test mode purchases in production
    ...(process.env.NODE_ENV === 'production' && {
      'advertisingPackage.isTestMode': { $ne: true }
    })
  });
}
```

### 5. Testing Checklist

#### Before Going Live
- [ ] Test webhook endpoint is accessible
- [ ] Webhook signature verification works
- [ ] Payment success flow creates active adverts
- [ ] Payment failure is handled correctly
- [ ] Email notifications are sent
- [ ] Refund process works

#### Test with Stripe Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### 6. Deployment Steps

1. **Backup Database**
   ```bash
   mongodump --uri="your-mongodb-uri" --out=backup-$(date +%Y%m%d)
   ```

2. **Update Environment Variables**
   - Vercel: Dashboard → Settings → Environment Variables
   - Heroku: `heroku config:set STRIPE_SECRET_KEY=sk_live_...`
   - AWS: Update in Parameter Store / Secrets Manager

3. **Deploy Code**
   ```bash
   git add .
   git commit -m "Update to Stripe live keys"
   git push origin main
   ```

4. **Verify Webhook**
   - Stripe Dashboard → Webhooks → Test webhook
   - Check logs for successful delivery

5. **Monitor First Transactions**
   - Watch server logs
   - Check Stripe Dashboard → Payments
   - Verify database records

### 7. Rollback Plan

Agar kuch galat ho jaye:

```bash
# Revert to test keys
heroku config:set STRIPE_SECRET_KEY=sk_test_...
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_test_...

# Restore database
mongorestore --uri="your-mongodb-uri" backup-20260218/
```

### 8. Monitoring & Alerts

#### Setup Stripe Webhooks Monitoring
```javascript
// backend/server.js
app.post('/api/payments/webhook', async (req, res) => {
  try {
    // ... webhook handling ...
    
    // Log to monitoring service
    if (process.env.NODE_ENV === 'production') {
      console.log('✅ Webhook processed:', event.type);
      // Send to Sentry, LogRocket, etc.
    }
  } catch (error) {
    console.error('❌ Webhook failed:', error);
    // Alert team
  }
});
```

### 9. Security Checklist

- [ ] Never commit live keys to git
- [ ] Use environment variables only
- [ ] Enable Stripe Radar for fraud detection
- [ ] Set up webhook signature verification
- [ ] Enable 3D Secure for EU customers
- [ ] Monitor for suspicious activity

### 10. Common Issues & Solutions

#### Issue: Webhook not receiving events
**Solution:** Check firewall, ensure endpoint is publicly accessible

#### Issue: Payment succeeds but car not created
**Solution:** Check webhook logs, verify database connection

#### Issue: Duplicate payments
**Solution:** Implement idempotency checks (already done in code)

#### Issue: Test data showing in production
**Solution:** Add `isTestMode` filter to all queries

---

## Quick Reference

### Test vs Live Keys
```
Test:  pk_test_... / sk_test_... / whsec_test_...
Live:  pk_live_... / sk_live_... / whsec_...
```

### Environment Check
```javascript
const isProduction = process.env.NODE_ENV === 'production';
const isLiveStripe = !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');

if (isProduction && !isLiveStripe) {
  throw new Error('Production must use live Stripe keys!');
}
```

### Database Query Pattern
```javascript
// Always filter test data in production
const query = {
  status: 'active',
  ...(process.env.NODE_ENV === 'production' && {
    'advertisingPackage.isTestMode': { $ne: true }
  })
};
```

---

## Support Contacts

- Stripe Support: https://support.stripe.com
- Stripe Status: https://status.stripe.com
- Documentation: https://stripe.com/docs

---

**Last Updated:** February 2026
**Version:** 1.0
