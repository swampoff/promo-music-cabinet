# 🚀 Deployment Guide - PROMO.MUSIC

**Версия:** 2.0  
**Дата:** 28 января 2026

---

## 📋 Содержание

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Backend Deployment (Supabase)](#backend-deployment-supabase)
6. [Domain Configuration](#domain-configuration)
7. [CI/CD Setup](#cicd-setup)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Accounts

```bash
✅ GitHub account
✅ Vercel account (https://vercel.com)
✅ Supabase account (https://supabase.com)
✅ Domain name (optional, для custom domain)
```

### Required Tools

```bash
Node.js >= 18.0.0
npm >= 9.0.0 или pnpm >= 8.0.0
Git
Supabase CLI
```

### Install Supabase CLI

```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm (All platforms)
npm install -g supabase
```

---

## 🔧 Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/promo-music.git
cd promo-music
```

### 2. Install Dependencies

```bash
npm install
# или
pnpm install
```

### 3. Create Environment Files

**`.env` (Local Development):**

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Optional
VITE_PLACEHOLDER_IMAGE_BASE_URL=https://picsum.photos
```

**`.env.production` (Production):**

```env
# Same as .env but with production values
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
# ... rest of the variables
```

---

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter project details:
   - **Name:** promo-music-prod
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to your users
4. Wait for project to be created (~2 minutes)

### 2. Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

3. Go to **Project Settings** → **Database**
4. Copy **Connection String** → `SUPABASE_DB_URL`

### 3. Link Project with CLI

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Your project ref can be found in the Supabase dashboard URL:
# https://supabase.com/dashboard/project/[your-project-ref]
```

### 4. Run Database Migrations

```bash
# Push all migrations to Supabase
supabase db push

# Or apply specific migration
supabase db push --include-all
```

**Миграции будут применены в порядке:**

```
001_initial_schema.sql
002_row_level_security.sql
003_content_and_media.sql
004_social_and_engagement.sql
005_donations_and_coins.sql
20260126_create_concerts_tables.sql
20260127_create_banner_ads_tables.sql
20260127_payments_system.sql
20260128_track_test_system.sql
999_complete_schema_reference.sql
```

### 5. Verify Database Setup

```bash
# Connect to database
supabase db remote

# List tables
\dt

# Check if migrations applied
SELECT * FROM schema_migrations;
```

### 6. Seed Data (Optional)

```bash
# Run seed script
supabase db seed
```

---

## 🌐 Frontend Deployment (Vercel)

### Method 1: Vercel Dashboard (Recommended)

**Step 1: Import Repository**

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository:
   - **GitHub:** Authorize Vercel to access your repos
   - Select **promo-music** repository

**Step 2: Configure Project**

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Step 3: Environment Variables**

Add the following environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PLACEHOLDER_IMAGE_BASE_URL=https://picsum.photos
```

**Step 4: Deploy**

1. Click **"Deploy"**
2. Wait for deployment to complete (~2-3 minutes)
3. Your app will be live at `https://your-project.vercel.app`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? promo-music
# - Directory? ./
# - Override settings? No
```

### Auto-Deployment from Git

**Vercel автоматически деплоит:**

- **Main branch** → Production
- **Other branches** → Preview deployments

**Configuration in `vercel.json`:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

---

## ⚙️ Backend Deployment (Supabase)

### 1. Deploy Edge Functions

**Deploy all functions:**

```bash
supabase functions deploy
```

**Deploy specific function:**

```bash
supabase functions deploy server
```

**Verify deployment:**

```bash
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs server
```

### 2. Set Environment Secrets

```bash
# Set secrets for Edge Functions
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Verify secrets
supabase secrets list
```

### 3. Test Edge Functions

```bash
# Health check
curl https://your-project.supabase.co/functions/v1/make-server-84730125/health

# Expected response:
# {"status":"ok","timestamp":"2026-01-28T..."}
```

### 4. Storage Setup

**Create storage buckets:**

```bash
# Storage buckets are auto-created by server on first start
# Or create manually in Supabase dashboard:

1. Go to Storage
2. Create new bucket: make-84730125-avatars
3. Create new bucket: make-84730125-tracks
4. Create new bucket: make-84730125-videos
5. Create new bucket: make-84730125-covers
6. Create new bucket: make-84730125-banners
7. Set buckets to Private
```

---

## 🌍 Domain Configuration

### Add Custom Domain to Vercel

**Step 1: Add Domain**

1. Go to your Vercel project
2. **Settings** → **Domains**
3. Enter your domain (e.g., `promo.music`)
4. Click **"Add"**

**Step 2: Configure DNS**

Add the following DNS records to your domain provider:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Step 3: Wait for Verification**

- DNS propagation: 24-48 hours (usually faster)
- SSL certificate: Automatic via Let's Encrypt

### Custom Domain for Supabase (Enterprise)

Supabase custom domains require Enterprise plan.

Alternative: Use Vercel proxy:

```typescript
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-project.supabase.co/functions/v1/make-server-84730125/:path*"
    }
  ]
}
```

---

## 🔄 CI/CD Setup

### GitHub Actions Workflow

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-functions:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        
      - name: Deploy Edge Functions
        run: |
          supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          supabase functions deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

**Required GitHub Secrets:**

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_REF
```

