# Vercel Deployment Guide

## Quick Start

Vercel is the easiest way to deploy your Carbon Footprint Analyzer app.

### Option 1: Deploy via CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel (opens browser)
vercel login

# Navigate to project directory
cd h:\Carbon-Footprint-Analiyzer\ECOCO2

# Deploy
vercel
```

Follow the prompts and select:
- **Project name**: carbon-footprint-analyzer
- **Framework**: Vite
- **Build command**: npm run build
- **Output directory**: dist

### Option 2: Deploy via GitHub (Recommended for Auto-Deploy)

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard

2. **Click "New Project"**

3. **Import from Git:**
   - Select GitHub
   - Search for: `CarboCO2` repository
   - Click Import

4. **Configure Settings:**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Root Directory**: `ECOCO2`

5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add these variables for all environments (Production, Preview, Development):
     ```
     VITE_GEMINI_API_KEY = your_gemini_api_key
     PAGESPEED_API_KEY = your_pagespeed_api_key
     MONGODB_URI = your_connection_string
     JWT_SECRET = your_secret_key
     NODE_ENV = production
     ```
   - Make sure each variable is set before deploying

6. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your app will be live at: `https://your-project.vercel.app`

---

## After Deployment

### Custom Domain

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain
5. Follow DNS configuration instructions

### Environment Variables

Update in Vercel Dashboard:
- Settings → Environment Variables
- Add/Edit as needed
- Redeploy to apply changes

### Auto-Deploy

Every push to GitHub main branch automatically deploys:
```bash
git add .
git commit -m "Update: your changes"
git push origin main
# Vercel automatically deploys!
```

### View Logs

```bash
# View deployment logs
vercel logs your-project-name

# Real-time logs
vercel logs your-project-name --follow
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini AI API key |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens (min 32 chars) |
| `NODE_ENV` | Yes | Set to `production` |

---

## Troubleshooting

### Build Fails

1. Check build logs in Vercel Dashboard
2. Verify all environment variables are set
3. Run locally: `npm run build`
4. Check for TypeScript errors: `npm run lint`

### API Routes Not Working

1. Ensure serverless functions are configured
2. Check `vercel.json` configuration
3. Verify API endpoints in code match routes

### Domain Authorization Error (Firebase)

1. Add your Vercel domain to Firebase Authorized Domains:
   - Firebase Console → Authentication → Settings → Authorized Domains
   - Add: `your-project.vercel.app`
   - Wait 10 minutes for propagation

### Environment Variables Not Applied

1. Verify variables are set in Vercel Dashboard
2. Redeploy: Dashboard → Deployments → Redeploy
3. Or use CLI: `vercel env pull` to verify

---

## Alternative Deployment Options

- **Google Cloud Run**: See DEPLOYMENT_GUIDE.md
- **Heroku**: See DEPLOYMENT_GUIDE.md
- **AWS**: See DEPLOYMENT_GUIDE.md

---

## Commands

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Pull environment variables
vercel env pull

# View project info
vercel project inspect

# Delete project
vercel remove

# Get deployment URL
vercel list
```

---

**Vercel Documentation**: https://vercel.com/docs
