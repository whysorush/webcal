# 📅 WebCal Feed Service

A Node.js backend service that enables users to subscribe to dynamic calendar feeds that sync automatically across iOS, Android (Google Calendar), macOS, and Outlook.

## ✨ Features

- **Live Calendar Subscriptions** - No file downloads, just subscribe once and stay synced
- **Cross-Platform Support** - Works with Apple Calendar, Google Calendar, Outlook, and more
- **Smart Device Detection** - Automatically routes users to the right subscription method
- **Dynamic Updates** - Add, update, or delete events and subscribers see changes automatically
- **Efficient Caching** - Uses ETag and Last-Modified headers for optimal performance
- **RESTful API** - Simple JSON API for managing feeds and events

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or with auto-reload during development
npm run dev
```

### Access the Demo

Open your browser to `http://localhost:3000` to access the interactive demo UI.

## 🔧 Configuration

Set environment variables to configure the service:

```bash
# Domain for generated URLs (default: localhost:3000)
export DOMAIN=yourdomain.com

# Protocol for generated URLs (default: http)
export PROTOCOL=https

# Server port (default: 3000)
export PORT=3000
```

## 📡 API Reference

### Create a Calendar Feed

```bash
POST /api/feeds
Content-Type: application/json

{
  "owner": "John Doe"
}
```

**Response:**
```json
{
  "feedId": "uuid-here",
  "httpsUrl": "https://yourdomain.com/calendars/feeds/uuid.ics",
  "webcalUrl": "webcal://yourdomain.com/calendars/feeds/uuid.ics",
  "googleCalendarUrl": "https://calendar.google.com/calendar/u/0/r?cid=...",
  "message": "Calendar feed created successfully"
}
```

### Get Feed Info

```bash
GET /api/feeds/:feedId
```

### List All Feeds

```bash
GET /api/feeds
```

### Add Events to a Feed (Replace All)

```bash
POST /api/feeds/:feedId/events
Content-Type: application/json

{
  "events": [
    {
      "uid": "optional-unique-id",
      "start": "2024-12-15T10:00:00Z",
      "end": "2024-12-15T11:00:00Z",
      "summary": "Team Meeting",
      "description": "Weekly sync",
      "location": "Conference Room A",
      "url": "https://meet.example.com/abc"
    }
  ]
}
```

### Add a Single Event

```bash
POST /api/feeds/:feedId/event
Content-Type: application/json

{
  "start": "2024-12-15T10:00:00Z",
  "end": "2024-12-15T11:00:00Z",
  "summary": "Team Meeting",
  "description": "Weekly sync",
  "location": "Conference Room A"
}
```

### Delete an Event

```bash
DELETE /api/feeds/:feedId/events/:eventUid
```

### Delete a Feed

```bash
DELETE /api/feeds/:feedId
```

### Get Calendar Feed (ICS)

```bash
GET /calendars/feeds/:feedId.ics
```

Returns `text/calendar` content with proper caching headers.

## 📱 Platform-Specific Behavior

### iOS / macOS

Using the `webcal://` protocol opens the native Calendar app with a subscription prompt:

```
webcal://yourdomain.com/calendars/feeds/{feedId}.ics
```

### Android / Google Calendar

Android doesn't consistently support `webcal://`, so we use Google Calendar's subscription URL:

```
https://calendar.google.com/calendar/u/0/r?cid={encoded-https-url}
```

### Desktop (Windows/Linux)

The HTTPS URL works directly with most desktop calendar applications:
- Microsoft Outlook
- Thunderbird
- GNOME Calendar
- Windows Calendar

## 🧠 How It Works

1. **Create Feed** - User gets a unique feed ID and subscription URLs
2. **Add Events** - Events are stored and associated with the feed
3. **Subscribe** - User subscribes via their preferred calendar app
4. **Auto-Sync** - Calendar apps poll the feed periodically (typically every 15-30 minutes)
5. **Updates Propagate** - Any changes to events appear in all subscribed calendars

## 🔒 Production Considerations

### Use a Database

Replace the in-memory `feeds` object with a persistent database:

```javascript
// Example with MongoDB
const feeds = await db.collection('feeds').findOne({ feedId });
```

### Add Authentication

Protect feed creation and management endpoints:

```javascript
app.post('/api/feeds', authenticateUser, (req, res) => {
  // ...
});
```

### Use HTTPS

Calendar subscriptions require HTTPS in production:

```bash
export PROTOCOL=https
export DOMAIN=calendar.yourdomain.com
```

### Configure CORS

Restrict CORS to your frontend domain:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

## 📄 Event Properties

| Property | Required | Description |
|----------|----------|-------------|
| `uid` | No | Unique event identifier (auto-generated if not provided) |
| `start` | Yes | Event start time (ISO 8601 format) |
| `end` | Yes | Event end time (ISO 8601 format) |
| `summary` | Yes | Event title |
| `description` | No | Event description |
| `location` | No | Event location |
| `url` | No | URL associated with the event |
| `reminder` | No | Reminder trigger (seconds before event, negative) |

## 🛠️ Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **ical-generator** - ICS file generation
- **uuid** - Unique ID generation
- **cors** - Cross-origin resource sharing

## 📊 HTTP Headers

The ICS endpoint sets these headers for optimal calendar sync:

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Type` | `text/calendar; charset=utf-8` | Identifies as calendar data |
| `ETag` | Computed hash | Enables conditional requests |
| `Last-Modified` | Feed update timestamp | Helps caching |
| `Cache-Control` | `public, max-age=1800` | 30-minute cache |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - feel free to use this in your projects!

