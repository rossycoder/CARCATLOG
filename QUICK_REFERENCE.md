# 📋 Quick Reference Card

## 🚀 Deployment Commands

### Backend (Render)
```bash
# Automatic on git push
git push origin main
```

### Frontend (Vercel)
```bash
# Deploy to production
cd frontend
vercel --prod
```

### Database Seeding
```bash
# Set your MongoDB URI
export MONGODB_URI="your-connection-string"

# Seed subscription plans
node backend/scripts/seedSubscriptionPlans.js

# Seed test vans
node backend/scripts/seedNewVans.js

# Seed test bikes
node backend/scripts/seedBikes.js
```

---

## 🔗 Important URLs

### Development
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017/car-website`

### Production (Update these)
- Backend: `https://your-backend.onrender.com`
- Frontend: `https://your-frontend.vercel.app`
- MongoDB: `mongodb+srv://...`

---

## 🧪 Testing Endpoints

```bash
# Health check
curl https://your-backend.com/api/health

# Van count
curl https://your-backend.com/api/vans/count

# Bike count
curl https://your-backend.com/api/bikes/count

# Get vans
curl https://your-backend.com/api/vans

# Get bikes
curl https://your-backend.com/api/bikes
```

---

## 🔐 Environment Variables Quick List

### Backend Essentials
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-frontend.com
STRIPE_SECRET_KEY=sk_live_...
```

### Frontend Essentials
```env
VITE_API_URL=https://your-backend.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 📦 Build Commands

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run build
npm run preview  # Test production build locally
```

---

## 🔧 Common Tasks

### Update Dependencies
```bash
# Backend
cd backend && npm update

# Frontend
cd frontend && npm update
```

### Check for Security Issues
```bash
# Backend
cd backend && npm audit

# Frontend
cd frontend && npm audit
```

### View Logs
```bash
# Render: Dashboard → Logs
# Vercel: Dashboard → Deployments → View Logs
```

### Rollback Deployment
```bash
# Render: Events → Previous deployment → Redeploy
# Vercel: Deployments → Previous → Promote to Production
```

---

## 🐛 Debugging

### Backend Not Responding
1. Check Render logs
2. Verify environment variables
3. Check MongoDB connection
4. Verify PORT is set to 5000

### Frontend API Errors
1. Check browser console
2. Verify VITE_API_URL
3. Check CORS settings
4. Test backend endpoints directly

### Database Connection Issues
1. Check MongoDB Atlas IP whitelist
2. Verify connection string format
3. Check database user permissions
4. Test connection locally

### Payment Issues
1. Verify Stripe keys (live vs test)
2. Check webhook configuration
3. Review Stripe dashboard logs
4. Test with Stripe test cards

---

## 📊 Monitoring

### Check Application Health
```bash
# Backend uptime
curl https://your-backend.com/api/health

# Frontend uptime
curl https://your-frontend.com

# Database connection
# Check MongoDB Atlas dashboard
```

### View Metrics
- **Render**: Dashboard → Metrics
- **Vercel**: Dashboard → Analytics
- **MongoDB**: Atlas → Metrics

---

## 🔄 Update Workflow

1. **Make Changes Locally**
   ```bash
   # Make your changes
   git add .
   git commit -m "Description"
   ```

2. **Test Locally**
   ```bash
   # Backend
   cd backend && npm start
   
   # Frontend
   cd frontend && npm run dev
   ```

3. **Deploy**
   ```bash
   # Push to GitHub (triggers Render deployment)
   git push origin main
   
   # Deploy frontend
   cd frontend && vercel --prod
   ```

4. **Verify**
   - Check deployment logs
   - Test production URLs
   - Monitor for errors

---

## 🆘 Emergency Contacts

- **Render Support**: support@render.com
- **Vercel Support**: support@vercel.com
- **MongoDB Support**: https://support.mongodb.com
- **Stripe Support**: https://support.stripe.com

---

## 📱 Mobile Testing

Test these on mobile devices:
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Forms are usable
- [ ] Payments work
- [ ] Images load correctly
- [ ] Responsive design works

---

## ✅ Pre-Launch Checklist

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database seeded
- [ ] Stripe webhooks configured
- [ ] Email service working
- [ ] SSL certificates active
- [ ] Custom domains configured
- [ ] Analytics set up
- [ ] Error tracking enabled
- [ ] Backups configured

---

## 🎯 Performance Targets

- **Page Load**: < 3 seconds
- **API Response**: < 500ms
- **Database Query**: < 100ms
- **Uptime**: > 99.9%

---

## 📞 Support Resources

- **Documentation**: See DEPLOYMENT_GUIDE.md
- **Checklist**: See DEPLOYMENT_CHECKLIST.md
- **Summary**: See DEPLOYMENT_SUMMARY.md

---

**Last Updated**: [Date]
**Version**: 1.0.0
