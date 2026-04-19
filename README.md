
# Carbon Footprint Analyzer - ECOCO2

A React + TypeScript web application that analyzes website carbon footprints using Google PageSpeed Insights API and Firebase.

## Features

- 🌍 Analyze website carbon emissions
- 📊 Compare multiple websites
- 📈 View detailed performance metrics
- 💾 Save scan history with Firebase
- 🎯 Get optimization recommendations
- 🌙 Dark mode support
- 📱 Responsive mobile design

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Express.js + TypeScript
- **Database:** Firebase Firestore
- **Authentication:** Firebase Google OAuth
- **Styling:** TailwindCSS + Shadcn UI
- **Charts:** Recharts
- **AI:** Google Gemini API

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   MONGODB_URI=your_mongodb_connection
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm start` - Run production server
- `npm run lint` - Check TypeScript types

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## Firebase Setup

See [FIREBASE_DOMAIN_FIX.md](FIREBASE_DOMAIN_FIX.md) for adding authorized domains.

## Project Structure

```
src/
├── components/     # React components
├── pages/          # Page components
├── context/        # React context (Auth)
├── lib/            # Firebase setup
├── layouts/        # Layout components
└── server/         # Backend routes
```

## Support

For issues and questions, please check the documentation files included in the project.
