# Kakao Maps Platform Setup Guide

## 🚨 Current Issue

Your Kakao Maps is not loading because **localhost:3000 is not registered** in your Kakao Developers app settings.

**Error**: `Failed to load Kakao Maps SDK`

**Root Cause**: Kakao Maps API requires explicit domain registration for security.

---

## ✅ Step-by-Step Fix

### Step 1: Go to Kakao Developers Console

1. Open your browser and go to: **https://developers.kakao.com**
2. Click **"로그인"** (Login) button in the top right
3. Log in with your Kakao account

### Step 2: Access Your App

1. After login, click **"앱"** (App) in the top navigation
2. You should see your app **"맵찌주의보"** (or whatever you named it)
3. Click on your app to open the app settings

### Step 3: Navigate to Platform Settings

1. In the left sidebar, find **"앱 설정"** (App Settings)
2. Click on **"플랫폼"** (Platform)
3. You should see a section for **"Web 플랫폼"** (Web Platform)

### Step 4: Register localhost:3000

1. Click **"Web 플랫폼 등록"** (Register Web Platform) button
2. In the input field, enter: `http://localhost:3000`
3. Click **"저장"** (Save)

### Step 5: Verify Registration

You should now see `http://localhost:3000` listed under **"Web 플랫폼"**.

### Step 6: Test Your App

1. Go back to your browser
2. Open: http://localhost:3000
3. Refresh the page (Cmd+R or Ctrl+R)
4. **The map should now load successfully!**

---

## 🎯 Expected Console Output (Success)

When the map loads correctly, you should see these logs in the browser console (F12):

```
[KakaoMap] API Key configured: true
[KakaoMap] API Key (first 10 chars): e505a41...
[KakaoMap] Script loaded, checking window.kakao...
[KakaoMap] window.kakao exists: true
[KakaoMap] window.kakao.maps exists: true
[KakaoMap] window.kakao.maps.load exists: true
[KakaoMap] Calling kakao.maps.load()...
[KakaoMap] Maps loaded successfully!
[KakaoMap] Initializing map...
[KakaoMap] Center: {lat: 37.5665, lng: 126.978}
[KakaoMap] Level: 3
[KakaoMap] Map initialized successfully!
```

---

## 🌍 For Production Deployment

When you deploy to production (Cloudflare Pages), you'll need to register your production domain too:

### Example Production Domains to Register:

- Cloudflare Pages: `https://maepjji-alert.pages.dev`
- Custom domain: `https://maepjji.com`
- Custom domain: `https://www.maepjji.com`

**Important**: Register BOTH `https://` and `http://` versions if needed, and with/without `www.`

---

## 🔐 API Key Security

Your current setup is **secure**:

✅ **JavaScript Key** (not REST API key) - correct for browser use  
✅ **Domain-restricted** - only works on registered domains  
✅ **Stored in .env.local** - not committed to git  
✅ **NEXT_PUBLIC_ prefix** - required for browser-side access  

**Kakao JavaScript keys are safe to expose in browser code** because they're domain-restricted. Even if someone sees your key in the browser, they can't use it on their own domain.

---

## 🆘 Troubleshooting

### Issue: Still getting "Failed to load Kakao Maps SDK"

**Solutions:**
1. **Clear browser cache**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Check domain spelling**: Make sure you entered `http://localhost:3000` exactly (no trailing slash)
3. **Wait 1-2 minutes**: Sometimes Kakao takes a moment to propagate the changes
4. **Check API key**: Make sure your `.env.local` has the correct key

### Issue: CORS errors in console

**Solution:**
- This is normal if the domain isn't registered
- Once you add `localhost:3000`, CORS errors will disappear

### Issue: "Invalid API key" error

**Solutions:**
1. Check that you're using the **JavaScript key** (not REST API key)
2. Go to Kakao Developers → Your App → "앱 키" (App Keys)
3. Copy the **"JavaScript 키"** value
4. Update `.env.local` with the correct key
5. Restart your dev server: `npm run dev`

---

## 📞 Need Help?

If you're still having issues after following these steps:

1. **Check the browser console** (F12) for specific error messages
2. **Take a screenshot** of the Kakao Developers platform settings page
3. **Share the console logs** so we can diagnose the issue

---

## ✅ Checklist

- [ ] Logged into Kakao Developers (https://developers.kakao.com)
- [ ] Opened your app settings
- [ ] Navigated to "플랫폼" (Platform) section
- [ ] Registered `http://localhost:3000` as Web platform
- [ ] Saved the changes
- [ ] Refreshed your browser at http://localhost:3000
- [ ] Map is now loading successfully
- [ ] Console shows success logs (no errors)

---

**Once you complete these steps, the map will load and you can continue building the app!** 🚀
