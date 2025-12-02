const express = require('express');
const cors = require('cors');
const { default: ical } = require('ical-generator');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory feed storage (replace with database in production)
const feeds = {};

// Configuration - Update these for your deployment
const PORT = process.env.PORT || 3000;

// ⚙️ DEPLOYMENT CONFIGURATION
// Update this when deploying to production
const PRODUCTION_DOMAIN = 'webcal-epb3.onrender.com'; // Your Render domain
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

// Auto-detect configuration
let DOMAIN;
let PROTOCOL;

if (IS_PRODUCTION) {
  // Production: Use your Render domain
  DOMAIN = PRODUCTION_DOMAIN;
  PROTOCOL = 'https';
} else if (process.env.RENDER_EXTERNAL_URL) {
  // Render deployment (fallback if NODE_ENV not set)
  const renderUrl = new URL(process.env.RENDER_EXTERNAL_URL);
  DOMAIN = renderUrl.host;
  PROTOCOL = renderUrl.protocol.replace(':', '');
} else {
  // Local development
  DOMAIN = `localhost:${PORT}`;
  PROTOCOL = 'http';
}

const CONFIG = {
  domain: DOMAIN,
  protocol: PROTOCOL,
  port: PORT
};

/**
 * Create a new calendar feed
 * POST /api/feeds
 * Body: { owner: string }
 * Returns: { feedId, httpsUrl, webcalUrl, googleCalendarUrl }
 */
app.post('/api/feeds', (req, res) => {
  const feedId = uuidv4();
  const owner = req.body.owner || 'Anonymous';
  
  feeds[feedId] = {
    owner,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    events: []
  };

  const httpsUrl = `${CONFIG.protocol}://${CONFIG.domain}/calendars/feeds/${feedId}.ics`;
  const webcalUrl = `webcal://${CONFIG.domain}/calendars/feeds/${feedId}.ics`;
  const googleCalendarUrl = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(httpsUrl)}`;

  res.status(201).json({
    feedId,
    httpsUrl,
    webcalUrl,
    googleCalendarUrl,
    message: 'Calendar feed created successfully'
  });
});

/**
 * Get feed info
 * GET /api/feeds/:feedId
 * Returns: Feed metadata and event count
 */
app.get('/api/feeds/:feedId', (req, res) => {
  const feed = feeds[req.params.feedId];
  if (!feed) {
    return res.status(404).json({ error: 'Feed not found' });
  }

  const httpsUrl = `${CONFIG.protocol}://${CONFIG.domain}/calendars/feeds/${req.params.feedId}.ics`;
  const webcalUrl = `webcal://${CONFIG.domain}/calendars/feeds/${req.params.feedId}.ics`;
  const googleCalendarUrl = `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(httpsUrl)}`;

  res.json({
    feedId: req.params.feedId,
    owner: feed.owner,
    eventCount: feed.events.length,
    createdAt: feed.createdAt,
    lastUpdated: feed.lastUpdated,
    httpsUrl,
    webcalUrl,
    googleCalendarUrl
  });
});

/**
 * List all feeds (for demo/admin purposes)
 * GET /api/feeds
 */
app.get('/api/feeds', (req, res) => {
  const feedList = Object.entries(feeds).map(([feedId, feed]) => ({
    feedId,
    owner: feed.owner,
    eventCount: feed.events.length,
    lastUpdated: feed.lastUpdated
  }));
  res.json(feedList);
});

/**
 * Add/update events in a feed
 * POST /api/feeds/:feedId/events
 * Body: { events: Array<{ uid?, start, end, summary, description?, location?, url? }> }
 */
app.post('/api/feeds/:feedId/events', (req, res) => {
  const feedId = req.params.feedId;
  const feed = feeds[feedId];
  
  if (!feed) {
    return res.status(404).json({ error: 'Feed not found' });
  }

  const newEvents = req.body.events || [];
  
  // Validate events
  for (const event of newEvents) {
    if (!event.start || !event.end || !event.summary) {
      return res.status(400).json({ 
        error: 'Each event must have start, end, and summary fields' 
      });
    }
  }

  // Assign UIDs if not provided
  const processedEvents = newEvents.map(event => ({
    ...event,
    uid: event.uid || uuidv4()
  }));

  feed.events = processedEvents;
  feed.lastUpdated = Date.now();

  res.status(204).send();
});

/**
 * Add a single event to a feed
 * POST /api/feeds/:feedId/event
 * Body: { uid?, start, end, summary, description?, location?, url? }
 */
app.post('/api/feeds/:feedId/event', (req, res) => {
  const feedId = req.params.feedId;
  const feed = feeds[feedId];
  
  if (!feed) {
    return res.status(404).json({ error: 'Feed not found' });
  }

  const event = req.body;
  
  if (!event.start || !event.end || !event.summary) {
    return res.status(400).json({ 
      error: 'Event must have start, end, and summary fields' 
    });
  }

  const processedEvent = {
    ...event,
    uid: event.uid || uuidv4()
  };

  feed.events.push(processedEvent);
  feed.lastUpdated = Date.now();

  res.status(201).json({ 
    uid: processedEvent.uid,
    message: 'Event added successfully' 
  });
});

