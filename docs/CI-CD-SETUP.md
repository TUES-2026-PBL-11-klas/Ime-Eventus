# CI/CD Pipeline Setup Guide

## What I've Created

A GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that automatically:

1. **Builds & tests your backend** (Java/Maven)
2. **Validates your frontend** (Next.js - linting, TypeScript, build)
3. **Runs UI tests** (Vitest)
4. **Deploys to Render** when all checks pass on the `main` branch

---

## Step-by-Step Setup

### Step 1: Push to GitHub

First, make sure this file is in your GitHub repository:

```bash
git add .github/workflows/ci-cd.yml
git commit -m "Add CI/CD pipeline"
git push origin main
```

---

### Step 2: Create Render Account & Apps

1. Go to https://render.com and sign up (free tier available)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Create TWO services:

   **Service 1: Backend**
   - Name: `eventus-api` (or similar)
   - Environment: `Docker` or `Java`
   - Build command: `cd server && mvn clean package`
   - Start command: `java -jar server/target/*.jar`
   - Add environment variable: `PORT=10000` (or whatever you need)

   **Service 2: Frontend**
   - Name: `eventus-web` (or similar)  
   - Environment: `Node`
   - Build command: `cd client && pnpm install && pnpm build`
   - Start command: `cd client && pnpm start`

---

### Step 3: Get Render Deploy Hooks

For each Render service:

1. Go to service settings
2. Find **"Deploy Hook"** section
3. Copy the webhook URL

---

### Step 4: Add GitHub Secrets

1. Go to GitHub → Your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add two secrets:

   - **Name:** `RENDER_DEPLOY_HOOK_BACKEND`
     **Value:** (paste Backend deploy hook from Step 3)

   - **Name:** `RENDER_DEPLOY_HOOK_FRONTEND`
     **Value:** (paste Frontend deploy hook from Step 3)

---

### Step 5: Test the Pipeline

1. Make a small change to your code
2. Push to GitHub
3. Go to **Actions** tab in your repo
4. Watch the pipeline run automatically ✅

---

## Pipeline Flow

```
┌─────────────────────────────────────────┐
│  You push code to GitHub                │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌──────────────┐ ┌──────────────────┐
│ Backend Test │ │ Frontend Lint &  │
│  (Maven)     │ │ Build (Next.js)  │
└──────┬───────┘ └────────┬─────────┘
       │                  │
       └──────────┬───────┘
                  │
                  ▼
          ┌───────────────┐
          │  UI Tests     │
          │  (Vitest)     │
          └───────┬───────┘
                  │
          ✅ All passed?
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
    ┌─────────┐       ┌─────────┐
    │Deploy   │       │Deploy   │
    │Backend  │       │Frontend │
    └─────────┘       └─────────┘
```

---

## Troubleshooting

### ❌ "RENDER_DEPLOY_HOOK_BACKEND secret not configured"
- You haven't added the GitHub secrets yet (do Step 4)

### ❌ Maven build fails
- Make sure `pom.xml` is in the `server/` folder ✓
- Check Java version is 25 compatible

### ❌ Frontend build fails
- Ensure `package.json` has `build` script
- Check `client/` folder exists

### ❌ Render deployment doesn't happen
- Only deploys on **push to `main` branch**
- Failed checks prevent deployment (makes it safe!)

---

## Next Steps (Optional)

- Add database credentials to Render environment variables
- Set up database migrations in Render
- Add email notifications when builds fail
- Add code coverage reports
- Set up staging environment on `develop` branch

