# Trade Dealer Email Verification Flow

## ✅ How It Works Now

### For NEW Users (Not Verified)

1. **Registration:**
   - User fills registration form
   - Backend creates dealer with `status: 'pending'` and `emailVerified: false`
   - Verification email sent with token
   - User sees: "Registration successful! Please check your email to verify your account."

2. **Email Verification:**
   - User clicks link in email
   - Backend updates: `status: 'active'` and `emailVerified: true`
   - User is redirected to login

3. **Login Attempt (Before Verification):**
   - If user tries to login without verifying email
   - Backend returns: `code: 'EMAIL_NOT_VERIFIED'`
   - Frontend shows: "Please verify your email before logging in. Check your inbox for the verification link."

4. **Login Attempt (After Verification):**
   - User can login successfully
   - No verification message shown

### For EXISTING Users (Already Verified)

1. **Login:**
   - User enters email and password
   - Backend checks: `emailVerified === true` ✅
   - Backend checks: `status === 'active'` ✅
   - Login successful
   - **No verification message shown** ✅

2. **After Logout/Login:**
   - Same flow as above
   - No verification required
   - Subscription persists

## 🔍 Backend Checks (in order)

```javascript
// 1. Check if dealer exists
const dealer = await TradeDealer.findOne({ email });
if (!dealer) return error('Invalid email or password');

// 2. Check password
const isPasswordValid = await dealer.comparePassword(password);
if (!isPasswordValid) return error('Invalid email or password');

// 3. Check email verification (ONLY FOR UNVERIFIED USERS)
if (!dealer.emailVerified) {
  return error('Please verify your email before logging in', 'EMAIL_NOT_VERIFIED');
}

// 4. Check account status
if (dealer.status !== 'active') {
  return error(`Your account is ${dealer.status}. Please contact support.`);
}

// 5. Login successful
return { success: true, token, dealer, subscription };
```

## 📊 User States

| State | emailVerified | status | Can Login? | Message |
|-------|--------------|--------|------------|---------|
| Just Registered | false | pending | ❌ | "Please verify your email" |
| Email Verified | true | active | ✅ | None - Login successful |
| Suspended | true | suspended | ❌ | "Account is suspended" |
| Existing User | true | active | ✅ | None - Login successful |

## 🎯 Key Points

1. **Verification is ONE-TIME only**
   - Once email is verified, user never sees verification message again
   - `emailVerified` flag persists in database

2. **Existing users are NOT affected**
   - Users who already verified their email can login normally
   - No verification prompt shown

3. **New users MUST verify**
   - Cannot login until email is verified
   - Clear error message with instructions

4. **Subscription is separate**
   - Email verification ≠ Subscription
   - After email verification, user can login
   - Then they choose and pay for subscription plan

## 🔧 Implementation Details

### Backend (tradeDealerController.js)

```javascript
// Login check
if (!dealer.emailVerified) {
  return res.status(403).json({
    success: false,
    message: 'Please verify your email before logging in',
    code: 'EMAIL_NOT_VERIFIED'  // ← Frontend uses this
  });
}
```

### Frontend (TradeLoginPage.jsx)

```javascript
// Handle login error
if (result.code === 'EMAIL_NOT_VERIFIED') {
  setError('Please verify your email before logging in. Check your inbox for the verification link.');
} else {
  setError(result.message || 'Invalid email or password');
}
```

### Frontend Service (tradeDealerService.js)

```javascript
// Return error code from backend
catch (error) {
  if (error.response?.data) {
    return {
      success: false,
      message: error.response.data.message,
      code: error.response.data.code  // ← Pass code to frontend
    };
  }
}
```

## ✅ Testing Checklist

- [ ] New user registers → Sees "verify email" message
- [ ] New user tries to login without verifying → Gets error
- [ ] New user clicks verification link → Email verified
- [ ] New user logs in after verification → Success, no verification message
- [ ] Existing verified user logs in → Success, no verification message
- [ ] Existing user logs out and back in → Success, no verification message
- [ ] Suspended user tries to login → Gets "account suspended" error

## 🆘 Troubleshooting

### Issue: Existing user sees "verify email" message

**Diagnosis:**
```bash
node scripts/verifyProductionDealer.js user@email.com
```

Check output for:
- `Email Verified: true` ← Should be true
- `Status: active` ← Should be active

**Fix:**
```bash
# If emailVerified is false, update it
node scripts/quickFixDealerSubscription.js user@email.com
```

Or manually in MongoDB:
```javascript
db.tradedealers.updateOne(
  { email: "user@email.com" },
  { $set: { emailVerified: true, status: "active" } }
);
```

### Issue: New user doesn't receive verification email

**Check:**
1. Email service is configured (SendGrid API key)
2. Sender email is verified in SendGrid
3. Check spam folder
4. Check backend logs for email sending errors

**Resend verification email:**
```javascript
// Add this endpoint to backend if needed
POST /api/trade/auth/resend-verification
{ "email": "user@email.com" }
```

## 📧 Verification Email Template

The verification email includes:
- Welcome message
- Verification button/link
- Link expires in 24 hours
- Instructions if button doesn't work
- Company logo and branding

## 🔐 Security

- Verification tokens are hashed before storing
- Tokens expire after 24 hours
- One-time use only
- Cannot reuse expired tokens
- Password is hashed with bcrypt

## 🎉 Success Criteria

✅ New users must verify email before login
✅ Existing users never see verification message
✅ Clear error messages for each state
✅ Verification is one-time only
✅ Email verification persists across sessions