/**
 * Delete an event from a feed
 * DELETE /api/feeds/:feedId/events/:eventUid
 */
app.delete('/api/feeds/:feedId/events/:eventUid', (req, res) => {
  const feed = feeds[req.params.feedId];
  
  if (!feed) {
    return res.status(404).json({ error: 'Feed not found' });
  }

  const eventIndex = feed.events.findIndex(e => e.uid === req.params.eventUid);
  
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  feed.events.splice(eventIndex, 1);
  feed.lastUpdated = Date.now();

  res.status(204).send();
});

/**
 * Delete a feed
 * DELETE /api/feeds/:feedId
 */
app.delete('/api/feeds/:feedId', (req, res) => {
  if (!feeds[req.params.feedId]) {
    return res.status(404).json({ error: 'Feed not found' });
  }

  delete feeds[req.params.feedId];
  res.status(204).send();
});

/**
 * Serve the ICS calendar feed
 * GET /calendars/feeds/:feedId.ics
 * Returns: text/calendar ICS format
 */
app.get('/calendars/feeds/:feedId.ics', (req, res) => {
  // Extract feedId from the filename (remove .ics extension)
  const feedId = req.params.feedId;
  const feed = feeds[feedId];
  
  if (!feed) {
    return res.status(404).send('Calendar feed not found');
  }

  // Create iCal calendar
  const cal = ical({
    name: `${feed.owner}'s Calendar`,
    description: `Calendar feed for ${feed.owner}`,
    prodId: { company: 'WebCal Service', product: 'Calendar Feed' },
    ttl: 1800 // Suggest refresh every 30 minutes
  });

  // Add all events to the calendar
  feed.events.forEach(event => {
    const calEvent = cal.createEvent({
      id: event.uid,
      start: new Date(event.start),
      end: new Date(event.end),
      summary: event.summary,
      description: event.description || '',
      location: event.location || '',
      url: event.url || undefined,
      stamp: new Date(feed.lastUpdated)
    });

    // Add alarm/reminder if specified
    if (event.reminder) {
      calEvent.createAlarm({
        type: 'display',
        trigger: event.reminder // e.g., -15 * 60 for 15 minutes before
      });
    }
  });

  // Generate ETag for caching
  const feedContent = JSON.stringify({
    events: feed.events,
    lastUpdated: feed.lastUpdated
  });
  const etag = `W/"${Buffer.from(feedContent).toString('base64').slice(0, 32)}"`;

  // Set proper headers for calendar subscription
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `inline; filename="${feedId}.ics"`);
  res.setHeader('ETag', etag);
  res.setHeader('Last-Modified', new Date(feed.lastUpdated).toUTCString());
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate'); // Force fresh fetch
  res.setHeader('X-WR-CALNAME', `${feed.owner}'s Calendar`);
  res.setHeader('X-WR-CALDESC', `Calendar feed for ${feed.owner}`);

  // Check If-None-Match header for 304 response
  const clientEtag = req.headers['if-none-match'];
  if (clientEtag === etag) {
    return res.status(304).send();
  }

  // Send the calendar content
  res.send(cal.toString());
});

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    feedCount: Object.keys(feeds).length
  });
});

/**
 * Serve the demo frontend
 * GET /
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(CONFIG.port, () => {
  console.log(`\n🗓️  Calendar Feed Service running at ${CONFIG.protocol}://${CONFIG.domain}`);
  console.log(`\n⚙️  Configuration:`);
  console.log(`   Protocol: ${CONFIG.protocol}`);
  console.log(`   Domain: ${CONFIG.domain}`);
  console.log(`   Port: ${CONFIG.port}`);
  console.log(`   Render URL: ${process.env.RENDER_EXTERNAL_URL || 'N/A'}`);
  console.log(`\n📡 API Endpoints:`);
  console.log(`   POST   /api/feeds                    - Create a new feed`);
  console.log(`   GET    /api/feeds                    - List all feeds`);
  console.log(`   GET    /api/feeds/:feedId            - Get feed info`);
  console.log(`   POST   /api/feeds/:feedId/events     - Update all events in feed`);
  console.log(`   POST   /api/feeds/:feedId/event      - Add single event`);
  console.log(`   DELETE /api/feeds/:feedId/events/:uid - Delete an event`);
  console.log(`   DELETE /api/feeds/:feedId            - Delete a feed`);
  console.log(`\n📥 Calendar Feed:`);
  console.log(`   GET    /calendars/feeds/:feedId.ics  - Get ICS calendar feed`);
  console.log(`\n🌐 Demo: ${CONFIG.protocol}://${CONFIG.domain}`);
});

