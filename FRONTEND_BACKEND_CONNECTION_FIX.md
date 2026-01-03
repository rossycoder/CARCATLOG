# 🔧 Frontend-Backend Connection Fix

## Problem
- Backend deployed: `https://carcatlog-backend-1.onrender.com/`
- Frontend deployed: `https://idyllic-tapioca-67e6b7.netlify.app/`
- Frontend cannot connect to backend

## Root Causes
1. Frontend environment variable not set in Netlify
2. Backend CORS not allowing Netlify domain
3. Frontend .env file still pointing to localhost

---

## ✅ Solution Steps

### Step 1: Update Netlify Environment Variables

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site: `idyllic-tapioca-67e6b7`
3. Go to **Site settings** → **Environment variables**
4. Add these variables:

```
VITE_API_URL=https://carcatlog-backend-1.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SZufOD5YDWEPfCdXwTt3y7XYmK3bDnvPkGzxK49qXOuJebLP60r3UGIt2RNYsdE4ze57gyyDJleT0Z6YV9ntqfo00tNYbECBm
```

5. Click **Save**
6. Go to **Deploys** tab
7. Click **Trigger deploy** → **Clear cache and deploy site**

### Step 2: Update Render Backend Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service: `carcatlog-backend-1`
3. Go to **Environment** tab
4. Add/Update this variable:

```
FRONTEND_URL=https://idyllic-tapioca-67e6b7.netlify.app
```

5. Click **Save Changes** (this will trigger automatic redeploy)

### Step 3: Test the Connection

After both deployments complete (5-10 minutes):

1. Open your frontend: `https://idyllic-tapioca-67e6b7.netlify.app/`
2. Open browser DevTools (F12) → Console tab
3. Try to sign in or navigate the site
4. Check for API calls in the Network tab
5. Verify no CORS errors in console

---

## 🧪 Quick Test Commands

Test backend directly:
```bash
# Health check
curl https://carcatlog-backend-1.onrender.com/health

# API test
curl https://carcatlog-backend-1.onrender.com/api/vehicles/count
```

---

## 🔍 Troubleshooting

### Issue: Still getting CORS errors

**Check backend logs in Render:**
1. Go to Render dashboard
2. Click on your service
3. Check **Logs** tab
4. Look for CORS-related errors

**Verify FRONTEND_URL is set correctly:**
- Must be exactly: `https://idyllic-tapioca-67e6b7.netlify.app`
- No trailing slash
- Must include `https://`

### Issue: API calls return 404

**Check the API URL format:**
- Frontend should call: `https://carcatlog-backend-1.onrender.com/api/...`
- Note the `/api` at the end

**Verify in browser console:**
```javascript
// Open browser console on your Netlify site
console.log(import.meta.env.VITE_API_URL)
// Should show: https://carcatlog-backend-1.onrender.com/api
```

### Issue: Environment variables not updating

**Clear Netlify cache:**
1. Go to Netlify dashboard
2. **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

**For Render:**
- Environment changes trigger automatic redeploy
- Wait 5-10 minutes for deployment to complete

---

## 📝 Alternative: Use Custom Domains (Optional)

If you want cleaner URLs:

### Backend Custom Domain (Render)
1. In Render: **Settings** → **Custom Domain**
2. Add: `api.yourdomain.com`
3. Update DNS records as instructed
4. Update Netlify env: `VITE_API_URL=https://api.yourdomain.com/api`

### Frontend Custom Domain (Netlify)
1. In Netlify: **Domain settings** → **Add custom domain**
2. Add: `yourdomain.com`
3. Update DNS records as instructed
4. Update Render env: `FRONTEND_URL=https://yourdomain.com`

---

## ✅ Verification Checklist

After making changes:

- [ ] Netlify environment variables set
- [ ] Netlify site redeployed
- [ ] Render environment variables set
- [ ] Render service redeployed
- [ ] Frontend loads without errors
- [ ] API calls work (check Network tab)
- [ ] No CORS errors in console
- [ ] Can sign in/register
- [ ] Can view vehicle listings

---

## 🚀 Quick Commands Reference

### Check Netlify Build Logs
```bash
# If you have Netlify CLI installed
netlify open --site
```

### Check Render Logs
```bash
# View in dashboard or use Render CLI
render logs -s carcatlog-backend-1
```

### Test API from Command Line
```bash
# Test backend health
curl https://carcatlog-backend-1.onrender.com/health

# Test with CORS headers
curl -H "Origin: https://idyllic-tapioca-67e6b7.netlify.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://carcatlog-backend-1.onrender.com/api/vehicles/count
```

---

## 📞 Still Having Issues?

1. Check browser console for specific error messages
2. Check Render logs for backend errors
3. Verify both services are running (not sleeping)
4. Try accessing backend directly in browser
5. Clear browser cache and cookies

---

## 🎯 Expected Result

After following these steps:
- ✅ Frontend can make API calls to backend
- ✅ No CORS errors
- ✅ Authentication works
- ✅ Data loads from database
- ✅ All features functional
