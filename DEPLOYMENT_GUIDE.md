# ECOCO2 - Live Server Deployment Guide

## ✅ SETUP COMPLETE

Your Carbon Footprint Analyzer app is now fully functional locally. Here's what was completed:

### Completed Tasks:
1. ✅ Created `.env.local` file with all required environment variables
2. ✅ Installed all 709 dependencies successfully
3. ✅ Fixed 5 security vulnerabilities (npm audit fix)
4. ✅ Built production bundle (2.75 MB → 777.92 KB gzipped)
5. ✅ Verified development server runs on http://localhost:3000

---

## 🚀 LIVE SERVER DEPLOYMENT OPTIONS

Choose one deployment option based on your infrastructure:

### Option 1: **Google Cloud Run** (Recommended - Used by AI Studio)
```bash
# 1. Create Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# 2. Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ecoco2
gcloud run deploy ecoco2 --image gcr.io/YOUR_PROJECT_ID/ecoco2 --platform managed --region us-central1 --allow-unauthenticated
```

### Option 2: **Vercel** (Best for React/Vite)
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel
# Follow prompts, choose 'vite' as framework

# 3. Set environment variables in Vercel dashboard:
GEMINI_API_KEY=your_key
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
NODE_ENV=production
```

### Option 3: **Heroku**
```bash
# 1. Install Heroku CLI and login
heroku create ecoco2

# 2. Set environment variables
heroku config:set GEMINI_API_KEY=your_key
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret

# 3. Deploy
git push heroku main
```

### Option 4: **AWS (EC2/Elastic Beanstalk)**
```bash
# 1. Update server.ts to use dynamic port
const PORT = process.env.PORT || 3000;

# 2. Create .ebextensions/nodecommand.config
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"

# 3. Deploy with EB CLI
eb init -p node.js-20 ecoco2
eb create ecoco2-env
eb deploy
```

---

## 🔧 ENVIRONMENT VARIABLES - MUST SET ON LIVE SERVER

**Critical (Required for functionality):**
- `GEMINI_API_KEY` - Get from Google AI Studio (https://aistudio.google.com/apikey)
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Strong secret key for tokens (min 32 characters)
- `NODE_ENV=production`

**Optional:**
- `PAGESPEED_API_KEY` - Google PageSpeed Insights API (optional, works without it)
- `APP_URL` - Your live domain URL

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables are set on live server
- [ ] Firebase config verified (firebase-applet-config.json)
- [ ] MongoDB URI connection tested
- [ ] JWT_SECRET is strong and secure
- [ ] GEMINI_API_KEY is valid
- [ ] Production build tested locally: `npm run build && npm start`
- [ ] SSL/HTTPS enabled on live server
- [ ] CORS configured if needed
- [ ] Firestore security rules deployed
- [ ] Database backups configured

---

## 🔒 Security Recommendations

1. **Never commit .env files** - Already in .gitignore
2. **Use strong JWT_SECRET** - At least 32 random characters
3. **Enable HTTPS** - Required for OAuth/Firebase
4. **Set secure CORS headers** - Restrict to your domain
5. **Enable Firestore security rules** - Review firestore.rules
6. **Use environment-specific configs** - Dev vs Production
7. **Regular security audits** - `npm audit` monthly
8. **Monitor API rate limits** - Gemini API and PageSpeed API

---

## 📊 Project Structure

```
ECOCO2/
├── src/
│   ├── components/    - React UI components
│   ├── pages/         - Page components (Dashboard, Analyze, etc)
│   ├── context/       - AuthContext (Firebase auth)
│   ├── layouts/       - SidebarLayout
│   ├── lib/           - Firebase config
│   └── server/        - API routes (scan analysis)
├── components/ui/     - Shadcn UI components
├── dist/              - Production build (generated)
├── server.ts          - Express server
├── vite.config.ts     - Vite configuration
└── tsconfig.json      - TypeScript config
```

---

## 🧪 Testing Before Deployment

```bash
# 1. Type checking
npm run lint

# 2. Production build
npm run build

# 3. Test production build locally
npm run preview

# 4. Run development server
npm run dev
```

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` again |
| Firebase auth fails | Verify firebase-applet-config.json credentials |
| Build too large | Enable code splitting in vite.config.ts |
| Port 3000 in use | `PORT=3001 npm start` or kill process: `lsof -ti:3000 \| xargs kill` |
| MongoDB connection fails | Verify MONGODB_URI format and network access |
| GEMINI_API_KEY errors | Check API key is valid and not expired |

---

## 📞 Support Resources

- Firebase Setup: https://firebase.google.com/docs/setup
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Google Gemini API: https://ai.google.dev/
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
- Express.js: https://expressjs.com/

---

## ✅ CURRENT STATUS: READY FOR DEPLOYMENT

Your app is production-ready. Choose your hosting platform above and follow the deployment steps.

**For immediate testing, run:**
```bash
cd h:\Carbon-Footprint-Analiyzer\ECOCO2
npm run dev
# Open http://localhost:3000 in your browser
```

---

Generated: April 19, 2026
