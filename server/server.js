import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, '../client/dist');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}


// Track connected clients: Map of socket -> { userId, familyId }
const clients = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'authenticate') {
        clients.set(ws, { userId: data.userId, familyId: data.familyId });
        ws.send(JSON.stringify({ type: 'authenticated', success: true }));
      } else if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (e) {
      console.error('WS message error:', e);
    }
  });

  ws.on('close', () => {
    const info = clients.get(ws);
    if (info) {
      clients.delete(ws);
      const user = db.getUser(info.userId);
      if (user && info.familyId) {
        // Mark user status as offline in location record
        const loc = db.data.locations[info.userId];
        if (loc) {
          loc.status = 'Offline';
          loc.lastUpdated = new Date().toISOString();
          db.save();
        }

        // Broadcast offline status to family
        broadcastToFamily(info.familyId, {
          type: 'member_offline',
          userId: info.userId,
          lastSeen: new Date().toISOString()
        });
      }
    }
  });
});

function broadcastToFamily(familyId, message) {
  for (const [ws, info] of clients.entries()) {
    if (ws.readyState === WebSocket.OPEN && info.familyId === familyId) {
      // CIRCLE-ONLY ISOLATION:
      // Verify recipient socket is an authenticated member of this circle
      const isMember = db.data.familyMembers.some(
        m => m.familyId === familyId && m.userId === info.userId
      );
      if (!isMember) continue;

      // Restrict live location coordinates based on consensual privacy
      if (message.type === 'location_update' && message.userId) {
        const privacy = db.getPrivacy(message.userId);
        const isSelf = message.userId === info.userId;
        const isAllowed = isSelf || (
          privacy.locationSharingEnabled &&
          privacy.allowedMemberIds &&
          privacy.allowedMemberIds.includes(info.userId)
        );

        if (!isAllowed) {
          // Send redacted record without raw coordinates
          ws.send(JSON.stringify({
            type: 'location_update',
            userId: message.userId,
            location: {
              latitude: null,
              longitude: null,
              battery: message.location?.battery || null,
              status: 'Sharing turned off',
              isLive: false,
              isOffline: true,
              lastSeenText: 'Sharing paused'
            }
          }));
          continue;
        }
      }

      ws.send(JSON.stringify(message));
    }
  }
}

// Simple authentication token / session check
// For simple, trustworthy testing without friction, we allow user authentication via userId or email
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, role } = req.body;

  // Search if an account already exists for this email, phone, or name
  let user = (email ? db.getUserByEmail(email) : null) ||
             (phone ? db.getUserByQuery(phone) : null) ||
             (name ? db.getUserByQuery(name) : null);

  if (user) {
    // Restore existing user account! Update phone/name if provided
    if (phone && !user.phone) user.phone = phone;
    if (name && !user.name) user.name = name;
    db.save();

    const families = db.getUserFamilies(user.id);
    return res.json({ user, families });
  }

  if (!name && !email && !phone) {
    return res.status(400).json({ error: 'Name, email or phone is required' });
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    name: name || (email ? email.split('@')[0] : 'User'),
    email: email || `${Date.now()}@familylink.app`,
    phone: phone || '',
    password: password || 'password',
    avatar: role === 'child' ? '👦' : '👤',
    role: role || 'parent',
    createdAt: new Date().toISOString()
  };

  db.createUser(newUser);
  const families = db.getUserFamilies(newUser.id);
  res.json({ user: newUser, families });
});

app.post('/api/auth/login', (req, res) => {
  const { email, phone, name, password, query } = req.body;
  const searchTerm = email || phone || name || query;
  if (!searchTerm) {
    return res.status(400).json({ error: 'Please enter your email, phone, or name' });
  }

  const user = db.getUserByQuery(searchTerm) || db.getUserByEmail(searchTerm);
  if (!user) {
    return res.status(404).json({ error: 'No account found. Please sign up.' });
  }

  if (password && user.password && user.password !== 'password' && user.password !== password) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const families = db.getUserFamilies(user.id);
  res.json({ user, families });
});

