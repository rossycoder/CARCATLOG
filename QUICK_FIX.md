# ⚡ Quick Fix - Connect Frontend to Backend

## Your Deployed URLs
- **Backend**: `https://carcatlog-backend-1.onrender.com/`
- **Frontend**: `https://idyllic-tapioca-67e6b7.netlify.app/`

---

## 🎯 2-Minute Fix

### Step 1: Fix Netlify (Frontend)

1. Go to: https://app.netlify.com/sites/idyllic-tapioca-67e6b7/settings/deploys#environment
2. Click **"Add a variable"** or **"Environment variables"**
3. Add:
   ```
   Key: VITE_API_URL
   Value: https://carcatlog-backend-1.onrender.com/api
   ```
4. Add:
   ```
   Key: VITE_STRIPE_PUBLISHABLE_KEY
   Value: pk_test_51SZufOD5YDWEPfCdXwTt3y7XYmK3bDnvPkGzxK49qXOuJebLP60r3UGIt2RNYsdE4ze57gyyDJleT0Z6YV9ntqfo00tNYbECBm
   ```
5. Click **"Save"**
6. Go to **Deploys** tab → **"Trigger deploy"** → **"Clear cache and deploy site"**

### Step 2: Fix Render (Backend)

1. Go to: https://dashboard.render.com/web/srv-YOUR-SERVICE-ID
2. Click **"Environment"** in left sidebar
3. Find or add:
   ```
   Key: FRONTEND_URL
   Value: https://idyllic-tapioca-67e6b7.netlify.app
   ```
4. Click **"Save Changes"** (auto-redeploys)

### Step 3: Wait & Test

1. Wait 5-10 minutes for both to redeploy
2. Open: https://idyllic-tapioca-67e6b7.netlify.app/
3. Open browser DevTools (F12) → Console
4. Check for errors
5. Try signing in or browsing

---

## ✅ How to Verify It's Working

### In Browser Console:
```javascript
// Should show your backend URL
console.log(import.meta.env.VITE_API_URL)
// Expected: https://carcatlog-backend-1.onrender.com/api
```

### In Network Tab:
- API calls should go to `https://carcatlog-backend-1.onrender.com/api/...`
- Should return 200 status codes
- No CORS errors

---

## 🐛 Still Not Working?

### Check Netlify Build Log:
1. Go to Netlify → Deploys → Click latest deploy
2. Look for environment variables in build log
3. Should see: `VITE_API_URL=https://carcatlog-backend-1.onrender.com/api`

### Check Render Logs:
1. Go to Render → Your service → Logs
2. Look for CORS errors
3. Should see: `FRONTEND_URL` in environment

### Test Backend Directly:
```bash
# Should return JSON
curl https://carcatlog-backend-1.onrender.com/health

# Should return vehicle count
curl https://carcatlog-backend-1.onrender.com/api/vehicles/count
```

---

## 📞 Common Issues

### Issue: "Network Error" in browser
**Fix**: Check VITE_API_URL in Netlify environment variables

### Issue: CORS error in console
**Fix**: Check FRONTEND_URL in Render environment variables

### Issue: 404 errors
**Fix**: Make sure API URL ends with `/api`

### Issue: Changes not taking effect
**Fix**: Clear cache and redeploy both services

---

## 🎉 Success Indicators

When it's working, you should see:
- ✅ No errors in browser console
- ✅ API calls in Network tab show 200 status
- ✅ Can sign in/register
- ✅ Vehicle listings load
- ✅ All features work

---

## 📚 More Help

- Detailed guide: `FRONTEND_BACKEND_CONNECTION_FIX.md`
- Test script: Run `./test-connection.sh` (Mac/Linux) or `test-connection.bat` (Windows)
- Full deployment guide: `FULL_STACK_DEPLOYMENT.md`
