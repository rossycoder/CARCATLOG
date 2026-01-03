# 🚀 Quick Deployment Checklist

Use this checklist to ensure a smooth deployment process.

## 📋 Pre-Deployment

### Code Preparation
- [ ] All code committed and pushed to GitHub
- [ ] No sensitive data in code (API keys, passwords)
- [ ] `.env` files are in `.gitignore`
- [ ] Dependencies are up to date
- [ ] Build process tested locally (`npm run build`)
- [ ] All tests passing

### Accounts Setup
- [ ] MongoDB Atlas account created
- [ ] Hosting platform account (Render/Vercel) created
- [ ] Stripe account configured
- [ ] Cloudinary account set up
- [ ] Domain name purchased (optional)

---

## 🗄️ Database Setup

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] Network access configured (0.0.0.0/0 or specific IPs)
- [ ] Connection string obtained
- [ ] Connection string tested locally

---

## 🔧 Backend Deployment

### Render Setup
- [ ] New Web Service created
- [ ] GitHub repository connected
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Instance type selected

### Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `MONGODB_URI` (from Atlas)
- [ ] `JWT_SECRET` (strong random string)
- [ ] `JWT_EXPIRE=7d`
- [ ] `FRONTEND_URL` (your frontend domain)
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `EMAIL_HOST`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASSWORD`
- [ ] `DVLA_API_KEY`
- [ ] `CHECKCARD_API_KEY`
- [ ] OAuth credentials (if using)

### Deployment
- [ ] Service deployed successfully
- [ ] Backend URL noted
- [ ] Health check endpoint tested
- [ ] API endpoints responding

---

## 🎨 Frontend Deployment

### Vercel Setup
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Logged into Vercel
- [ ] Project initialized
- [ ] Build settings configured

### Environment Variables
- [ ] `VITE_API_URL` (backend URL + /api)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`

### Deployment
- [ ] Production deployment completed
- [ ] Frontend URL noted
- [ ] Site loads correctly
- [ ] API calls working
- [ ] Navigation working
- [ ] Forms submitting correctly

---

## 🔐 Security Configuration

- [ ] All API keys in environment variables
- [ ] JWT secret is strong (32+ characters)
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS configured with correct frontend URL
- [ ] MongoDB uses authentication
- [ ] Rate limiting enabled
- [ ] Input validation implemented

---

## 💳 Stripe Configuration

- [ ] Stripe account in live mode
- [ ] Live API keys obtained
- [ ] Webhook endpoint created: `https://your-backend/api/payments/webhook`
- [ ] Webhook events selected:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
- [ ] Webhook signing secret added to backend env vars
- [ ] Test payment completed successfully

---

## 📧 Email Configuration

- [ ] Email service configured (Gmail/SendGrid)
- [ ] App-specific password created (if Gmail)
- [ ] Test email sent successfully
- [ ] Email templates working

---

## 🌐 Domain Configuration (Optional)

### Backend Domain
- [ ] Custom domain added in Render
- [ ] DNS records updated
- [ ] SSL certificate issued
- [ ] Domain accessible via HTTPS

### Frontend Domain
- [ ] Custom domain added in Vercel
- [ ] DNS records updated
- [ ] SSL certificate issued
- [ ] Domain accessible via HTTPS

### Update URLs
- [ ] `FRONTEND_URL` updated in backend env vars
- [ ] `VITE_API_URL` updated in frontend env vars
- [ ] Stripe webhook URL updated
- [ ] OAuth callback URLs updated

---

## 🗃️ Database Seeding

- [ ] Subscription plans seeded
- [ ] Test vans seeded (optional)
- [ ] Test bikes seeded (optional)
- [ ] Test trade dealer account created

---

## ✅ Post-Deployment Testing

### Backend Tests
- [ ] Health check: `GET /api/health`
- [ ] Van count: `GET /api/vans/count`
- [ ] Bike count: `GET /api/bikes/count`
- [ ] Authentication working
- [ ] File uploads working
- [ ] Email sending working
- [ ] Stripe payments working

### Frontend Tests
- [ ] Homepage loads
- [ ] Vans page shows count
- [ ] Bikes page shows count
- [ ] Search functionality works
- [ ] User registration works
- [ ] User login works
- [ ] Trade dealer login works
- [ ] Payment flow works
- [ ] All navigation links work
- [ ] Mobile responsive
- [ ] No console errors

---

## 📊 Monitoring Setup

- [ ] Error tracking configured (Sentry/LogRocket)
- [ ] Uptime monitoring set up
- [ ] Performance monitoring enabled
- [ ] Log aggregation configured
- [ ] Alerts configured for critical errors

---

## 🔄 Backup Configuration

- [ ] MongoDB Atlas backups enabled
- [ ] Backup schedule configured
- [ ] Backup restoration tested
- [ ] Environment variables backed up securely

---

## 📝 Documentation

- [ ] Deployment guide reviewed
- [ ] API documentation updated
- [ ] Environment variables documented
- [ ] Troubleshooting guide created
- [ ] Team members trained

---

## 🎉 Launch Checklist

- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Security audit completed
- [ ] Legal pages updated (Terms, Privacy)
- [ ] Analytics configured
- [ ] SEO optimized
- [ ] Social media cards configured
- [ ] Favicon added
- [ ] 404 page configured
- [ ] Maintenance page ready

---

## 📞 Emergency Contacts

**Hosting Issues:**
- Render Support: support@render.com
- Vercel Support: support@vercel.com

**Database Issues:**
- MongoDB Atlas Support: https://support.mongodb.com

**Payment Issues:**
- Stripe Support: https://support.stripe.com

**Domain Issues:**
- Your domain registrar support

---

## 🚨 Rollback Plan

If deployment fails:

1. **Backend Rollback:**
   ```bash
   # In Render dashboard
   # Go to Events → Find last successful deployment → Redeploy
   ```

2. **Frontend Rollback:**
   ```bash
   # In Vercel dashboard
   # Go to Deployments → Find last successful deployment → Promote to Production
   ```

3. **Database Rollback:**
   - Restore from latest backup in MongoDB Atlas

---

## ✨ Success Criteria

Deployment is successful when:
- [ ] Frontend loads without errors
- [ ] Backend API responds correctly
- [ ] Database connections stable
- [ ] Payments processing successfully
- [ ] Emails sending correctly
- [ ] No critical errors in logs
- [ ] Performance metrics acceptable
- [ ] All core features working

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Backend URL:** _________________

**Frontend URL:** _________________

**Notes:** _________________
