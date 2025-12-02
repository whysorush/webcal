# 🚀 Deployment Guide

## Why Google Calendar Can't See Localhost

**Google Calendar** (and other cloud calendar services) run on Google's servers, not your computer. When you try to subscribe to a `localhost:3000` URL from Google Calendar, Google's servers try to fetch the calendar feed, but they can't access your local machine.

### What Works on Localhost ✅

- **iOS Calendar** - Works perfectly! Uses the `webcal://` protocol which opens directly on your device
- **macOS Calendar** - Works perfectly! Same as iOS
- **Direct ICS download** - Works for any device

### What Doesn't Work on Localhost ❌

- **Google Calendar** - Cannot access localhost URLs
- **Outlook.com** - Cannot access localhost URLs
- **Any cloud-based calendar service** - Cannot access localhost URLs

## Solutions

### Option 1: Use ngrok (Quick Testing) 🔧

**ngrok** creates a secure tunnel from a public URL to your localhost.

#### Step 1: Install ngrok

```bash
# Using npm
npm install -g ngrok

# Or download from https://ngrok.com/download
```

#### Step 2: Start your server

```bash
npm start
# Server runs on http://localhost:3000
```

#### Step 3: Create ngrok tunnel (in a new terminal)

```bash
ngrok http 3000
```

You'll see output like:

```
Session Status                online
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
```

#### Step 4: Access your app

Open `https://abc123.ngrok.io` in your browser. Now Google Calendar can access the feed!

**Pros:**
- ✅ Works immediately
- ✅ Free tier available
- ✅ HTTPS included

**Cons:**
- ❌ URL changes each time you restart ngrok (unless you have a paid plan)
- ❌ Not suitable for production

---

### Option 2: Deploy to a Cloud Platform (Production) ☁️

For production use, deploy to a public server.

#### Deploy to Render (Free Tier)

1. Create account at [render.com](https://render.com)

2. Create a new Web Service

3. Connect your Git repository

4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     ```
     DOMAIN=your-app.onrender.com
     PROTOCOL=https
     PORT=3000
     ```

5. Deploy! You'll get a URL like `https://your-app.onrender.com`

#### Deploy to Railway

1. Create account at [railway.app](https://railway.app)

2. Click "New Project" → "Deploy from GitHub"

3. Select your repository

4. Railway auto-detects Node.js and deploys

5. Set environment variables in the Railway dashboard

#### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-calendar-app

# Set environment variables
heroku config:set DOMAIN=your-calendar-app.herokuapp.com
heroku config:set PROTOCOL=https

# Deploy
git push heroku main
```

#### Deploy to DigitalOcean App Platform

1. Create account at [digitalocean.com](https://digitalocean.com)

2. Go to App Platform → Create App

3. Connect your GitHub repository

4. Configure build and run commands

5. Deploy

---

### Option 3: Use a VPS (Full Control) 🖥️

Deploy to a VPS like DigitalOcean Droplet, AWS EC2, or Linode.

#### Quick Setup on Ubuntu VPS

```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Clone your repository
git clone https://github.com/yourusername/webcal.git
cd webcal

# Install dependencies
npm install

# Set environment variables
export DOMAIN=your-domain.com
export PROTOCOL=https
export PORT=3000

# Start with PM2
pm2 start server.js --name webcal-service
pm2 save
pm2 startup

# Install Nginx
sudo apt-get install nginx

# Configure Nginx (see below)
```

#### Nginx Configuration

Create `/etc/nginx/sites-available/webcal`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/webcal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Add HTTPS with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Environment Variables

Set these when deploying:

| Variable | Description | Example |
|----------|-------------|---------|
| `DOMAIN` | Your public domain | `calendar.yourdomain.com` |
| `PROTOCOL` | `http` or `https` | `https` |
| `PORT` | Server port | `3000` |

---

## Testing Your Deployment

### 1. Check Health Endpoint

```bash
curl https://your-domain.com/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-02T...",
  "feedCount": 0
}
```

### 2. Create a Test Feed

```bash
curl -X POST https://your-domain.com/api/feeds \
  -H "Content-Type: application/json" \
  -d '{"owner": "Test User"}'
```

### 3. Subscribe in Google Calendar

1. Go to [Google Calendar](https://calendar.google.com)
2. Click the **+** next to "Other calendars"
3. Select "From URL"
4. Paste your HTTPS feed URL
5. Events should appear within a few minutes!

---

## Database Setup (Production)

The current implementation uses in-memory storage. For production, use a database:

### MongoDB Example

```bash
npm install mongodb
```

```javascript
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db('webcal');
const feedsCollection = db.collection('feeds');

// Replace in-memory feeds object with database calls
app.post('/api/feeds', async (req, res) => {
  const feedId = uuidv4();
  const feed = {
    feedId,
    owner: req.body.owner || 'Anonymous',
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    events: []
  };
  
  await feedsCollection.insertOne(feed);
  // ... rest of code
});
```

---

## Troubleshooting

### Google Calendar not showing events

1. **Check the feed URL is public** - Open it in an incognito browser window
2. **Wait 15-30 minutes** - Google Calendar caches feeds
3. **Check date formats** - Events must be in ISO 8601 format
4. **Verify HTTPS** - Google Calendar requires HTTPS for subscriptions

### iOS Calendar not updating

1. Go to Settings → Calendar → Accounts
2. Select the subscribed calendar
3. Tap "Refetch" or remove and re-add

### Events showing wrong time

- Make sure event times are in UTC (ISO 8601 format with Z suffix)
- Example: `2024-12-15T10:00:00Z`

---

## Security Considerations

### For Production:

1. **Add authentication** to protect feed creation
2. **Rate limiting** to prevent abuse
3. **Use HTTPS** (required for most calendar apps)
4. **Validate input** to prevent injection attacks
5. **Use a database** instead of in-memory storage
6. **Add CORS restrictions** to your domain only

---

## Need Help?

- Check the [main README](./README.md) for API documentation
- Test locally with ngrok first
- Verify the ICS feed validates at [icalendar.org/validator](https://icalendar.org/validator.html)

