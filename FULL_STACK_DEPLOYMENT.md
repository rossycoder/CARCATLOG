# 🚀 Full Stack Deployment Guide - CarCatALog

Complete guide for deploying both backend and frontend together.

## 📋 Quick Start

Use the automated deployment script:

```bash
# Linux/Mac
./deploy.sh

# Windows
deploy.bat
```

Or follow the manual steps below for more control.

---

## 🎯 Deployment Strategy

### Recommended Setup
- **Backend**: Render (Node.js Web Service)
- **Frontend**: Vercel (React/Vite Static Site)
- **Database**: MongoDB Atlas (Free Tier)
- **CDN**: Cloudinary (Image Storage)

### Why This Stack?
- ✅ Free tier available for all services
- ✅ Automatic HTTPS
- ✅ Easy GitHub integration
- ✅ Auto-deploy on push
- ✅ Great performance

---

## 🔧 Step 1: Backend Deployment (Render)

### 1.1 Prepare Backend

Ensure your backend is ready:

```bash
cd backend
npm install
npm start  # Test locally first
```

### 1.2 Push to GitHub

```bash
git add .
git commit -m "Prepare backend for deployment"
git push origin main
```

### 1.3 Deploy to Render

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your repository
4. Configure:

```
Name: carcatalog-backend
Region: Frankfurt (EU Central) or closest to you
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

5. Click **"Advanced"** and add environment variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<generate-strong-secret>
FRONTEND_URL=<will-add-after-frontend-deploy>
STRIPE_SECRET_KEY=<your-stripe-secret>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-app-password>
EMAIL_FROM=CarCatALog <noreply@carcatalog.com>
POSTCODE_API_URL=https://api.postcodes.io
DVLA_API_KEY=<your-dvla-key>
CHECKCARD_API_KEY=<your-checkcard-key>
API_ENVIRONMENT=production
```

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. Note your backend URL: `https://carcatalog-backend.onrender.com`

### 1.4 Verify Backend

Test your API:

```bash
# Health check
curl https://your-backend-url.onrender.com/api/health

# Test endpoints
curl https://your-backend-url.onrender.com/api/vans/count
curl https://your-backend-url.onrender.com/api/bikes/count
```

---

## 🎨 Step 2: Frontend Deployment (Vercel)

### 2.1 Prepare Frontend

Create production environment file:

```bash
cd frontend
cp .env.production.template .env.production
```

Edit `.env.production`:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
```

Test build locally:

```bash
npm install
npm run build
npm run preview  # Test the production build
```

### 2.2 Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? carcatalog-frontend
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your repository
4. Configure:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

5. Add environment variables:
   - `VITE_API_URL`: `https://your-backend-url.onrender.com/api`
   - `VITE_STRIPE_PUBLISHABLE_KEY`: `pk_live_...`

6. Click **"Deploy"**
7. Note your frontend URL: `https://carcatalog-frontend.vercel.app`

### 2.3 Update Backend with Frontend URL

Go back to Render dashboard:
1. Open your backend service
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your Vercel URL
4. Save changes (this will trigger a redeploy)

---

## 💾 Step 3: Database Setup (MongoDB Atlas)

### 3.1 Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free
3. Create a new cluster (M0 Free tier)

### 3.2 Configure Database

1. **Create Database User**:
   - Go to **Database Access**
   - Click **"Add New Database User"**
   - Username: `carcatalog_admin`
   - Password: Generate strong password
   - Role: **Atlas admin** or **Read and write to any database**

2. **Configure Network Access**:
   - Go to **Network Access**
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add Render's IP addresses

3. **Get Connection String**:
   - Go to **Database** → **Connect**
   - Choose **"Connect your application"**
   - Copy connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `carcatalog`

Example:
```
mongodb+srv://carcatalog_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/carcatalog?retryWrites=true&w=majority
```

### 3.3 Seed Database

```bash
# Set your MongoDB URI
export MONGODB_URI="your-connection-string"

# Seed subscription plans (required)
node backend/scripts/seedSubscriptionPlans.js

# Seed test data (optional)
node backend/scripts/seedNewVans.js
node backend/scripts/seedBikes.js
```

---

## 🔐 Step 4: Configure Stripe Webhooks

### 4.1 Create Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **"Add endpoint"**
4. Enter endpoint URL:
   ```
   https://your-backend-url.onrender.com/api/payments/webhook
   ```

5. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

6. Click **"Add endpoint"**
7. Copy the **Signing secret** (starts with `whsec_`)

### 4.2 Update Backend Environment

Add the webhook secret to Render:
1. Go to your backend service on Render
2. **Environment** tab
3. Add/update: `STRIPE_WEBHOOK_SECRET=whsec_your_secret`
4. Save (triggers redeploy)

---

## ✅ Step 5: Verification & Testing

### 5.1 Test Backend

