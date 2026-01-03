# ✅ Deployment Connection Checklist

Print this and check off each step as you complete it.

---

## 📋 Pre-Check

- [ ] Backend is deployed and accessible: https://carcatlog-backend-1.onrender.com/
- [ ] Frontend is deployed and accessible: https://idyllic-tapioca-67e6b7.netlify.app/
- [ ] You have access to Netlify dashboard
- [ ] You have access to Render dashboard

---

## 🎯 Netlify Configuration (Frontend)

### Access Netlify
- [ ] Go to https://app.netlify.com/
- [ ] Find site: `idyllic-tapioca-67e6b7`
- [ ] Click on the site

### Set Environment Variables
- [ ] Click **Site settings** (left sidebar)
- [ ] Click **Environment variables** (under Build & deploy)
- [ ] Click **Add a variable** button

### Add VITE_API_URL
- [ ] Key: `VITE_API_URL`
- [ ] Value: `https://carcatlog-backend-1.onrender.com/api`
- [ ] Click **Create variable**

### Add VITE_STRIPE_PUBLISHABLE_KEY
- [ ] Key: `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Value: `pk_test_51SZufOD5YDWEPfCdXwTt3y7XYmK3bDnvPkGzxK49qXOuJebLP60r3UGIt2RNYsdE4ze57gyyDJleT0Z6YV9ntqfo00tNYbECBm`
- [ ] Click **Create variable**

### Redeploy
- [ ] Click **Deploys** (top navigation)
- [ ] Click **Trigger deploy** button
- [ ] Select **Clear cache and deploy site**
- [ ] Wait for deployment to complete (3-5 minutes)
- [ ] Check deployment status shows "Published"

---

## 🔧 Render Configuration (Backend)

### Access Render
- [ ] Go to https://dashboard.render.com/
- [ ] Find service: `carcatlog-backend-1`
- [ ] Click on the service

### Set Environment Variable
- [ ] Click **Environment** (left sidebar)
- [ ] Find or add `FRONTEND_URL`

### Update FRONTEND_URL
- [ ] Key: `FRONTEND_URL`
- [ ] Value: `https://idyllic-tapioca-67e6b7.netlify.app`
- [ ] Click **Save Changes**
- [ ] Wait for automatic redeploy (5-10 minutes)
- [ ] Check **Events** tab to see deployment progress

---

## 🧪 Testing

### Test Backend Directly
- [ ] Open: https://carcatlog-backend-1.onrender.com/health
- [ ] Should see JSON response with status "OK"
- [ ] Open: https://carcatlog-backend-1.onrender.com/api/vehicles/count
- [ ] Should see vehicle count response

### Test Frontend
- [ ] Open: https://idyllic-tapioca-67e6b7.netlify.app/
- [ ] Page loads without errors
- [ ] Press F12 to open DevTools
- [ ] Go to **Console** tab
- [ ] No red errors visible

### Test API Connection
- [ ] In Console tab, type: `console.log(import.meta.env.VITE_API_URL)`
- [ ] Should show: `https://carcatlog-backend-1.onrender.com/api`
- [ ] Go to **Network** tab
- [ ] Refresh the page
- [ ] See API calls to `carcatlog-backend-1.onrender.com`
- [ ] API calls return 200 status codes

### Test Features
- [ ] Click on "Sign In" or "Register"
- [ ] No CORS errors in console
- [ ] Can view vehicle listings
- [ ] Can search for vehicles
- [ ] Images load correctly
- [ ] Navigation works

---

## 🐛 Troubleshooting

### If Frontend Shows Errors

**Check Console:**
- [ ] Open DevTools (F12) → Console tab
- [ ] Look for specific error messages
- [ ] Screenshot any errors

**Common Issues:**
- [ ] "Network Error" → Check VITE_API_URL in Netlify
- [ ] "CORS Error" → Check FRONTEND_URL in Render
- [ ] "404 Not Found" → Check API URL ends with `/api`

### If Backend Not Responding

**Check Render:**
- [ ] Go to Render dashboard
- [ ] Click on your service
- [ ] Check **Logs** tab for errors
- [ ] Verify service status is "Live"
- [ ] Check **Events** tab for deployment issues

### If Changes Not Taking Effect

**Clear Everything:**
- [ ] Netlify: Trigger deploy → Clear cache and deploy
- [ ] Render: Should auto-redeploy on env change
- [ ] Browser: Clear cache and hard refresh (Ctrl+Shift+R)
- [ ] Browser: Clear local storage (DevTools → Application → Local Storage)

---

## ✅ Success Indicators

When everything is working:

### In Browser Console:
- [ ] No red errors
- [ ] `import.meta.env.VITE_API_URL` shows correct backend URL

### In Network Tab:
- [ ] API calls go to `carcatlog-backend-1.onrender.com`
- [ ] Status codes are 200 (success)
- [ ] Responses contain data

### In Application:
- [ ] Homepage loads
- [ ] Can sign in/register
- [ ] Vehicle listings display
- [ ] Search works
- [ ] All pages accessible

---

## 📊 Deployment Status

### Netlify Status:
- [ ] Build: ✅ Success
- [ ] Deploy: ✅ Published
- [ ] Environment Variables: ✅ Set

### Render Status:
- [ ] Service: ✅ Live
- [ ] Deploy: ✅ Complete
- [ ] Environment Variables: ✅ Set

### Connection Status:
- [ ] Frontend → Backend: ✅ Connected
- [ ] CORS: ✅ Configured
- [ ] API Calls: ✅ Working

---

## 🎉 Final Verification

- [ ] All checklist items above are complete
- [ ] No errors in browser console
- [ ] Can perform basic operations (sign in, browse)
- [ ] API calls visible in Network tab
- [ ] Both services show "Live" status

---

## 📝 Notes

Write any issues or observations here:

```
Issue 1: _______________________________________________

Solution: _______________________________________________


Issue 2: _______________________________________________

Solution: _______________________________________________
```

---

## 🚀 Next Steps After Success

- [ ] Test all features thoroughly
- [ ] Set up monitoring
- [ ] Configure custom domains (optional)
- [ ] Switch to production Stripe keys
- [ ] Set up automated backups
- [ ] Document any custom configurations

---

**Date Completed**: _______________

**Time Taken**: _______________

**Completed By**: _______________

---

## 📞 Quick Reference

- **Frontend URL**: https://idyllic-tapioca-67e6b7.netlify.app/
- **Backend URL**: https://carcatlog-backend-1.onrender.com/
- **Backend API**: https://carcatlog-backend-1.onrender.com/api
- **Netlify Dashboard**: https://app.netlify.com/
- **Render Dashboard**: https://dashboard.render.com/

---

**Need help?** See `QUICK_FIX.md` or `CONNECTION_ISSUE_SUMMARY.md`
