# 🚀 Deployment Guide - CarCatALog

This guide covers deploying both the backend (Node.js/Express) and frontend (React/Vite) applications.

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Post-Deployment](#post-deployment)

---

## ✅ Pre-Deployment Checklist

### Required Services
- [ ] MongoDB Atlas account (or MongoDB server)
- [ ] Hosting platform account (Render, Railway, Heroku, DigitalOcean, etc.)
- [ ] Domain name (optional but recommended)
- [ ] Stripe account (for payments)
- [ ] Cloudinary account (for image uploads)
- [ ] Email service (for notifications)

### Code Preparation
- [ ] All environment variables documented
- [ ] Database connection tested
- [ ] API endpoints tested
- [ ] Build process verified locally
- [ ] Dependencies up to date

---

## 🔧 Backend Deployment

### Option 1: Deploy to Render (Recommended)

#### Step 1: Prepare Your Repository
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"

#### Step 3: Configure Service
- **Name**: `carcatalog-backend`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free (or paid for production)

#### Step 4: Add Environment Variables
In Render dashboard, add all variables from `backend/.env.example`:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secure-random-string-here
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-domain.com
STRIPE_SECRET_KEY=sk_live_your-live-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
# ... add all other required variables
```

#### Step 5: Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Note your backend URL: `https://carcatalog-backend.onrender.com`

### Option 2: Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Add environment variables
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your-connection-string
# ... add all other variables

# Deploy
railway up
```

### Option 3: Deploy to DigitalOcean App Platform

1. Create DigitalOcean account
2. Go to App Platform
3. Connect GitHub repository
4. Configure:
   - **Source Directory**: `backend`
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
5. Add environment variables
6. Deploy

---

## 🎨 Frontend Deployment

### Option 1: Deploy to Vercel (Recommended for React)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy
```bash
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? carcatalog-frontend
# - Directory? ./
# - Override settings? No
```

#### Step 3: Configure Environment Variables
In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add:
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-key
```

#### Step 4: Deploy to Production
```bash
vercel --prod
```

### Option 2: Deploy to Netlify

#### Using Netlify CLI:
```bash
# Install Netlify CLI
npm install -g netlify-cli

cd frontend

# Login
netlify login

# Build
npm run build

# Deploy
netlify deploy --prod

# Follow prompts and set publish directory to: dist
```

#### Using Netlify Dashboard:
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add environment variables
6. Deploy

### Option 3: Deploy to Render (Static Site)

1. In Render dashboard, click "New +" → "Static Site"
2. Connect repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables
5. Deploy

---

## 🔐 Environment Variables

### Backend Environment Variables

Create these in your hosting platform:

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/carcatalog?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secure-random-string-min-32-chars
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=https://your-frontend-domain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (NodeMailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# APIs
DVLA_API_KEY=your-dvla-key
CHECKCARD_API_KEY=your-checkcard-key
POSTCODE_API_URL=https://api.postcodes.io

# OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-url.com/api/auth/google/callback

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=https://your-backend-url.com/api/auth/facebook/callback
```

### Frontend Environment Variables

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
```

---

## 💾 Database Setup

### MongoDB Atlas Setup

1. **Create Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Shared" (Free tier)
   - Select region closest to your users
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and strong password
   - Set role to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add specific IPs of your hosting platform

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `carcatalog`

6. **Seed Initial Data** (Optional)
   ```bash
   # Connect to your production database
   MONGODB_URI=your-production-uri node backend/scripts/seedSubscriptionPlans.js
   MONGODB_URI=your-production-uri node backend/scripts/seedNewVans.js
   MONGODB_URI=your-production-uri node backend/scripts/seedBikes.js
   ```

---

## 🔄 Post-Deployment

### 1. Verify Backend Deployment

Test your API endpoints:
```bash
# Health check
curl https://your-backend-url.com/api/health

# Test van count
curl https://your-backend-url.com/api/vans/count

# Test bike count
curl https://your-backend-url.com/api/bikes/count
```

### 2. Verify Frontend Deployment

1. Visit your frontend URL
2. Check that pages load correctly
3. Test navigation between pages
4. Verify API calls are working (check browser console)

### 3. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter: `https://your-backend-url.com/api/payments/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy webhook signing secret
6. Add to backend environment variables as `STRIPE_WEBHOOK_SECRET`

### 4. Configure Custom Domain (Optional)

#### For Backend (Render):
1. Go to Settings → Custom Domain
2. Add your domain (e.g., `api.carcatalog.com`)
3. Update DNS records as instructed

#### For Frontend (Vercel):
1. Go to Settings → Domains
2. Add your domain (e.g., `carcatalog.com`)
3. Update DNS records as instructed

### 5. Enable HTTPS

Most platforms (Render, Vercel, Netlify) provide automatic HTTPS. Verify:
- Backend URL uses `https://`
- Frontend URL uses `https://`
- Update `FRONTEND_URL` in backend env vars
- Update `VITE_API_URL` in frontend env vars

### 6. Monitor Application

Set up monitoring:
- **Render**: Built-in logs and metrics
- **Vercel**: Analytics dashboard
- **External**: Consider Sentry for error tracking

### 7. Set Up Backups

For MongoDB Atlas:
- Go to "Backup" tab
- Enable Cloud Backup (available on paid tiers)
- Or set up manual backup scripts

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Cannot connect to MongoDB
```bash
# Solution: Check connection string format
# Ensure password is URL-encoded
# Verify IP whitelist in MongoDB Atlas
```

**Problem**: Environment variables not loading
```bash
# Solution: Verify all variables are set in hosting platform
# Check for typos in variable names
# Restart the service after adding variables
```

**Problem**: CORS errors
```bash
# Solution: Update FRONTEND_URL in backend env vars
# Ensure CORS is configured correctly in server.js
```

### Frontend Issues

**Problem**: API calls failing
```bash
# Solution: Check VITE_API_URL is correct
# Verify backend is running
# Check browser console for errors
```

**Problem**: Build fails
```bash
# Solution: Run `npm run build` locally first
# Check for TypeScript/ESLint errors
# Verify all dependencies are in package.json
```

**Problem**: Environment variables not working
```bash
# Solution: Ensure variables start with VITE_
# Rebuild after changing env vars
# Clear cache and redeploy
```

---

## 📊 Performance Optimization

### Backend
- Enable compression middleware
- Set up Redis for caching (optional)
- Use MongoDB indexes for frequently queried fields
- Enable rate limiting

### Frontend
- Enable code splitting
- Optimize images (use WebP format)
- Implement lazy loading for routes
- Use CDN for static assets

---

## 🔒 Security Checklist

- [ ] All API keys are in environment variables (not in code)
- [ ] JWT secret is strong and random
- [ ] HTTPS is enabled on both frontend and backend
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] MongoDB connection uses authentication
- [ ] Stripe webhook signature verification is enabled
- [ ] Sensitive data is not logged

---

## 📝 Deployment Commands Quick Reference

### Backend (Render)
```bash
# Automatic deployment on git push to main branch
git push origin main
```

### Frontend (Vercel)
```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel
```

### Database Seeding
```bash
# Seed subscription plans
MONGODB_URI=your-uri node backend/scripts/seedSubscriptionPlans.js

# Seed vans
MONGODB_URI=your-uri node backend/scripts/seedNewVans.js

# Seed bikes
MONGODB_URI=your-uri node backend/scripts/seedBikes.js
```

---

## 🎉 Success!

Your application should now be live! 

- **Frontend**: https://your-frontend-domain.com
- **Backend**: https://your-backend-domain.com
- **Admin Panel**: https://your-frontend-domain.com/trade/login

### Next Steps
1. Test all functionality in production
2. Set up monitoring and alerts
3. Configure automated backups
4. Plan for scaling as traffic grows
5. Set up CI/CD pipeline for automated deployments

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review hosting platform documentation
3. Check application logs
4. Verify all environment variables are set correctly

Good luck with your deployment! 🚀
