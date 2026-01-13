# Trade Dealer Subscription - Deployment Guide

## 🎯 Problem Statement

Trade dealers complete registration and payment, but after logout/login they see "No Active Subscription" on deployed environments (Render/Vercel). This works fine on localhost.

## 🔍 Root Cause

The subscription data is not being saved properly in the production database due to:
1. **Stripe webhook not configured** or not firing correctly
2. **Different databases** between local and production
3. **Missing environment variables** in production
4. **Database connection issues** in production

## ✅ Complete Solution

### Step 1: Ensure Subscription Plans Exist

**On Production Server:**
```bash
node scripts/seedSubscriptionPlans.js
```

**Or via API (if you have admin access):**
```bash
curl -X POST https://your-backend.com/api/admin/seed-plans \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Step 2: Configure Stripe Webhook

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/webhooks

2. **Add Endpoint:**
   - URL: `https://your-backend.com/api/payments/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Get Webhook Secret:**
   - Copy the webhook signing secret (starts with `whsec_`)
   - Add to production environment variables

4. **Test Webhook:**
   - Use Stripe CLI: `stripe listen --forward-to localhost:5000/api/payments/webhook`
   - Or use Stripe Dashboard "Send test webhook"

### Step 3: Set Environment Variables

**Required in Production (.env or hosting platform):**

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car-website?retryWrites=true&w=majority

# Stripe (LIVE keys for production)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Frontend URL
FRONTEND_URL=https://your-frontend.vercel.app

# Node Environment
NODE_ENV=production
```

### Step 4: Deploy Updated Backend

The backend now includes:
- ✅ Enhanced logging in subscription creation
- ✅ Webhook handler with detailed logging
- ✅ Admin fix routes for emergency fixes
- ✅ Proper error handling

**Deploy to your hosting platform:**

**Render:**
```bash
git push origin main
# Render auto-deploys
```

**Railway:**
```bash
railway up
```

**Heroku:**
```bash
git push heroku main
```

### Step 5: Fix Existing Dealer

**Option A: Using API (Fastest)**

```bash
# Check current status
curl "https://your-backend.com/api/admin/check-subscription/rozeenacareers031@gmail.com?adminSecret=temp-fix-secret-123"

# Fix subscription
curl -X POST https://your-backend.com/api/admin/fix-subscription \
  -H "Content-Type: application/json" \
  -d '{"email":"rozeenacareers031@gmail.com","adminSecret":"temp-fix-secret-123"}'
```

**Option B: Using Production Console**

If your hosting platform has a console/shell:
```bash
node scripts/quickFixDealerSubscription.js rozeenacareers031@gmail.com
```

**Option C: Using MongoDB Atlas**

Connect to MongoDB Atlas and run:
```javascript
// Find dealer
const dealer = db.tradedealers.findOne({ email: "rozeenacareers031@gmail.com" });

// Get plan
const plan = db.subscriptionplans.findOne({ slug: "starter" });