---

## 📊 Monitoring

### Vercel Analytics

**Enable in Dashboard:**

1. Go to your project
2. **Analytics** tab
3. Enable **Web Analytics**

**Add to code:**

```typescript
// src/main.tsx
import { Analytics } from '@vercel/analytics/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <Analytics />
  </>
);
```

### Supabase Monitoring

**Built-in Dashboard:**

1. **Database** → Performance
2. **API** → Logs
3. **Functions** → Logs

### External Monitoring (Optional)

**Sentry for Error Tracking:**

```bash
npm install @sentry/react

# src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
  tracesSampleRate: 1.0,
});
```

**Google Analytics 4:**

```typescript
// src/lib/analytics.ts
export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: url,
    });
  }
};
```

---

## 🔍 Troubleshooting

### Issue: Build Failed on Vercel

**Error:** `Module not found`

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Commit and push
git add .
git commit -m "fix: reinstall dependencies"
git push
```

### Issue: Database Connection Error

**Error:** `Connection to database failed`

**Solution:**
```bash
# Check connection string format
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Test connection
psql $SUPABASE_DB_URL
```

### Issue: Edge Function Not Working

**Error:** `Function returned an error`

**Solution:**
```bash
# Check function logs
supabase functions logs server

# Redeploy function
supabase functions deploy server --no-verify-jwt

# Check environment variables
supabase secrets list
```

### Issue: CORS Error

**Error:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution:**

Check CORS configuration in `/supabase/functions/server/index.tsx`:

```typescript
app.use('/*', cors({
  origin: '*',  // or specific domain
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
```

### Issue: Environment Variables Not Working

**Solution:**

1. **Vercel:** Go to Settings → Environment Variables → Update
2. **Trigger redeploy:** Make a commit or manual redeploy
3. **Check build logs:** Ensure variables are loaded

---

## ✅ Deployment Checklist

### Pre-Deployment

```
□ All tests passing
□ Build successful locally
□ Environment variables configured
□ Database migrations tested
□ Edge functions tested locally
```

### Deployment

```
□ Database migrated
□ Edge functions deployed
□ Frontend deployed
□ Environment variables set
□ DNS configured (if custom domain)
```

### Post-Deployment

```
□ Health check passing
□ All pages loading
□ Auth working
□ API endpoints responding
□ Database queries working
□ Storage uploads working
□ Analytics configured
□ Monitoring active
```

### Production Checklist

```
□ SSL certificate active
□ Rate limiting enabled
□ Error tracking configured
□ Backup strategy in place
□ Monitoring alerts set up
□ Documentation updated
```

---

## 📞 Support

**Issues:** https://github.com/your-username/promo-music/issues  
**Email:** support@promo.music  
**Documentation:** /README.md

---

**Дата обновления:** 28 января 2026  
**Версия:** 2.0
