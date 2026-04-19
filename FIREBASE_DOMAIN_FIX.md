# Firebase Unauthorized Domain Fix

## Issue
Firebase auth/unauthorized-domain error when running app on localhost or your domain.

## Solution

### For Development (localhost)

Add these localhost domains to your Firebase Console:

1. **Go to Firebase Console:** https://console.firebase.google.com/
2. **Select your project:** gen-lang-client-0764386419
3. **Navigate to:** Authentication > Settings > Authorized domains
4. **Add these domains:**
   - `localhost`
   - `127.0.0.1`
   - `localhost:3000`
   - `127.0.0.1:3000`

### For Production

Add your live domain:
- `yourdomain.com`
- `www.yourdomain.com`
- `app.yourdomain.com` (if using subdomain)

### Quick Setup Instructions

**Step 1: Open Firebase Console**
- Go to https://console.firebase.google.com/
- Click your project "gen-lang-client-0764386419"

**Step 2: Go to Authentication Settings**
- Left sidebar: Authentication
- Tab: Settings
- Scroll to "Authorized domains"

**Step 3: Add Localhost Domains**
- Click "Add domain"
- Enter: `localhost`
- Click "Add domain" again
- Enter: `127.0.0.1`
- (Optional) Add `localhost:3000` and `127.0.0.1:3000`

**Step 4: Save and Wait**
- Firebase updates can take up to 10 minutes
- Clear browser cache and cookies for localhost
- Restart your dev server

### Alternative: Use Environment Variables

If you want environment-based Firebase configs:

Create `.env.development` with localhost-specific config and `.env.production` with production config.

### Troubleshooting

If still getting error after adding domains:
1. **Clear browser cache:** Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. **Clear site data:** DevTools > Application > Storage > Clear Site Data
3. **Restart dev server:** Stop and run `npm run dev` again
4. **Check browser console:** Look for exact error message
5. **Wait 10 minutes:** Firebase domain propagation can take time

### Project Details
- **Project ID:** gen-lang-client-0764386419
- **Auth Domain:** gen-lang-client-0764386419.firebaseapp.com
- **Dev Server:** http://localhost:3000
