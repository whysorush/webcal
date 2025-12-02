# 📅 How to Subscribe in Google Calendar

## Method 1: Using the Direct ICS URL (Recommended)

This is the most reliable method for Google Calendar.

### Step-by-Step:

1. **Get your ICS feed URL**
   - Go to: https://webcal-epb3.onrender.com
   - Copy the **HTTPS URL** (not the webcal:// or Google Calendar URL)
   - Example: `https://webcal-epb3.onrender.com/calendars/feeds/YOUR-FEED-ID.ics`

2. **Open Google Calendar**
   - Go to: https://calendar.google.com

3. **Add calendar from URL**
   - On the left sidebar, click the **+** button next to "Other calendars"
   - Select **"From URL"**
   
4. **Paste the HTTPS URL**
   - Paste: `https://webcal-epb3.onrender.com/calendars/feeds/YOUR-FEED-ID.ics`
   - Click **"Add calendar"**

5. **Wait for sync**
   - It may take 5-30 minutes for events to appear
   - Google Calendar refreshes subscribed calendars periodically

## Method 2: Import as ICS File (Alternative)

If subscription doesn't work, you can import the calendar:

1. **Download the ICS file**
   - Open: `https://webcal-epb3.onrender.com/calendars/feeds/YOUR-FEED-ID.ics`
   - Save the file to your computer

2. **Import to Google Calendar**
   - Go to https://calendar.google.com
   - Click the gear icon ⚙️ → **Settings**
   - Click **"Import & Export"** in the left menu
   - Click **"Select file from your computer"**
   - Choose the downloaded .ics file
   - Select which calendar to import to
   - Click **"Import"**

**Note:** This method imports events once. They won't auto-update.

## Method 3: Using Google Calendar Mobile App

### On Android:

1. Open the Google Calendar app
2. Tap the **☰** menu → **Settings**
3. Tap **"Add calendar"**
4. Select **"From URL"**
5. Paste the HTTPS URL
6. Tap **"Add calendar"**

### On iOS:

Google Calendar app on iOS doesn't support URL subscriptions. Use the iOS Calendar app instead:

1. Open **Settings** → **Calendar** → **Accounts**
2. Tap **"Add Account"** → **"Other"**
3. Tap **"Add Subscribed Calendar"**
4. Enter the `webcal://` URL
5. Tap **"Next"** → **"Save"**

## Troubleshooting

### "Unable to add. Check the URL"

This error can happen for several reasons:

#### 1. **Wrong URL format**
- ✅ **Use:** `https://webcal-epb3.onrender.com/calendars/feeds/YOUR-FEED-ID.ics`
- ❌ **Don't use:** `webcal://...` (this is for iOS/macOS)
- ❌ **Don't use:** The Google Calendar redirect URL

#### 2. **Feed is empty**
- Make sure the feed has events
- Check: https://webcal-epb3.onrender.com/api/feeds/YOUR-FEED-ID
- Should show `"eventCount": 10`

#### 3. **Google Calendar cache**
- Google may cache failed attempts for 24 hours
- Try again tomorrow, or
- Create a new feed and use that URL

#### 4. **URL is not accessible**
- Test the URL in your browser
- It should download an .ics file
- If you get an error, the feed doesn't exist

#### 5. **Render app is sleeping**
- Free tier apps sleep after 15 minutes
- First request takes 30-60 seconds to wake up
- Try the URL again after waiting

### Events not showing up

If you successfully added the calendar but don't see events:

1. **Wait longer** - Google Calendar can take up to 24 hours to fetch
2. **Check the feed** - Visit the ICS URL in browser to verify events exist
3. **Remove and re-add** - Sometimes this forces a refresh
4. **Check calendar visibility** - Make sure the subscribed calendar is visible (checked) in the left sidebar

### Events showing wrong times

- Events are stored in UTC
- Google Calendar should automatically convert to your timezone
- If times are wrong, check your Google Calendar timezone settings

## Testing Your Feed

Before subscribing, test that your feed works:

### 1. Check feed exists:
```bash
curl https://webcal-epb3.onrender.com/api/feeds/YOUR-FEED-ID
```

Should return JSON with `"eventCount": 10`

### 2. Check ICS is valid:
```bash
curl https://webcal-epb3.onrender.com/calendars/feeds/YOUR-FEED-ID.ics
```

Should return:
```
BEGIN:VCALENDAR
VERSION:2.0
...
BEGIN:VEVENT
...
END:VEVENT
...
END:VCALENDAR
```

### 3. Validate ICS format:
- Go to: https://icalendar.org/validator.html
- Paste your ICS URL
- Click "Validate"
- Should show no errors

## Why Subscription is Better Than Import

| Feature | Subscription | Import |
|---------|-------------|--------|
| Auto-updates | ✅ Yes | ❌ No |
| One-time setup | ✅ Yes | ❌ Must re-import |
| Event changes sync | ✅ Yes | ❌ No |
| Event deletions sync | ✅ Yes | ❌ No |
| Recommended | ✅ Yes | ⚠️ Fallback only |

## Alternative: Use iOS/macOS Calendar

If Google Calendar continues to have issues, iOS and macOS Calendar apps work perfectly:

1. Open the Calendar app
2. File → New Calendar Subscription (macOS) or Settings → Accounts → Add Account (iOS)
3. Enter the `webcal://` URL
4. Works immediately! ✅

The events will still sync across all your Apple devices via iCloud.

## Still Having Issues?

1. **Check the TROUBLESHOOTING.md** file for more detailed debugging
2. **Verify your feed URL** is correct and accessible
3. **Try the import method** as a temporary solution
4. **Use a different calendar app** (iOS Calendar, Outlook, etc.)
5. **Wait 24 hours** - Sometimes Google Calendar needs time to clear caches

## Success Checklist

Before contacting support, verify:

- [ ] Feed URL starts with `https://` (not `webcal://`)
- [ ] Feed URL ends with `.ics`
- [ ] Opening the URL in browser downloads an .ics file
- [ ] The .ics file contains events (open it in a text editor)
- [ ] You're using "Add from URL" not "Import"
- [ ] You've waited at least 30 minutes after adding
- [ ] The subscribed calendar is visible (checked) in Google Calendar
- [ ] You've tried removing and re-adding the calendar
- [ ] You've cleared your browser cache

If all items are checked and it still doesn't work, try the import method or use a different calendar application.

