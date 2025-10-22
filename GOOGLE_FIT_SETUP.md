# Google Fit Integration Setup Guide

This guide walks you through setting up Google Fit OAuth integration and automatic daily sync with Vercel Cron Jobs.

## 📋 Prerequisites

- Google Cloud Console account
- Vercel account (for deployment and cron jobs)
- PostgreSQL database

## 🔧 Step 1: Google Cloud Console Setup

### 1.1 Create a New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID

### 1.2 Enable Google Fit API
1. Navigate to **APIs & Services** → **Library**
2. Search for "Fitness API"
3. Click **Enable**

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure OAuth consent screen if prompted:
   - User Type: **External**
   - App name: Your website name
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `fitness.activity.read` and `fitness.body.read`
4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: "Personal Website Google Fit"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (for local dev)
     - `https://yourdomain.com/api/auth/google/callback` (for production)
5. Copy your **Client ID** and **Client Secret**

## 🔐 Step 2: Environment Variables

### 2.1 Local Development (.env)
Create or update your `.env` file:

```bash
# Google Fit OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Cron Job Security (generate a long random string)
CRON_SECRET=cron_secret_abc123xyz789_make_this_very_long_and_random
```

### 2.2 Vercel Production
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Key | Value | Environments |
|-----|-------|--------------|
| `GOOGLE_CLIENT_ID` | Your Google Client ID | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret | Production, Preview, Development |
| `GOOGLE_REDIRECT_URI` | `https://yourdomain.com/api/auth/google/callback` | Production |
| `GOOGLE_REFRESH_TOKEN` | (Add after Step 4) | Production, Preview, Development |
| `CRON_SECRET` | Same secret as local | Production, Preview, Development |

**Note:** `GOOGLE_REFRESH_TOKEN` will be added after you connect Google Fit for the first time (see Step 4.3).

## 🚀 Step 3: Deploy to Vercel

### 3.1 Push to GitHub
```bash
git add .
git commit -m "Add Google Fit integration with cron jobs"
git push origin main
```

### 3.2 Vercel Deployment
Vercel will automatically:
- Detect `vercel.json`
- Set up the cron job
- Schedule it to run at 11 PM UTC daily

### 3.3 Verify Cron Job Setup
1. Go to Vercel Dashboard → Your Project → **Settings** → **Cron Jobs**
2. You should see: `/api/cron/sync-health` scheduled for `45 22 * * *`

## 🔗 Step 4: Connect Google Fit

### 4.1 Admin Panel
1. Log in to your admin panel: `/admin/login`
2. Navigate to **Health Data** page: `/admin/health`
3. Click **"Connect Google Fit"** button
4. Authorize the app in Google OAuth consent screen
5. You'll be redirected back to your site

### 4.2 Manual Sync
After connecting, you can manually sync data:
1. Go to `/admin/health`
2. Click **"Sync Now"** button
3. Today's steps and calories will be fetched and saved

### 4.3 Extract Refresh Token for Cron Jobs

**Important:** Cron jobs run in a serverless environment without user cookies. You need to add the refresh token to Vercel environment variables.

**Method 1: From Browser DevTools (Easiest)**
1. After connecting Google Fit, open browser DevTools (F12)
2. Go to **Application** tab → **Cookies**
3. Find `google_refresh_token` cookie
4. Copy its value
5. Add to Vercel: **Settings** → **Environment Variables**
   - Key: `GOOGLE_REFRESH_TOKEN`
   - Value: (paste the copied token)
   - Environments: Production, Preview, Development
6. Redeploy your app for changes to take effect

**Method 2: From Server Logs**
1. Check your server logs after OAuth callback
2. The refresh token is logged during the first connection
3. Copy it from logs and add to Vercel environment variables

**Method 3: Temporary Logging (Development)**
Add this to `app/api/auth/google/callback/route.ts` temporarily:
```typescript
if (tokens.refresh_token) {
  console.log('🔑 Refresh Token:', tokens.refresh_token);
  // ... rest of code
}
```
Connect Google Fit, check logs, copy token, then remove the console.log.

## ⏰ Step 5: Cron Job Schedule

The cron job runs automatically at **22:45 UTC** every day (11:45 PM Irish Summer Time / 10:45 PM Irish Winter Time).

### Change Schedule
Edit `vercel.json` to change the time:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-health",
      "schedule": "45 22 * * *"
    }
  ]
}
```

**Common schedules:**
- `"0 0 * * *"` - Midnight UTC (12:00 AM)
- `"0 6 * * *"` - 6 AM UTC
- `"0 12 * * *"` - Noon UTC
- `"0 18 * * *"` - 6 PM UTC
- `"45 22 * * *"` - 10:45 PM UTC (current)
- `"0 23 * * *"` - 11 PM UTC

After changing, commit and push to GitHub for Vercel to update.

## 📊 Step 6: Monitor Cron Jobs

### View Logs
1. Vercel Dashboard → Your Project → **Logs**
2. Filter by `/api/cron/sync-health`
3. Look for:
   - ✅ `Updated existing health data`
   - ✅ `Created new health data`
   - ❌ Error messages if sync fails

### Test Cron Job Manually
You can trigger the cron job manually using curl:

```bash
curl -X GET https://yourdomain.com/api/cron/sync-health \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Replace:
- `yourdomain.com` with your actual domain
- `YOUR_CRON_SECRET` with your actual CRON_SECRET value

## 🔒 Security Notes

1. **CRON_SECRET**: Keep this secret! It prevents unauthorized cron job triggers
2. **OAuth Tokens**: Stored in httpOnly cookies (not accessible via JavaScript)
3. **Refresh Token**: Used to get new access tokens when they expire
4. **Admin Only**: Google Fit controls are only in `/admin/health`, not public

## 🐛 Troubleshooting

### Cron Job Not Running
- Check Vercel logs for errors
- Verify `CRON_SECRET` is set in Vercel environment variables
- Ensure `vercel.json` is in the root directory

### OAuth Errors
- Verify redirect URI matches exactly in Google Cloud Console
- Check that Fitness API is enabled
- Ensure OAuth consent screen is configured

### No Data Syncing
- Check if Google Fit is connected (green checkmark in admin)
- Verify you have activity data in Google Fit app
- Check Vercel logs for API errors

### Token Expired
- Refresh tokens should automatically renew
- If issues persist, disconnect and reconnect Google Fit

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/google` | GET | Initiates OAuth flow |
| `/api/auth/google/callback` | GET | OAuth callback handler |
| `/api/health/sync` | GET | Manual sync (admin) |
| `/api/cron/sync-health` | GET | Automated daily sync (cron) |

## 🎉 Success!

Once set up, your health data will automatically sync every day at 11 PM UTC. You can view it on:
- **Public**: Home page health chart
- **Admin**: `/admin/health` with full management controls

---

**Need help?** Check Vercel logs or Google Cloud Console for detailed error messages.
