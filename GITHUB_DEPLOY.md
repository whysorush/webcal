# 🚀 Deploy to Free Hosting from GitHub

Your calendar service **cannot** run on GitHub Pages (it's static-only), but you can deploy it for **FREE** using these platforms that integrate with GitHub.

## Option 1: Render.com (Recommended) ⭐

**Why Render?**
- ✅ Completely free tier (750 hours/month)
- ✅ Auto-deploys from GitHub
- ✅ Free SSL/HTTPS
- ✅ No credit card required
- ✅ Takes 5 minutes

### Step-by-Step Guide

#### 1. Push Your Code to GitHub

```bash
cd /home/rushabh/projects/clients/sprteqq/Microsite/webcal

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Calendar sync service"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/webcal-service.git
git branch -M main
git push -u origin main
```

#### 2. Deploy on Render

1. Go to [render.com](https://render.com) and sign up (use your GitHub account)

2. Click **"New +"** → **"Web Service"**

3. Connect your GitHub repository (`webcal-service`)

4. Configure the service:
   - **Name:** `webcal-service` (or any name you want)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

5. Add Environment Variables:
   - Click **"Advanced"**
   - Add these variables:
     ```
     PROTOCOL = https
     PORT = 3000
     ```
   - `DOMAIN` will be auto-set by Render (e.g., `your-app.onrender.com`)

6. Click **"Create Web Service"**

7. Wait 2-3 minutes for deployment ⏳

8. You'll get a URL like: `https://webcal-service.onrender.com`

#### 3. Test Your Deployment

```bash
# Check health
curl https://your-app.onrender.com/health

# Create a feed
curl -X POST https://your-app.onrender.com/api/feeds \
  -H "Content-Type: application/json" \
  -d '{"owner": "My Calendar"}'
```

#### 4. Subscribe in Google Calendar

1. Open your deployed app: `https://your-app.onrender.com`
2. Click "Subscribe to Calendar"
3. Google Calendar will now be able to access the feed!
4. All 10 events will sync automatically 🎉

### Important Notes

- **Free tier sleeps after 15 min of inactivity** - First request takes 30-60 seconds to wake up
- **750 hours/month limit** - More than enough for personal use
- **Auto-deploys** - Every push to GitHub automatically deploys

---

## Option 2: Railway.app 🚂

**Why Railway?**
- ✅ $5 free credit per month
- ✅ Super fast deployments
- ✅ Great developer experience

### Deploy to Railway

1. Go to [railway.app](https://railway.app)

2. Sign up with GitHub

3. Click **"New Project"** → **"Deploy from GitHub repo"**

4. Select your `webcal-service` repository

5. Railway auto-detects Node.js and deploys!

6. Go to **Settings** → **Domains** → **Generate Domain**

7. Set environment variables:
   - Go to **Variables** tab
   - Add:
     ```
     PROTOCOL=https
     PORT=3000
     ```

8. Your app is live at: `https://your-app.up.railway.app`

---

## Option 3: Fly.io 🪰

**Why Fly.io?**
- ✅ Free tier includes 3 VMs
- ✅ Global edge network
- ✅ Great performance

### Deploy to Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app (from your project directory)
cd /home/rushabh/projects/clients/sprteqq/Microsite/webcal
fly launch

# Follow the prompts:
# - App name: webcal-service
# - Region: Choose closest to you
# - PostgreSQL: No
# - Redis: No

# Set environment variables
fly secrets set PROTOCOL=https

# Deploy
fly deploy

# Your app is live at: https://webcal-service.fly.dev
```

---

## Option 4: Vercel (with Serverless Functions)

Vercel is primarily for static sites, but you can adapt your app to use serverless functions.

**Note:** This requires code changes to work with Vercel's serverless architecture. The above options (Render, Railway, Fly) work with your existing code without modifications.

---

## Comparison Table

| Platform | Free Tier | Auto-Deploy | Setup Time | Best For |
|----------|-----------|-------------|------------|----------|
| **Render** | 750 hrs/mo | ✅ Yes | 5 min | Beginners, simplicity |
| **Railway** | $5/mo credit | ✅ Yes | 3 min | Speed, DX |
| **Fly.io** | 3 VMs | ⚠️ Manual | 10 min | Performance, global |
| **Heroku** | Discontinued free tier | ✅ Yes | 10 min | Legacy projects |

---

## After Deployment: Update Your Code

Once deployed, you can set the domain in your server:

```javascript
// server.js - Update CONFIG
const CONFIG = {
  domain: process.env.DOMAIN || 'your-app.onrender.com',
  protocol: process.env.PROTOCOL || 'https',
  port: process.env.PORT || 3000
};
```

Or set it via environment variables in your hosting platform.

---

## Auto-Deploy Setup

All these platforms support **automatic deployments**:

1. Push code to GitHub
2. Platform automatically detects changes
3. Builds and deploys new version
4. Your calendar feed stays up to date!

```bash
# Make changes locally
git add .
git commit -m "Updated events"
git push origin main

# Platform auto-deploys in 1-2 minutes!
```

---

## Troubleshooting

### "Application failed to start"
- Check logs in your hosting platform dashboard
- Verify `package.json` has correct start script: `"start": "node server.js"`

### "Cannot GET /"
- Make sure `public/index.html` exists
- Check that Express serves static files: `app.use(express.static('public'))`

### Events not showing in Google Calendar
- Verify your app is accessible publicly (not localhost)
- Check the feed URL returns valid ICS data
- Wait 15-30 minutes for Google Calendar to refresh

### Port binding errors
- Make sure you're using `process.env.PORT`
- Don't hardcode port 3000 in production

---

## Recommended: Use Render

For your use case, **Render.com is the best choice**:

1. ✅ Push to GitHub
2. ✅ Connect to Render
3. ✅ Deploy in 5 minutes
4. ✅ Works perfectly with Google Calendar
5. ✅ Free HTTPS included
6. ✅ Auto-deploys on every push

**Total time: 10 minutes from GitHub to working calendar subscription!**