app.get('/api/auth/me', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const user = db.getUser(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const families = db.getUserFamilies(userId);
  res.json({ user, families });
});

app.get('/api/auth/users', (req, res) => {
  // Useful for the demo / simulator user switch bar
  const users = db.data.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatar: u.avatar,
    role: u.role
  }));
  res.json({ users });
});

// Families
app.post('/api/family/create', (req, res) => {
  const { name, photo, userId } = req.body;
  if (!name || !userId) {
    return res.status(400).json({ error: 'Family name and userId are required' });
  }

  const randomCode = name.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
  const family = {
    id: 'fam_' + Date.now(),
    name,
    code: randomCode,
    photo: photo || '👨‍👩‍👧‍👦',
    createdBy: userId,
    createdAt: new Date().toISOString()
  };

  db.createFamily(family, userId);
  broadcastToFamily(family.id, { type: 'family_updated' });
  res.json({ family });
});

app.post('/api/family/join', (req, res) => {
  const { code, userId } = req.body;
  if (!code || !userId) {
    return res.status(400).json({ error: 'Invite code and userId are required' });
  }

  const family = db.getFamilyByCode(code);
  if (!family) {
    return res.status(404).json({ error: 'Invalid family code. Please check the code and try again.' });
  }

  db.joinFamily(family.id, userId);

  const user = db.getUser(userId);
  db.data.activities.unshift({
    id: 'act_' + Date.now(),
    familyId: family.id,
    userId,
    userName: user ? user.name : 'New Member',
    type: 'member_joined',
    icon: '👋',
    text: `${user ? user.name : 'Someone'} joined ${family.name}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: new Date().toISOString()
  });

  broadcastToFamily(family.id, { type: 'member_joined', userId, familyId: family.id });
  res.json({ family });
});

app.get('/api/family/my', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const families = db.getUserFamilies(userId);
  res.json({ families });
});

app.get('/api/family/:familyId/members', (req, res) => {
  const { familyId } = req.params;
  const userId = req.headers['x-user-id'] || req.query.userId;
  const members = db.getFamilyMembers(familyId, userId);
  res.json({ members });
});

// Location Updates
app.post('/api/location/update', (req, res) => {
  const { userId, familyId, latitude, longitude, accuracy, battery, speed, status } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const loc = db.updateLocation(userId, { latitude, longitude, accuracy, battery, speed, status });

  // Automatic destination matching when moving
  let autoAnnouncement = null;
  if ((status === 'Moving' || (speed && speed > 5)) && latitude && longitude && familyId) {
    const matchedPlace = db.matchPlaceCategory(familyId, latitude, longitude);
    if (matchedPlace) {
      const activeTrip = db.data.trips.find(t => t.userId === userId && t.status === 'active');
      if (!activeTrip) {
        const category = matchedPlace.category || 'Place';
        const detailedAddress = matchedPlace.address || '';
        const announcement = detailedAddress
          ? `Heading to ${matchedPlace.name} (${category}) — ${detailedAddress}`
          : `Heading to ${matchedPlace.name} (${category})`;

        autoAnnouncement = {
          userId,
          category,
          placeName: matchedPlace.name,
          detailedAddress,
          announcement
        };
      }
    }
  }

  if (familyId) {
    broadcastToFamily(familyId, {
      type: 'location_update',
      userId,
      location: loc,
      autoAnnouncement
    });
  }

  res.json({ success: true, location: loc, autoAnnouncement });
});

app.post('/api/location/batch', (req, res) => {
  const { userId, familyId, breadcrumbs } = req.body;
  if (!userId || !Array.isArray(breadcrumbs) || breadcrumbs.length === 0) {
    return res.status(400).json({ error: 'Missing userId or breadcrumbs' });
  }

  // Update with the latest point
  const latest = breadcrumbs[breadcrumbs.length - 1];
  const loc = db.updateLocation(userId, {
    latitude: latest.latitude,
    longitude: latest.longitude,
    accuracy: latest.accuracy,
    battery: latest.battery,
    speed: latest.speed,
    status: 'Active'
  });

  if (familyId) {
    broadcastToFamily(familyId, {
      type: 'location_update',
      userId,
      location: loc,
      syncedCount: breadcrumbs.length
    });
  }

  res.json({ success: true, count: breadcrumbs.length, location: loc });
});

// Reverse Geocoding for Exact Street Addresses in Surat, Gujarat & India
app.get('/api/geocode/reverse', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing lat or lng' });
  }

  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const parts = [
        data.locality || data.city,
        data.principalSubdivision || 'Gujarat',
        data.countryName || 'India'
      ].filter(Boolean);

      const detailedParts = [];
      if (data.localityInfo?.informative) {
        for (const item of data.localityInfo.informative.slice(0, 2)) {
          if (item.name && !parts.includes(item.name)) detailedParts.push(item.name);
        }
      }

      const formatted = [...detailedParts, ...parts].join(', ');
      return res.json({
        address: formatted || `Surat, Gujarat (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})`,
        locality: data.locality || 'Surat',
        city: data.city || 'Surat',
        state: data.principalSubdivision || 'Gujarat',
        country: data.countryName || 'India'
      });
    }
  } catch (err) {
    console.error('Reverse geocode error:', err);
  }

  // Graceful fallback for Surat area
  res.json({
    address: `Surat, Gujarat (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})`,
    locality: 'Surat',
    city: 'Surat',
    state: 'Gujarat',
    country: 'India'
  });
});

// Real-Time Global & India Address Geocoding (Biased to Surat, Gujarat)
app.get('/api/geocode/search', async (req, res) => {
  const query = req.query.q;
  if (!query || query.trim().length < 2) {
    return res.json({ results: [] });
  }

  try {
    // Query Photon Geocoder biased to Surat, Gujarat (lon=72.8311, lat=21.1702)
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}&lon=72.8311&lat=21.1702&limit=8`;
    const response = await fetch(url, { headers: { 'User-Agent': 'FamilyLink-SafetyApp/1.0' } });
    if (!response.ok) throw new Error('Geocoding service unavailable');
    
    const data = await response.json();
    const results = (data.features || []).map((f, idx) => {
      const p = f.properties || {};
      const coords = f.geometry?.coordinates || [0, 0];
      const descParts = [p.district, p.city, p.state, p.country].filter(Boolean);
      return {
        id: `geo_${idx}_${Date.now()}`,
        name: p.name || query,
        description: descParts.join(', ') || 'Surat, Gujarat, India',
        latitude: coords[1],
        longitude: coords[0]
      };
    });

    const suratLocalities = [
      { name: 'Trikamnagar-2 (Varachha)', description: 'Trikamnagar, Varachha, Surat, Gujarat, 395006', latitude: 21.2140, longitude: 72.8580 },
      { name: 'Trikamnagar-1 (Varachha)', description: 'Trikamnagar, Varachha, Surat, Gujarat, 395006', latitude: 21.2135, longitude: 72.8575 },
      { name: 'Varachha (Mini Bazar)', description: 'Mini Bazar, Varachha, Surat, Gujarat, 395006', latitude: 21.2130, longitude: 72.8572 },
      { name: 'Yogi Chowk (Varachha)', description: 'Yogi Chowk, Varachha, Surat, Gujarat, 395010', latitude: 21.2260, longitude: 72.8840 },
      { name: 'Sarthana (Jakatnaka)', description: 'Varachha Road, Surat, Gujarat, 395006', latitude: 21.2330, longitude: 72.8980 },
      { name: 'Hirabaug (Varachha)', description: 'Hirabaug, Varachha, Surat, Gujarat, 395006', latitude: 21.2160, longitude: 72.8580 },
      { name: 'Mota Varachha', description: 'Mota Varachha, Surat, Gujarat, 394101', latitude: 21.2450, longitude: 72.8750 },
      { name: 'Nana Varachha', description: 'Nana Varachha, Surat, Gujarat, 395006', latitude: 21.2250, longitude: 72.8650 },
      { name: 'L.H. Road (Varachha)', description: 'L.H. Road, Varachha, Surat, Gujarat, 395006', latitude: 21.2090, longitude: 72.8520 },
      { name: 'Adajan (Anand Mahal Road)', description: 'Anand Mahal Road, Adajan, Surat, Gujarat, 395009', latitude: 21.1945, longitude: 72.7933 },
      { name: 'Pal (Gaurav Path)', description: 'Pal Gam, Adajan, Surat, Gujarat, 395009', latitude: 21.1980, longitude: 72.7810 },
      { name: 'Vesu (VIP Road)', description: 'VIP Road, Vesu, Surat, Gujarat, 395007', latitude: 21.1460, longitude: 72.7790 },
      { name: 'Ghod Dod Road (Athwa)', description: 'Athwa, Surat, Gujarat, 395007', latitude: 21.1730, longitude: 72.8020 },
      { name: 'Piplod (Dumas Road)', description: 'Dumas Road, Piplod, Surat, Gujarat, 395007', latitude: 21.1620, longitude: 72.7840 },
      { name: 'Surat Diamond Bourse', description: 'Khajod, DREAM City, Surat, Gujarat, 395007', latitude: 21.1180, longitude: 72.7750 },
      { name: 'Katargam (Gotalawadi)', description: 'Katargam, Surat, Gujarat, 395004', latitude: 21.2290, longitude: 72.8280 },
      { name: 'Surat Railway Station', description: 'Central Surat, Gujarat, 395003', latitude: 21.2050, longitude: 72.8410 }
    ];

    const matchedSurat = suratLocalities.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );

    // Merge matched Surat places with API results
    const combined = [...matchedSurat.map((m, idx) => ({ ...m, id: `surat_${idx}_${Date.now()}` })), ...results];
    const unique = [];
    const seen = new Set();
    for (const item of combined) {
      const key = `${item.latitude?.toFixed(3)}_${item.longitude?.toFixed(3)}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    res.json({ results: unique.slice(0, 8) });
  } catch (err) {
    console.error('Geocode search error:', err);
    // Fallback: Surat, Gujarat key localities
    const suratPlaces = [
      { name: 'Trikamnagar-2 (Varachha)', description: 'Trikamnagar, Varachha, Surat, Gujarat, 395006', latitude: 21.2140, longitude: 72.8580 },
      { name: 'Adajan (Anand Mahal Road)', description: 'Adajan, Surat, Gujarat, India', latitude: 21.1945, longitude: 72.7933 },
      { name: 'Vesu (VIP Road)', description: 'Vesu, Surat, Gujarat, India', latitude: 21.1460, longitude: 72.7790 },
      { name: 'Ghod Dod Road (Athwa)', description: 'Athwa, Surat, Gujarat, India', latitude: 21.1730, longitude: 72.8020 },
      { name: 'Piplod (Dumas Road)', description: 'Piplod, Surat, Gujarat, India', latitude: 21.1620, longitude: 72.7840 },
      { name: 'Surat Diamond Bourse', description: 'Khajod, Surat, Gujarat, India', latitude: 21.1180, longitude: 72.7750 },
      { name: 'Varachha (Mini Bazar)', description: 'Varachha, Surat, Gujarat, India', latitude: 21.2180, longitude: 72.8550 },
      { name: 'Katargam (Gotalawadi)', description: 'Katargam, Surat, Gujarat, India', latitude: 21.2290, longitude: 72.8280 },
      { name: 'Surat Railway Station', description: 'Central Surat, Gujarat, India', latitude: 21.2050, longitude: 72.8410 }
    ].filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()));

    res.json({ results: suratPlaces });
  }
});

// Privacy Settings
app.get('/api/privacy', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const privacy = db.getPrivacy(userId);
  res.json({ privacy });
});

app.post('/api/privacy/update', (req, res) => {
  const { userId, familyId, ...updates } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const updated = db.updatePrivacy(userId, updates);

  if (familyId) {
    broadcastToFamily(familyId, {
      type: 'privacy_update',
      userId,
      privacy: updated
    });
  }

  res.json({ success: true, privacy: updated });
});

// Saved Places
app.get('/api/places/:familyId', (req, res) => {
  const { familyId } = req.params;
  const places = db.getPlaces(familyId);
  res.json({ places });
});

app.post('/api/places', (req, res) => {
  const place = req.body;
  const saved = db.addPlace(place);
  broadcastToFamily(place.familyId, { type: 'places_updated' });
  res.json({ place: saved });
});

app.post('/api/places/batch', (req, res) => {
  let { familyId, createdBy, places } = req.body;
  if (!Array.isArray(places) || places.length === 0) {
    return res.status(400).json({ error: 'Missing places array' });
  }

  // Fallback to active circle or default if familyId was not explicitly set
  if (!familyId) {
    const userFamilies = createdBy ? db.getUserFamilies(createdBy) : [];
    familyId = userFamilies[0]?.id || 'fam_sharma';
  }

  const savedList = [];
  for (const p of places) {
    if (p.name && (p.latitude || p.address)) {
      const s = db.addPlace({
        familyId,
        createdBy: createdBy || 'usr_mom',
        category: p.category || 'Custom',
        name: p.name,
        address: p.address || '',
        icon: p.icon || '📍',
        latitude: p.latitude || 21.1702,
        longitude: p.longitude || 72.8311,
        radius: p.radius || 100,
        notifications: p.notifications || {}
      });
      savedList.push(s);
    }
  }

  broadcastToFamily(familyId, { type: 'places_updated' });
  res.json({ success: true, count: savedList.length, places: savedList });
});

app.delete('/api/places/:id', (req, res) => {
  const { id } = req.params;
  const familyId = req.query.familyId;
  db.deletePlace(id);
  if (familyId) {
    broadcastToFamily(familyId, { type: 'places_updated' });
  }
  res.json({ success: true });
});

// Trips
app.get('/api/trips/:familyId', (req, res) => {
  const { familyId } = req.params;
  const trips = db.data.trips.filter(t => t.familyId === familyId && t.status === 'active');
  res.json({ trips });
});

app.post('/api/trips/start', (req, res) => {
  const trip = db.startTrip(req.body);
  broadcastToFamily(req.body.familyId, { type: 'trip_started', trip });
  res.json({ trip });
});

app.post('/api/trips/:id/end', (req, res) => {
  const { id } = req.params;
  const trip = db.endTrip(id);
  if (trip) {
    broadcastToFamily(trip.familyId, { type: 'trip_ended', trip });
  }
  res.json({ trip });
});

// Activities
app.get('/api/activity/:familyId', (req, res) => {
  const { familyId } = req.params;
  const activities = db.getActivities(familyId);
  res.json({ activities });
});

// SOS Alerts
app.post('/api/sos/trigger', (req, res) => {
  const { userId, familyId, location } = req.body;
  const alert = db.triggerSOS(userId, familyId, location);
  broadcastToFamily(familyId, { type: 'sos_alert', alert });
  res.json({ alert });
});

app.post('/api/sos/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { familyId } = req.body;
  const alert = db.resolveSOS(id);
  if (familyId) {
    broadcastToFamily(familyId, { type: 'sos_resolved', alertId: id });
  }
  res.json({ alert });
});

app.get('/api/sos/:familyId', (req, res) => {
  const { familyId } = req.params;
  const alerts = db.data.sosAlerts.filter(a => a.familyId === familyId && a.status === 'active');
  res.json({ alerts });
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });
  const notifications = db.getNotifications(userId);
  res.json({ notifications });
});

app.post('/api/notifications/read', (req, res) => {
  const { userId } = req.body;
  db.markNotificationsRead(userId);
  res.json({ success: true });
});

app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('FamilyLink Server Running. Please build client or run Vite dev server.');
  }
});

server.listen(PORT, () => {
  console.log(`FamilyLink Server running on http://localhost:${PORT}`);
});

