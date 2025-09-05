// scripts/api-server.js
// Simple Express API to read/write Event Planner data in SQL Server
// How to run (PowerShell):
//   cd D:\Github\EventPlanner
//   node .\scripts\api-server.js
// The server will listen on http://localhost:3001

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sql from 'mssql';

// Build SQL config from .env
function getSqlConfig() {
  return {
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    options: {
      encrypt: process.env.SQL_ENCRYPT === 'true',
      trustServerCertificate: process.env.SQL_TRUST_CERT === 'true',
      instanceName: process.env.SQL_INSTANCE,
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  };
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

let poolPromise;
async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(getSqlConfig());
  }
  return poolPromise;
}

// Root route for friendly message
app.get('/', (req, res) => {
  res.send('Event Planner API is running!');
});

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Get venue configuration by venue code
app.get('/api/config/:venueCode', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('VenueCode', sql.NVarChar(20), req.params.venueCode)
      .execute('dbo.sp_GetVenueConfiguration');

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error getting config:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get events for a date range
app.get('/api/events', async (req, res) => {
  try {
    const { venueId, start, end } = req.query;
    if (!venueId || !start || !end) {
      return res.status(400).json({ message: 'venueId, start, and end are required' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('VenueId', sql.UniqueIdentifier, String(venueId))
      .input('StartDate', sql.DateTime2, new Date(String(start)))
      .input('EndDate', sql.DateTime2, new Date(String(end)))
      .execute('dbo.sp_GetEventsForDateRange');

    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error getting events:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create or update an event
app.post('/api/events', async (req, res) => {
  try {
    const {
      eventId, // optional for update
      venueId,
      title,
      description,
      startDate,
      endDate,
      locationId, // optional
      locationText, // optional
      categoryCode,
      priorityCode,
      isAllDay = 0,
      createdBy = 'WebApp',
      attendees = [], // array of names
    } = req.body || {};

    if (!venueId || !title || !startDate || !endDate || !categoryCode || !priorityCode) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('EventId', sql.UniqueIdentifier, eventId || null)
      .input('VenueId', sql.UniqueIdentifier, venueId)
      .input('Title', sql.NVarChar(200), title)
      .input('Description', sql.NVarChar(sql.MAX), description || null)
      .input('StartDate', sql.DateTime2, new Date(startDate))
      .input('EndDate', sql.DateTime2, new Date(endDate))
      .input('LocationId', sql.UniqueIdentifier, locationId || null)
      .input('LocationText', sql.NVarChar(200), locationText || null)
      .input('CategoryCode', sql.NVarChar(50), categoryCode)
      .input('PriorityCode', sql.NVarChar(50), priorityCode)
      .input('IsAllDay', sql.Bit, isAllDay ? 1 : 0)
      .input('CreatedBy', sql.NVarChar(100), createdBy)
      .input('Attendees', sql.NVarChar(sql.MAX), JSON.stringify(attendees || []))
      .execute('dbo.sp_SaveEvent');

    const newId = result.recordset?.[0]?.EventId;
    res.json({ eventId: newId });
  } catch (err) {
    console.error('Error saving event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete an event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const { venueId } = req.query;
    if (!venueId) return res.status(400).json({ message: 'venueId is required' });

    const pool = await getPool();
    await pool
      .request()
      .input('EventId', sql.UniqueIdentifier, String(req.params.id))
      .input('VenueId', sql.UniqueIdentifier, String(venueId))
      .execute('dbo.sp_DeleteEvent');

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get categories for a venue
app.get('/api/categories', async (req, res) => {
  try {
    const { venueId } = req.query;
    if (!venueId) return res.status(400).json({ message: 'venueId is required' });

    const pool = await getPool();
    const result = await pool
      .request()
      .input('VenueId', sql.UniqueIdentifier, String(venueId))
      .execute('dbo.sp_GetVenueCategories');

    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error getting categories:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get priorities for a venue
app.get('/api/priorities', async (req, res) => {
  try {
    const { venueId } = req.query;
    if (!venueId) return res.status(400).json({ message: 'venueId is required' });

    const pool = await getPool();
    const result = await pool
      .request()
      .input('VenueId', sql.UniqueIdentifier, String(venueId))
      .execute('dbo.sp_GetVenuePriorities');

    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error getting priorities:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get locations for a venue
app.get('/api/locations', async (req, res) => {
  try {
    const { venueId } = req.query;
    if (!venueId) return res.status(400).json({ message: 'venueId is required' });

    const pool = await getPool();
    const result = await pool
      .request()
      .input('VenueId', sql.UniqueIdentifier, String(venueId))
      .execute('dbo.sp_GetVenueLocations');

    res.json(result.recordset || []);
  } catch (err) {
    console.error('Error getting locations:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update venue configuration
app.put('/api/config', async (req, res) => {
  try {
    const body = req.body || {};
    const {
      venueId,
      companyName,
      logo,
      tagline,
      primaryColor,
      secondaryColor,
      timeFormat,
      dateFormat,
      firstDayOfWeek,
      defaultEventDuration,
      defaultCategory,
      defaultPriority,
      showAttendees,
      showLocation,
      showDescription,
      allowRecurring,
      allowFileAttachments,
    } = body;

    if (!venueId || !companyName || !primaryColor || !secondaryColor) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const pool = await getPool();
    await pool
      .request()
      .input('VenueId', sql.UniqueIdentifier, venueId)
      .input('CompanyName', sql.NVarChar(100), companyName)
      .input('Logo', sql.NVarChar(500), logo ?? null)
      .input('Tagline', sql.NVarChar(200), tagline ?? null)
      .input('PrimaryColor', sql.NVarChar(7), primaryColor)
      .input('SecondaryColor', sql.NVarChar(7), secondaryColor)
      .input('TimeFormat', sql.NVarChar(3), timeFormat ?? '12h')
      .input('DateFormat', sql.NVarChar(10), dateFormat ?? 'MM/DD/YYYY')
      .input('FirstDayOfWeek', sql.TinyInt, firstDayOfWeek ?? 0)
      .input('DefaultEventDuration', sql.Decimal(4, 2), defaultEventDuration ?? 1.0)
      .input('DefaultCategory', sql.NVarChar(50), defaultCategory ?? 'meeting')
      .input('DefaultPriority', sql.NVarChar(50), defaultPriority ?? 'normal')
      .input('ShowAttendees', sql.Bit, showAttendees ? 1 : 0)
      .input('ShowLocation', sql.Bit, showLocation ? 1 : 0)
      .input('ShowDescription', sql.Bit, showDescription ? 1 : 0)
      .input('AllowRecurring', sql.Bit, allowRecurring ? 1 : 0)
      .input('AllowFileAttachments', sql.Bit, allowFileAttachments ? 1 : 0)
      .execute('dbo.sp_UpdateVenueConfiguration');

    res.json({ message: 'Configuration updated successfully' });
  } catch (err) {
    console.error('Error updating config:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
