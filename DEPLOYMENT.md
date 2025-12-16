# Deployment Guide - Render + Netlify

This guide will help you deploy your Project Counter application to Render (backend) and Netlify (frontend).

## Prerequisites

- GitHub repository with your code (✓ You have this)
- Free Render account (https://render.com)
- Free Netlify account (https://netlify.com)

## Part 1: Deploy Backend to Render

### Step 1: Push Latest Code to GitHub

Make sure your latest code (including the deployment files) is pushed to GitHub:

```bash
git add .
git commit -m "Add deployment configuration"
git push
```

### Step 2: Create Render Account & Deploy

1. Go to https://render.com and sign up (use GitHub to sign in)

2. Click **New +** → **Web Service**

3. Connect your GitHub repository:
   - Click **Connect account** if needed
   - Find and select your `project-counter` repository
   - Click **Connect**

4. Configure the service:
   - **Name**: `project-counter-api` (or any name you prefer)
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Instance Type**: `Free`

5. Add Environment Variables (click **Advanced**):
   - Click **Add Environment Variable** for each:
     - `NODE_ENV` = `production`
     - `PORT` = `10000`
     - `DB_PATH` = `/data/project-counter.db`
     - `CORS_ORIGIN` = `*` (we'll update this later)

6. Add Persistent Disk (scroll down in Advanced):
   - Click **Add Disk**
   - **Name**: `project-counter-data`
   - **Mount Path**: `/data`
   - **Size**: `1 GB` (free tier)

7. Click **Create Web Service**

8. Wait for deployment (2-5 minutes). You'll see logs in real-time.

9. Once deployed, copy your API URL:
   - It will look like: `https://project-counter-api.onrender.com`
   - Test it by visiting: `https://YOUR-URL.onrender.com/health`
   - You should see: `{"success":true,"data":{"status":"healthy",...}}`

**Important**: Save this URL! You'll need it for the frontend.

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Create Netlify Account

1. Go to https://netlify.com and sign up (use GitHub to sign in)

### Step 2: Deploy via GitHub

1. Click **Add new site** → **Import an existing project**

2. Click **Deploy with GitHub**

3. Authorize Netlify and select your `project-counter` repository

4. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `client/dist`

5. Add Environment Variable:
   - Click **Show advanced**
   - Click **New variable**
   - **Key**: `VITE_API_URL`
   - **Value**: `https://YOUR-RENDER-URL.onrender.com/api`
     - Replace with your actual Render URL from Part 1
     - **Don't forget** the `/api` at the end!

6. Click **Deploy site**

7. Wait for deployment (1-2 minutes)

8. Once deployed, you'll get a URL like: `https://random-name-123.netlify.app`

### Step 3: Update CORS Settings

Now that you have your Netlify URL, go back to Render to update CORS:

1. Go to your Render dashboard
2. Click on your `project-counter-api` service
3. Go to **Environment** tab
4. Find `CORS_ORIGIN` and change it from `*` to your Netlify URL:
   - `https://your-netlify-site.netlify.app`
5. Click **Save Changes**
6. Your service will redeploy automatically

### Step 4: Custom Domain (Optional)

**On Netlify:**
- Go to **Site settings** → **Domain management**
- Click **Add custom domain** to use your own domain
- Or click **Change site name** to customize the Netlify subdomain

---

## Part 3: Test Your Deployed App

1. Visit your Netlify URL: `https://your-site.netlify.app`

2. Test the workflow:
   - ✅ Create a client (e.g., "INS" - "Inspire")
   - ✅ Create a project and verify job number auto-generates
   - ✅ Test search and filtering
   - ✅ Check dashboard statistics

3. Share the Netlify URL with your team!

---

## Troubleshooting

### Backend Issues

**Problem**: "Application failed to respond"
- Check Render logs: Dashboard → your service → Logs
- Verify environment variables are set correctly
- Make sure disk is mounted at `/data`

**Problem**: Database errors
- Verify `DB_PATH` is `/data/project-counter.db`
- Check that the disk is created and mounted

**Problem**: CORS errors in browser console
- Update `CORS_ORIGIN` in Render to match your Netlify URL
- Make sure there's no trailing slash

### Frontend Issues

**Problem**: "Failed to fetch" or network errors
- Check `VITE_API_URL` environment variable in Netlify
- Verify it ends with `/api` (e.g., `https://xxx.onrender.com/api`)
- Test the backend directly: visit `https://your-render-url.onrender.com/health`

**Problem**: Build fails on Netlify
- Check build logs in Netlify dashboard
- Verify base directory is set to `client`
- Verify publish directory is set to `client/dist`

---

## Important Notes

### Free Tier Limitations

**Render:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds to wake up
- 750 hours/month free (enough for a prototype)

**Netlify:**
- 100GB bandwidth/month
- Always instant (no spin-down)

### Data Persistence

Your SQLite database is persisted on Render's disk storage. Data will survive:
- ✅ Service restarts
- ✅ Deployments
- ✅ Spin down/up cycles

---

## Alternative: Quick Deploy with Render Blueprint

If you prefer automated deployment, Render can use the `render.yaml` file:

1. Go to Render Dashboard
2. Click **New +** → **Blueprint**
3. Connect your repository
4. Render will automatically detect `render.yaml` and configure everything
5. Click **Apply**

This sets up the disk and environment variables automatically!

---

## Update/Redeploy

**Backend (Render):**
- Push to GitHub → Render auto-deploys
- Or click **Manual Deploy** → **Deploy latest commit** in Render dashboard

**Frontend (Netlify):**
- Push to GitHub → Netlify auto-deploys
- Or click **Trigger deploy** in Netlify dashboard

---

## URLs to Share

After deployment, you'll have:

- **Frontend URL**: `https://your-site.netlify.app` ← Share this with your team
- **Backend URL**: `https://your-api.onrender.com` ← Used internally by frontend

Users only need the frontend URL!

---

## Cost

Both Render and Netlify have generous free tiers:
- **Current setup**: $0/month
- **If you need more**: Render paid plans start at $7/month (no spin-down)

---

Good luck with your deployment! 🚀
