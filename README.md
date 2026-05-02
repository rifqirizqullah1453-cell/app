# Boh-Hizmet

All-in-one delivery, shopping, cleaning & moving platform for Bartin, Turkey.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Hono + tRPC 11 + Drizzle ORM
- **Database:** MySQL (TiDB Cloud)
- **Auth:** Kimi OAuth 2.0
- **Maps:** Leaflet + OpenStreetMap
- **Charts:** Chart.js
- **PDF:** jsPDF

## Prerequisites

- Node.js 20+
- npm 10+

## Quick Start (Local Development)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Setup Environment Variables

Copy `.env.example` to `.env` (or use existing `.env`):

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
DATABASE_URL=mysql://user:pass@host:port/db?ssl={"rejectUnauthorized":true}
VITE_APP_ID=your_app_id
VITE_KIMI_AUTH_URL=https://your-auth-url
APP_SECRET=your_app_secret
OWNER_UNION_ID=your_union_id
```

For local development without database, the app falls back to localStorage mode.

### Step 3: Push Database Schema (Optional)

If you have a MySQL database:

```bash
npm run db:push
```

If not, the app works with localStorage fallback.

### Step 4: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Step 5: Build for Production

```bash
npm run build
```

Static files will be in `dist/public/`.

## Features

### Core Features
- Create orders (delivery, shopping, cleaning, moving)
- Real-time order tracking with map
- In-app chat between customer and worker
- Photo evidence upload (before/after)
- Rate & review system
- Invoice generation (PDF)

### Platform Features
- Multi-language (Turkish, English, Indonesian)
- Dark mode toggle
- PWA (installable on mobile)
- Push notifications
- Admin analytics dashboard

### User Roles
- **Customer** — Place orders, track, chat, rate
- **Worker** — Accept orders, upload photos, earn money
- **Admin** — Full analytics, user management (owner only)

## Project Structure

```
app/
  api/              # Backend (tRPC routers, Hono server)
  contracts/        # Shared types (frontend + backend)
  db/               # Database schema & migrations
  public/           # Static assets (images, fonts)
  src/
    components/     # Reusable UI components
    contexts/       # React contexts (Auth, Order, Chat, Toast)
    hooks/          # Custom React hooks
    i18n/           # Translation files (TR, EN, ID)
    pages/          # Route pages
    utils/          # Utility functions
    App.tsx         # Main app with routes
    main.tsx        # Entry point
  .env               # Environment variables
  vite.config.ts     # Vite configuration
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build for production |
| `npm run check` | Type-check TypeScript |
| `npm run db:push` | Sync schema to database |
| `npm run db:generate` | Generate migration SQL |
| `npm run db:migrate` | Apply pending migrations |

## Deployment Guide

### Option 1: Vercel (Recommended, Free)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import GitHub repo
3. Add environment variables in Vercel dashboard
4. Deploy!

### Option 2: VPS/Server

1. Build: `npm run build`
2. Serve `dist/public/` with Nginx or any static server
3. Run backend: `npm start`

### Option 3: Static Hosting Only (No Backend)

1. Build: `npm run build`
2. Take files from `dist/public/`
3. Upload to any static host (Netlify, Surge, GitHub Pages)
4. App works with localStorage (no database needed)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Optional | MySQL connection string |
| `VITE_APP_ID` | Yes | Kimi OAuth app ID |
| `VITE_KIMI_AUTH_URL` | Yes | Kimi auth server URL |
| `APP_SECRET` | Yes | App secret for JWT |
| `OWNER_UNION_ID` | Yes | Admin user union ID |

## License

MIT