// Create subscription
db.tradesubscriptions.insertOne({
  dealerId: dealer._id,
  planId: plan._id,
  stripeSubscriptionId: "manual_" + Date.now(),
  stripeCustomerId: dealer.stripeCustomerId || "cus_manual",
  status: "active",
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  listingsLimit: plan.listingLimit,
  listingsUsed: 0,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Update dealer
db.tradedealers.updateOne(
  { _id: dealer._id },
  { $set: { 
    currentSubscriptionId: <subscription_id>,
    hasActiveSubscription: true,
    status: "active"
  }}
);
```

### Step 6: Verify the Fix

**Test the complete flow:**

1. **Login Test:**
   ```bash
   curl -X POST https://your-backend.com/api/trade/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"rozeenacareers031@gmail.com","password":"dealer-password"}'
   ```

2. **Check Response:**
   - Should include `subscription` object
   - `subscription.status` should be "active"
   - `subscription.plan` should have plan details

3. **Frontend Test:**
   - Login at your deployed frontend
   - Should see dashboard with subscription info
   - Should be able to add vehicles

### Step 7: Monitor Logs

**Check backend logs for:**

```
✅ Subscription saved to database: <id>
✅ Dealer updated with subscription: <id>
✅ WEBHOOK PROCESSING COMPLETE
```

**If you see errors:**
```
❌ Failed to save subscription: <error>
❌ WEBHOOK ERROR: <error>
```

Then check:
- Database connection
- Environment variables
- Stripe webhook configuration

## 🔒 Security - After Fix

Once everything works, **secure the admin routes:**

### Option 1: Remove Admin Fix Routes

In `backend/server.js`:
```javascript
// Remove or comment out:
// const adminFixRoutes = require('./routes/adminFixRoutes');
// app.use('/api/admin', adminFixRoutes);
```

### Option 2: Change Admin Secret

In production `.env`:
```bash
ADMIN_FIX_SECRET=your-new-secure-random-secret-here
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📋 Testing Checklist

After deployment, verify:

- [ ] Subscription plans exist in database
- [ ] Stripe webhook is configured and working
- [ ] Environment variables are set correctly
- [ ] Dealer can register with logo upload
- [ ] Payment redirects to Stripe correctly
- [ ] After payment, subscription is created
- [ ] Dealer can login and see subscription
- [ ] After logout/login, subscription persists
- [ ] Dealer can create vehicle listings
- [ ] Listing limits are enforced correctly

## 🆘 Troubleshooting

### Issue: "No Active Subscription" after login

**Diagnosis:**
```bash
node scripts/verifyProductionDealer.js rozeenacareers031@gmail.com
```

**Solutions:**
1. Run fix script: `node scripts/quickFixDealerSubscription.js <email>`
2. Check database connection
3. Verify subscription exists in database
4. Check subscription status is "active" or "trialing"

### Issue: Stripe webhook not firing

**Check:**
1. Webhook URL is correct in Stripe Dashboard
2. Webhook secret is set in environment variables
3. Backend is accessible from internet (not localhost)
4. Check Stripe webhook logs for errors

**Test webhook locally:**
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
stripe trigger checkout.session.completed
```

### Issue: Logo not uploading

**Check:**
1. Cloudinary credentials are set
2. File size is under 5MB
3. File is an image format
4. Multer middleware is configured

### Issue: Database connection fails

**Check:**
1. MongoDB Atlas IP whitelist includes your server IP
2. Or use `0.0.0.0/0` to allow all (less secure)
3. Connection string is correct
4. Database user has read/write permissions

## 📊 Monitoring

**Key metrics to monitor:**

1. **Subscription Creation Rate:**
   - How many subscriptions created per day
   - Success rate of webhook processing

2. **Login Success Rate:**
   - How many logins succeed
   - How many fail due to "No Active Subscription"

3. **Database Queries:**
   - `TradeSubscription.findActiveForDealer()` performance
   - Any slow queries

4. **Error Rates:**
   - Webhook processing errors
   - Subscription creation errors
   - Login errors

## 🔄 Regular Maintenance

**Weekly:**
- Check Stripe webhook logs for failures
- Verify all dealers have active subscriptions
- Check for expired subscriptions

**Monthly:**
- Review subscription usage
- Check for any orphaned subscriptions
- Verify database indexes are optimal

**Scripts for maintenance:**
```bash
# List all dealers
node scripts/listTradeDealers.js

# Check dealer subscription
node scripts/checkDealerSub.js <dealer-email>

# Verify all subscriptions
node scripts/diagnoseSubscriptionStorage.js
```

## 📞 Support

If issues persist:

1. Check backend logs: `heroku logs --tail` or similar
2. Check Stripe Dashboard → Webhooks → Events
3. Check MongoDB Atlas → Metrics
4. Run diagnostic scripts
5. Check environment variables are set

## 🎉 Success Criteria

System is working correctly when:

✅ Dealer registers with logo → Logo appears in Cloudinary
✅ Dealer completes payment → Subscription created in database
✅ Dealer logs in → Sees subscription info in dashboard
✅ Dealer logs out and back in → Subscription still active
✅ Dealer can create listings → Listings count increments
✅ Listing limits enforced → Can't exceed plan limit
✅ Webhook logs show successful processing
✅ No "No Active Subscription" errors
