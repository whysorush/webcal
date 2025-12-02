# 🔧 Troubleshooting Guide

## Issue: "Unable to add, check the URL" in Google Calendar

### Problem
When you try to subscribe to the calendar feed in Google Calendar, you get an error saying the URL cannot be added.

### Root Causes

#### 1. **HTTP instead of HTTPS** ❌
Google Calendar requires HTTPS URLs for calendar subscriptions. If your feed URLs show `http://` instead of `https://`, Google will reject them.

**How to check:**
- Visit your deployed app (e.g., https://webcal-epb3.onrender.com)
- Look at the "Calendar Feed URLs" section
- The HTTPS URL should start with `https://` not `http://`

**Fix:**
The latest code automatically detects Render's HTTPS protocol. Push the updated code:

```bash
git push origin main
```

Wait 2-3 minutes for Render to redeploy, then refresh your browser.

#### 2. **Feed is Empty** 📭
If the feed has no events, some calendar apps may reject it.

**How to check:**
```bash
curl https://webcal-epb3.onrender.com/api/feeds
```

Should show feeds with `eventCount > 0`.

**Fix:**
The frontend should automatically create 10 dummy events. If not:
1. Clear your browser cache
2. Refresh the page
3. Check browser console for JavaScript errors (F12 → Console tab)

#### 3. **CORS Issues** 🚫
If the frontend can't talk to the backend API.

**Symptoms:**
- Events don't load
- Browser console shows CORS errors
- "Total Events: 0" stays forever

**Fix:**
The server already has CORS enabled. If you still see issues:
1. Check Render logs for errors
2. Verify the API is accessible: `curl https://webcal-epb3.onrender.com/health`

#### 4. **Render App is Sleeping** 💤
Free tier Render apps sleep after 15 minutes of inactivity.

**Symptoms:**
- First page load takes 30-60 seconds
- Subsequent loads are fast

**Fix:**
This is normal behavior. Just wait for the app to wake up. Consider:
- Upgrading to a paid plan for always-on service
- Using a service like [UptimeRobot](https://uptimerobot.com/) to ping your app every 5 minutes

---

## Debugging Steps

### Step 1: Check Backend Health

```bash
curl https://webcal-epb3.onrender.com/health
```

**Expected:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-02T...",
  "feedCount": 2
}
```

### Step 2: Check Feed Creation

```bash
curl -X POST https://webcal-epb3.onrender.com/api/feeds \
  -H "Content-Type: application/json" \
  -d '{"owner": "Test"}'
```

**Expected:**
```json
{
  "feedId": "...",
  "httpsUrl": "https://webcal-epb3.onrender.com/calendars/feeds/....ics",
  "webcalUrl": "webcal://webcal-epb3.onrender.com/calendars/feeds/....ics",
  "googleCalendarUrl": "https://calendar.google.com/calendar/u/0/r?cid=...",
  "message": "Calendar feed created successfully"
}
```

**Check:** URLs should use `https://` not `http://`

### Step 3: Add Events and Check ICS Feed

```bash
# Use the feedId from step 2
FEED_ID="your-feed-id-here"

# Add an event
curl -X POST "https://webcal-epb3.onrender.com/api/feeds/${FEED_ID}/event" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Test Event",
    "start": "2024-12-15T10:00:00Z",
    "end": "2024-12-15T11:00:00Z",
    "location": "Test Location"
  }'

# Check the ICS feed
curl "https://webcal-epb3.onrender.com/calendars/feeds/${FEED_ID}.ics"
```

**Expected:**
```
BEGIN:VCALENDAR
VERSION:2.0
...
BEGIN:VEVENT
UID:...
SUMMARY:Test Event
DTSTART:20241215T100000Z
DTEND:20241215T110000Z
LOCATION:Test Location
END:VEVENT
END:VCALENDAR
```

### Step 4: Check Render Logs

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your `webcal-service`
3. Click **"Logs"** tab
4. Look for:
   - Configuration output showing `Protocol: https`
   - Any error messages
   - API requests being logged

### Step 5: Test in Google Calendar

1. Go to [Google Calendar](https://calendar.google.com)
2. Click **+** next to "Other calendars"
3. Select **"From URL"**
4. Paste the HTTPS URL (not webcal://)
5. Click **"Add calendar"**

**If it fails:**
- Make sure URL starts with `https://`
- Try the URL in a browser first - it should download an .ics file
- Wait 15-30 minutes and try again (Google caches failed attempts)

---

## Common Error Messages

### "The calendar could not be added"
- **Cause:** Invalid ICS format or unreachable URL
- **Fix:** Test the ICS URL in a validator: https://icalendar.org/validator.html

### "Events not showing up"
- **Cause:** Google Calendar hasn't refreshed yet
- **Fix:** Wait 15-30 minutes, or remove and re-add the calendar

### "Mixed content error"
- **Cause:** Trying to load HTTP content from HTTPS page
- **Fix:** Ensure all URLs use HTTPS

### "Failed to initialize calendar feed"
- **Cause:** Frontend can't reach backend API
- **Fix:** Check browser console for errors, verify CORS is enabled

---

## Environment Variables on Render

Make sure these are set in your Render dashboard:

| Variable | Value | Notes |
|----------|-------|-------|
| `PORT` | `3000` | Auto-set by Render |
| `RENDER_EXTERNAL_URL` | Auto-set | Used to detect domain and protocol |

**You don't need to manually set `PROTOCOL` or `DOMAIN`** - the code auto-detects them from `RENDER_EXTERNAL_URL`.

---

## Testing Locally

### With ngrok (for Google Calendar testing)

```bash
# Terminal 1: Start your server
npm start

# Terminal 2: Start ngrok
ngrok http 3000

# Use the ngrok HTTPS URL (e.g., https://abc123.ngrok.io)
```

### Without ngrok (iOS/macOS only)

```bash
npm start
# Open http://localhost:3000
# Click "Subscribe to Calendar"
# Works on iOS/macOS with webcal:// protocol
```

---

## Still Having Issues?

### Check these:

1. ✅ **Pushed latest code?**
   ```bash
   git log --oneline -n 1
   # Should show: "Add configuration logging for debugging deployment issues"
   ```

2. ✅ **Render redeployed?**
   - Check Render dashboard for "Deploy succeeded"
   - Look at logs for configuration output

3. ✅ **Using HTTPS URLs?**
   - Visit your app, check the URLs displayed
   - Should be `https://` not `http://`

4. ✅ **Events loaded?**
   - Should show "Total Events: 10"
   - Should see 10 events listed below

5. ✅ **Browser cache cleared?**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open in incognito/private window

### Get More Help

1. Check Render logs for error messages
2. Open browser console (F12) and look for errors
3. Test the API endpoints with curl (see above)
4. Verify the ICS feed is valid: https://icalendar.org/validator.html

---

## Quick Fix Checklist

- [ ] Code is pushed to GitHub
- [ ] Render has redeployed (check dashboard)
- [ ] Health endpoint returns `{"status":"healthy"}`
- [ ] URLs in the UI show `https://` not `http://`
- [ ] "Total Events: 10" is displayed
- [ ] 10 events are visible in the list
- [ ] Browser cache is cleared
- [ ] Tested ICS URL in browser (should download file)
- [ ] Waited 2-3 minutes after deployment

If all checkboxes are ✅ and it still doesn't work, there may be a temporary issue with Google Calendar. Try again in 30 minutes.