```bash
# Health check
curl https://your-backend-url.onrender.com/api/health

# Test authentication
curl -X POST https://your-backend-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

### 5.2 Test Frontend

1. Visit your frontend URL
2. Check browser console for errors
3. Test key features:
   - ✅ Homepage loads
   - ✅ Search works
   - ✅ Vehicle listings display
   - ✅ User registration/login
   - ✅ Payment flow (use Stripe test cards)

### 5.3 Test Integration

1. **API Connectivity**: Check Network tab in browser DevTools
2. **CORS**: Ensure no CORS errors in console
3. **Authentication**: Try logging in
4. **Payments**: Test with Stripe test card: `4242 4242 4242 4242`

---

## 🌐 Step 6: Custom Domains (Optional)

### 6.1 Backend Domain

In Render:
1. Go to **Settings** → **Custom Domain**
2. Add domain: `api.yourdomain.com`
3. Update DNS records as instructed:
   ```
   Type: CNAME
   Name: api
   Value: your-app.onrender.com
   ```

### 6.2 Frontend Domain

In Vercel:
1. Go to **Settings** → **Domains**
2. Add domain: `yourdomain.com` and `www.yourdomain.com`
3. Update DNS records as instructed:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### 6.3 Update Environment Variables

After adding custom domains:

**Backend** (Render):
- Update `FRONTEND_URL` to `https://yourdomain.com`

**Frontend** (Vercel):
- Update `VITE_API_URL` to `https://api.yourdomain.com/api`

---

## 🔄 Step 7: Enable Auto-Deploy

### 7.1 Backend (Render)

Render automatically deploys on push to main branch.

To configure:
1. Go to **Settings** → **Build & Deploy**
2. Ensure **Auto-Deploy** is enabled
3. Set branch to `main`

### 7.2 Frontend (Vercel)

Vercel automatically deploys on push to main branch.

To configure:
1. Go to **Settings** → **Git**
2. Ensure **Production Branch** is set to `main`
3. Enable **Automatic Deployments**

### 7.3 Test Auto-Deploy

```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test auto-deploy"
git push origin main

# Watch deployments in Render and Vercel dashboards
```

---

## 📊 Step 8: Monitoring & Maintenance

### 8.1 Set Up Monitoring

**Render**:
- View logs in dashboard
- Set up email alerts for failures
- Monitor resource usage

**Vercel**:
- View deployment logs
- Enable Analytics (optional)
- Monitor build times

### 8.2 Database Backups

**MongoDB Atlas**:
1. Go to **Backup** tab
2. Enable **Cloud Backup** (paid feature)
3. Or export manually:
   ```bash
   mongodump --uri="your-connection-string" --out=./backup
   ```

### 8.3 Error Tracking (Optional)

Consider adding Sentry:

```bash
# Install Sentry
npm install @sentry/react @sentry/node

# Configure in both frontend and backend
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Service won't start
```bash
# Check logs in Render dashboard
# Verify all environment variables are set
# Check MongoDB connection string
```

**Problem**: CORS errors
```bash
# Ensure FRONTEND_URL is set correctly in backend
# Check CORS configuration in server.js
# Verify frontend URL matches exactly (no trailing slash)
```

**Problem**: Database connection fails
```bash
# Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
# Check connection string format
# Ensure password is URL-encoded
```

### Frontend Issues

**Problem**: API calls fail
```bash
# Check VITE_API_URL in Vercel environment variables
# Verify backend is running
# Check browser console for errors
# Test API endpoint directly with curl
```

**Problem**: Build fails
```bash
# Run `npm run build` locally first
# Check for TypeScript/ESLint errors
# Verify all dependencies are in package.json
# Check Node version compatibility
```

**Problem**: Environment variables not working
```bash
# Ensure variables start with VITE_
# Rebuild after changing env vars in Vercel
# Clear cache: vercel --force
```

### Payment Issues

**Problem**: Stripe webhooks not working
```bash
# Verify webhook URL is correct
# Check webhook signing secret
# Test with Stripe CLI: stripe listen --forward-to localhost:5000/api/payments/webhook
# Check Render logs for webhook errors
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] MongoDB Atlas cluster created
- [ ] Stripe account configured
- [ ] Cloudinary account set up

### Backend Deployment
- [ ] Render service created
- [ ] All environment variables added
- [ ] Service deployed successfully
- [ ] Health check endpoint working
- [ ] Database connection verified
- [ ] API endpoints responding

### Frontend Deployment
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] Build successful
- [ ] Site accessible
- [ ] API calls working
- [ ] No console errors

### Integration
- [ ] CORS configured correctly
- [ ] Stripe webhooks configured
- [ ] Email service working
- [ ] Image uploads working
- [ ] Authentication working
- [ ] Payments working

### Post-Deployment
- [ ] Custom domains configured (if applicable)
- [ ] Auto-deploy enabled
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Team notified

---

## 📝 Environment Variables Reference

### Backend (Render)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-min-32-chars
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend.vercel.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=CarCatALog <noreply@carcatalog.com>
POSTCODE_API_URL=https://api.postcodes.io
DVLA_API_KEY=your-key
CHECKCARD_API_KEY=your-key
API_ENVIRONMENT=production
```

### Frontend (Vercel)

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 🎉 Success!

Your full-stack application is now deployed!

- **Frontend**: https://your-frontend.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Database**: MongoDB Atlas
- **Payments**: Stripe
- **Images**: Cloudinary

### Next Steps

1. **Test thoroughly** in production
2. **Monitor** logs and errors
3. **Set up** automated backups
4. **Configure** custom domains
5. **Enable** analytics
6. **Plan** for scaling

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Stripe Docs**: https://stripe.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation

Good luck with your deployment! 🚀
