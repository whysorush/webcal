# 🚀 Quick Start Guide

## TL;DR - Get Your Calendar Live in 10 Minutes

### Step 1: Push to GitHub (2 minutes)

```bash
cd /home/rushabh/projects/clients/sprteqq/Microsite/webcal

# Initialize git
git init
git add .
git commit -m "Calendar sync service"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/webcal-service.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render.com (5 minutes)

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Select your `webcal-service` repository
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Click **"Create Web Service"**
6. Wait 2-3 minutes ⏳

### Step 3: Subscribe! (1 minute)

1. Open your Render URL (e.g., `https://webcal-service.onrender.com`)
2. Click **"Subscribe to Calendar"**
3. Accept the subscription in Google Calendar
4. **Done!** All 10 events are now syncing 🎉

---

## What You Get

✅ **10 pre-loaded events** spanning the next 25 days  
✅ **Auto-sync** - Calendar apps refresh every 30 minutes  
✅ **Works everywhere** - iOS, Android, macOS, Windows, Outlook  
✅ **Free hosting** - 750 hours/month on Render  
✅ **HTTPS included** - Secure by default  
✅ **Auto-deploy** - Push to GitHub = automatic updates  

---

## Local Testing (iOS/macOS Only)

```bash
npm install
npm start
# Open http://localhost:3000
# Click "Subscribe to Calendar" - works on iOS/macOS!
```

**Note:** Google Calendar cannot access localhost. Use Render or ngrok for testing with Google Calendar.

---

## Need Help?

- 📖 [Full Deployment Guide](./GITHUB_DEPLOY.md) - Step-by-step with screenshots
- 🔧 [Deployment Options](./DEPLOYMENT.md) - ngrok, VPS, cloud platforms
- 📚 [API Documentation](./README.md) - Complete API reference

---

## Common Issues

**Q: Google Calendar shows the subscription but no events?**  
A: Make sure you deployed to a public URL (not localhost). Wait 15-30 minutes for Google to fetch the feed.

**Q: Events showing wrong timezone?**  
A: Events are in UTC. Your calendar app will convert them to your local timezone automatically.

**Q: Render app is slow to respond?**  
A: Free tier sleeps after 15 min of inactivity. First request takes 30-60 seconds to wake up.

**Q: Want to add more events?**  
A: Edit the `generateDummyEvents()` function in `public/index.html` or use the API to add events programmatically.

---

## Next Steps

1. **Customize events** - Edit the dummy events in `public/index.html`
2. **Add a database** - Replace in-memory storage with MongoDB/PostgreSQL
3. **Add authentication** - Protect feed creation with API keys
4. **Custom domain** - Point your domain to Render
5. **Analytics** - Track how many people subscribe

---

## Architecture

```
User clicks "Subscribe" 
    ↓
Opens webcal:// or Google Calendar URL
    ↓
Calendar app fetches: https://your-app.com/calendars/feeds/{id}.ics
    ↓
Server generates ICS file with all events
    ↓
Calendar app displays events
    ↓
Every 30 min: Calendar app re-fetches for updates
```

---

**That's it! You now have a production-ready calendar sync service.** 🎉

