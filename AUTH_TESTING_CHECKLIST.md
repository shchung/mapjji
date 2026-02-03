# 🧪 Authentication Testing Checklist

## Current Status

### ✅ Implemented
- Email Magic Link authentication
- Google OAuth integration
- Kakao OAuth integration
- Auth UI components (AuthModal, AuthProvider)
- Spice level registration form

### ⚠️ Needs Verification
- [ ] Local environment API key (currently broken)
- [ ] Production environment auth
- [ ] OAuth provider configuration in Supabase
- [ ] Email delivery
- [ ] Complete registration flow

---

## Test Plan

### 1. Fix Local Environment First

**Status**: ⚠️ BLOCKED - Requires user action

**Action Required**:
1. Copy Supabase anon key from dashboard (browser already opened)
2. Update `.env.local` file
3. Restart dev server

See: `FIX_AUTH_KEY.md`

---

### 2. Test Production Environment

**URL**: https://maepjji-alert.vercel.app

#### Test 2.1: Email Magic Link (Production)

**Steps**:
1. Open https://maepjji-alert.vercel.app
2. Click any restaurant marker (🌶️)
3. Click "맵기 레벨 등록하기"
4. Enter email address
5. Click "이메일로 로그인"

**Expected Result**:
- ✅ "메일을 확인하세요!" message appears
- ✅ Email received from Supabase
- ✅ Click link in email
- ✅ Redirected back to site, logged in
- ✅ Spice level form appears

**Actual Result**: _To be tested_

---

#### Test 2.2: Google OAuth (Production)

**Steps**:
1. Open https://maepjji-alert.vercel.app
2. Click restaurant → "맵기 레벨 등록하기"
3. Click "Google로 계속하기"

**Expected Result**:
- ✅ Redirected to Google login
- ✅ After login, redirected back to site
- ✅ Logged in successfully
- ✅ Spice level form appears

**Possible Issues**:
- ❌ OAuth not configured in Supabase
- ❌ Redirect URL not whitelisted
- ❌ Google Cloud Console app not set up

**Actual Result**: _To be tested_

---

#### Test 2.3: Kakao OAuth (Production)

**Steps**:
1. Open https://maepjji-alert.vercel.app
2. Click restaurant → "맵기 레벨 등록하기"
3. Click "카카오로 계속하기"

**Expected Result**:
- ✅ Redirected to Kakao login
- ✅ After login, redirected back to site
- ✅ Logged in successfully
- ✅ Spice level form appears

**Possible Issues**:
- ❌ OAuth not configured in Supabase
- ❌ Redirect URL not whitelisted
- ❌ Kakao Developers app not set up

**Actual Result**: _To be tested_

---

### 3. Test Spice Level Registration

**Prerequisites**: Successfully logged in

**Steps**:
1. Select restaurant
2. Click spice level (1-5 chilis)
3. Optionally add comment
4. Click "등록하기"

**Expected Result**:
- ✅ Toast notification: "맵기 레벨이 등록되었습니다!"
- ✅ Data saved to Supabase `reviews` table
- ✅ Restaurant `avg_spice_level` updated
- ✅ Form closes, back to restaurant details

**Actual Result**: _To be tested_

---

### 4. Verify Supabase Configuration

#### 4.1: Database Tables

**Check**: https://supabase.com/dashboard/project/hqouaiupjrlqlnnkifkg/editor

Tables should exist:
- [ ] `restaurants`
- [ ] `reviews`
- [ ] `user_profiles`
- [ ] `menus`

#### 4.2: Row Level Security (RLS)

**Check**: Table Editor → Policies

Expected policies:
- [ ] `restaurants`: Public read access
- [ ] `reviews`: Authenticated users can insert
- [ ] `reviews`: Users can read all reviews
- [ ] `user_profiles`: Users can read/update own profile

#### 4.3: Authentication Providers

**Check**: https://supabase.com/dashboard/project/hqouaiupjrlqlnnkifkg/auth/providers

Should be enabled:
- [ ] Email (Magic Link)
- [ ] Google OAuth
  - Client ID configured
  - Client Secret configured
- [ ] Kakao OAuth
  - Client ID configured
  - Client Secret configured

#### 4.4: Redirect URLs

**Check**: Auth Settings → URL Configuration

Should include:
- [ ] `https://maepjji-alert.vercel.app`
- [ ] `http://localhost:3000` (for development)

---

## OAuth Setup Requirements

### Google OAuth Setup

If not configured, follow these steps:

1. **Google Cloud Console**: https://console.cloud.google.com
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   ```
   https://hqouaiupjrlqlnnkifkg.supabase.co/auth/v1/callback
   ```
6. Copy Client ID and Secret
7. Add to Supabase Auth → Providers → Google

**Time required**: ~10 minutes

---

### Kakao OAuth Setup

If not configured, follow these steps:

1. **Kakao Developers**: https://developers.kakao.com
2. Create new app or select existing
3. Activate "Kakao Login"
4. Add redirect URI:
   ```
   https://hqouaiupjrlqlnnkifkg.supabase.co/auth/v1/callback
   ```
5. Copy REST API Key and JavaScript Key
6. Add to Supabase Auth → Providers → Kakao

**Time required**: ~10 minutes

---

## Testing Priority

1. **HIGH**: Test production email magic link (no setup required)
2. **MEDIUM**: Fix local environment key
3. **LOW**: Test OAuth (requires setup if not configured)

---

## Next Steps

1. ✅ Production site is live
2. ⏳ Test email magic link in production
3. ⏳ Check Supabase OAuth configuration
4. ⏳ Set up OAuth providers if needed
5. ⏳ Test complete registration flow

---

## Quick Test Commands

### Test Production Endpoint
```bash
curl -I https://maepjji-alert.vercel.app
```

### Test Supabase Health
```bash
curl https://hqouaiupjrlqlnnkifkg.supabase.co/rest/v1/
```

### Check Vercel Environment Variables
```bash
vercel env ls
```
