# reCAPTCHA Integration Guide

## Step 1: Get reCAPTCHA Keys
1. Go to https://www.google.com/recaptcha/admin/create
2. Choose reCAPTCHA v2 ("I'm not a robot" checkbox)
3. Add your domains:
   - localhost
   - carcatalog.vercel.app
4. Get your Site Key and Secret Key

## Step 2: Add to Environment Variables

### Backend (.env)
```
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

### Frontend (.env)
```
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
```

## Step 3: Install Packages

### Frontend
```bash
cd frontend
npm install react-google-recaptcha
```

### Backend
```bash
cd backend
npm install axios
```

## Step 4: Files Created
- `backend/middleware/recaptchaMiddleware.js` - Verification middleware
- `src/components/ReCaptcha/ReCaptcha.jsx` - React component
- Updated auth routes to use reCAPTCHA

## Step 5: Usage
reCAPTCHA is now enabled on:
- Sign Up page
- Sign In page  
- Forgot Password page
- Trade Dealer Registration

## Testing
- Use test keys for development (provided by Google)
- Site key: 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
- Secret key: 6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
