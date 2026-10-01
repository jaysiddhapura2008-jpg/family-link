import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data.json');

// Haversine formula to compute distance in meters
export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Default initial seed data for Sharma Family so the app is instantly rich & ready to test
const DEFAULT_DATA = {
  users: [
    {
      id: 'usr_mom',
      name: 'Mom (Anita)',
      phone: '+1 555-0101',
      email: 'mom@example.com',
      avatar: '👩',
      role: 'parent',
      password: 'password123'
    },
    {
      id: 'usr_dad',
      name: 'Dad (Rajesh)',
      phone: '+1 555-0102',
      email: 'dad@example.com',
      avatar: '👨',
      role: 'parent',
      password: 'password123'
    },
    {
      id: 'usr_alex',
      name: 'Alex',
      phone: '+1 555-0103',
      email: 'alex@example.com',
      avatar: '👦',
      role: 'child',
      password: 'password123'
    },
    {
      id: 'usr_sarah',
      name: 'Sarah',
      phone: '+1 555-0104',
      email: 'sarah@example.com',
      avatar: '👧',
      role: 'child',
      password: 'password123'
    }
  ],
  families: [
    {
      id: 'fam_sharma',
      name: 'Sharma Family',
      code: 'SHARMA-789',
      photo: '👨‍👩‍👧‍👦',
      createdBy: 'usr_mom',
      createdAt: new Date().toISOString()
    }
  ],
  familyMembers: [
    { familyId: 'fam_sharma', userId: 'usr_mom', role: 'Admin' },
    { familyId: 'fam_sharma', userId: 'usr_dad', role: 'Member' },
    { familyId: 'fam_sharma', userId: 'usr_alex', role: 'Child' },
    { familyId: 'fam_sharma', userId: 'usr_sarah', role: 'Child' }
  ],
  // Base coordinates centered in India (New Delhi / NCR area)
  locations: {
    usr_mom: {
      latitude: 21.1945,
      longitude: 72.7933,
      accuracy: 10,
      battery: 88,
      status: 'Home',
      speed: 0,
      lastUpdated: new Date().toISOString()
    },
    usr_dad: {
      latitude: 21.1180,
      longitude: 72.7750,
      accuracy: 12,
      battery: 64,
      status: 'Work',
      speed: 0,
      lastUpdated: new Date(Date.now() - 3 * 60000).toISOString()
    },
    usr_alex: {
      latitude: 21.1620,
      longitude: 72.7840,
      accuracy: 8,
      battery: 72,
      status: 'Moving',
      speed: 15.5,
      lastUpdated: new Date(Date.now() - 2 * 60000).toISOString()
    },
    usr_sarah: {
      latitude: 21.1460,
      longitude: 72.7790,
      accuracy: 12,
      battery: 55,
      status: 'Offline',
      speed: 0,
      lastUpdated: new Date(Date.now() - 24 * 60000).toISOString()
    }
  },
  privacySettings: {
    usr_mom: {
      locationSharingEnabled: true,
      shareDuration: 'always',
      shareUntil: null,
      allowedMemberIds: ['usr_dad', 'usr_alex', 'usr_sarah'],
      activitySharingEnabled: true
    },
    usr_dad: {
      locationSharingEnabled: true,
      shareDuration: 'always',
      shareUntil: null,
      allowedMemberIds: ['usr_mom', 'usr_alex', 'usr_sarah'],
      activitySharingEnabled: true
    },
    usr_alex: {
      locationSharingEnabled: true,
      shareDuration: 'always',
      shareUntil: null,
      allowedMemberIds: ['usr_mom', 'usr_dad'],
      activitySharingEnabled: true
    },
    usr_sarah: {
      locationSharingEnabled: false,
      shareDuration: 'always',
      shareUntil: null,
      allowedMemberIds: [],
      activitySharingEnabled: true
    }
  },
  savedPlaces: [
    {
      id: 'plc_home',
      familyId: 'fam_sharma',
      createdBy: 'usr_mom',
      category: 'Home',
      name: 'Home (Adajan)',
      address: 'Anand Mahal Road, Adajan, Surat, Gujarat, 395009',
      icon: '🏠',
      latitude: 21.1945,
      longitude: 72.7933,
      radius: 100,
      notifications: {
        usr_alex: { onArrival: true, onDeparture: true },
        usr_dad: { onArrival: true, onDeparture: false }
      }
    },
    {
      id: 'plc_school',
      familyId: 'fam_sharma',
      createdBy: 'usr_mom',
      category: 'School',
      name: 'School (Piplod)',
      address: 'Dumas Road, Piplod, Surat, Gujarat, 395007',
      icon: '🏫',
      latitude: 21.1620,
      longitude: 72.7840,
      radius: 100,
      notifications: {
        usr_alex: { onArrival: true, onDeparture: true },
        usr_sarah: { onArrival: true, onDeparture: true }
      }
    },
    {
      id: 'plc_work',
      familyId: 'fam_sharma',
      createdBy: 'usr_dad',
      category: 'Work',
      name: 'Surat Diamond Bourse',
      address: 'Khajod, DREAM City, Surat, Gujarat, 395007',
      icon: '💼',
      latitude: 21.1180,
      longitude: 72.7750,
      radius: 100,
      notifications: {
        usr_dad: { onArrival: true, onDeparture: false }
      }
    },
    {
      id: 'plc_gym',
      familyId: 'fam_sharma',
      createdBy: 'usr_mom',
      category: 'Gym',
      name: "Gold's Gym (Athwa)",
      address: 'Ghod Dod Road, Athwa, Surat, Gujarat, 395007',
      icon: '🏋️',
      latitude: 21.1730,
      longitude: 72.8020,
      radius: 80,
      notifications: {}
    },
    {
      id: 'plc_grandma',
      familyId: 'fam_sharma',
      createdBy: 'usr_mom',
      category: 'Custom',
      name: "Vesu Residence",
      address: 'VIP Road, Vesu, Surat, Gujarat, 395007',
      icon: '❤️',
      latitude: 21.1460,
      longitude: 72.7790,
      radius: 100,
      notifications: {}
    }
  ],
  trips: [
    {
      id: 'trip_1',
      userId: 'usr_alex',
      userName: 'Alex',
      destinationName: 'Select CITYWALK Mall',
      destLat: 28.5284,
      destLng: 77.2185,
      status: 'active',
      sharedWith: ['usr_mom', 'usr_dad'],
      etaMinutes: 14,
      distanceKm: 5.6,
      startedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      expectedArrival: '8:30 PM'
    }
  ],
  activities: [
    {
      id: 'act_1',
      familyId: 'fam_sharma',
      userId: 'usr_alex',
      userName: 'Alex',
      type: 'place_arrival',
      icon: '📍',
      text: 'Alex arrived at School',
      time: '8:20 AM',
      timestamp: new Date(Date.now() - 10 * 3600000).toISOString()
    },
    {
      id: 'act_2',
      familyId: 'fam_sharma',
      userId: 'usr_alex',
      userName: 'Alex',
      type: 'place_departure',
      icon: '📍',
      text: 'Alex left School',
      time: '6:40 PM',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      id: 'act_3',
      familyId: 'fam_sharma',
      userId: 'usr_alex',
      userName: 'Alex',
      type: 'place_arrival',
      icon: '📍',
      text: 'Alex arrived Gym',
      time: '7:05 PM',
      timestamp: new Date(Date.now() - 75 * 60000).toISOString()
    },
    {
      id: 'act_4',
      familyId: 'fam_sharma',
      userId: 'usr_alex',
      userName: 'Alex',
      type: 'trip_start',
      icon: '🔵',
      text: 'Alex started trip: Going to City Mall',
      time: '8:00 PM',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif_1',
      userId: 'usr_mom',
      title: 'Place Alert',
      body: 'Alex left School.',
      time: '6:40 PM',
      read: false
    },
    {
      id: 'notif_2',
      userId: 'usr_mom',
      title: 'Place Alert',
      body: 'Alex arrived at Gym.',
      time: '7:05 PM',
      read: false
    }
  ],
  sosAlerts: []
};

class Database {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load db, initializing default:', e);
    }
    const copy = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.save(copy);
    return copy;
  }

  save(data = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save db:', e);
    }
  }

  getUser(id) {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user) {
    this.data.users.push(user);
    if (!this.data.privacySettings[user.id]) {
      this.data.privacySettings[user.id] = {
        locationSharingEnabled: false,
        shareDuration: 'always',
        shareUntil: null,
        allowedMemberIds: [],
        activitySharingEnabled: true
      };
    }
    this.save();
    return user;
  }

  getFamily(familyId) {
    return this.data.families.find(f => f.id === familyId);
  }

  getFamilyByCode(code) {
    return this.data.families.find(f => f.code.toUpperCase() === code.toUpperCase().trim());
  }

  createFamily(family, creatorUserId) {
    this.data.families.push(family);
    this.data.familyMembers.push({
      familyId: family.id,
      userId: creatorUserId,
      role: 'Admin'
    });
    this.save();
    return family;
  }

  joinFamily(familyId, userId, role = 'Member') {
    const existing = this.data.familyMembers.find(m => m.familyId === familyId && m.userId === userId);
    if (!existing) {
      this.data.familyMembers.push({ familyId, userId, role });
      // Add all current family members to each other's allowed list if privacy is default
      const famMembers = this.data.familyMembers.filter(m => m.familyId === familyId);
      for (const m of famMembers) {
        const priv = this.data.privacySettings[m.userId];
        if (priv && !priv.allowedMemberIds.includes(userId) && m.userId !== userId) {
          priv.allowedMemberIds.push(userId);
        }
      }
      const myPriv = this.data.privacySettings[userId];
      if (myPriv) {
        myPriv.allowedMemberIds = famMembers.map(m => m.userId).filter(id => id !== userId);
      }
      this.save();
    }
  }

  getUserFamilies(userId) {
    const memberships = this.data.familyMembers.filter(m => m.userId === userId);
    return memberships.map(m => {
      const fam = this.getFamily(m.familyId);
      return { ...fam, myRole: m.role };
    }).filter(Boolean);
  }

  getFamilyMembers(familyId, requestingUserId) {
    // CIRCLE-ONLY VISIBILITY ENFORCEMENT:
    // Ensure the requesting user is a legitimate member of this active circle
    if (requestingUserId) {
      const isMemberOfCircle = this.data.familyMembers.some(
        m => m.familyId === familyId && m.userId === requestingUserId
      );
      if (!isMemberOfCircle) {
        return []; // Strict circle isolation: non-circle users never receive coordinates or members
      }
    }

    const members = this.data.familyMembers.filter(m => m.familyId === familyId);
    return members.map(m => {
      const user = this.getUser(m.userId);
      if (!user) return null;

      const privacy = this.data.privacySettings[user.id] || {
        locationSharingEnabled: false,
        allowedMemberIds: []
      };

      // Check if location sharing is expired
      let isSharingActive = privacy.locationSharingEnabled;
      if (isSharingActive && privacy.shareUntil && new Date(privacy.shareUntil).getTime() < Date.now()) {
        isSharingActive = false;
      }

      // Check if requesting user is authorized to see location
      const isSelf = user.id === requestingUserId;
      const isAllowed = isSelf || (privacy.allowedMemberIds && privacy.allowedMemberIds.includes(requestingUserId));
      const canSeeLocation = isSharingActive && isAllowed;

      const rawLoc = this.data.locations[user.id] || {};
      const hasCoords = rawLoc.latitude !== null && rawLoc.latitude !== undefined;

      let locInfo = null;
      if (canSeeLocation && hasCoords) {
        // Calculate if device is live or offline based on last heartbeat/update
        const now = Date.now();
        const lastUpdatedMs = rawLoc.lastUpdated ? new Date(rawLoc.lastUpdated).getTime() : 0;
        const diffMinutes = Math.round((now - lastUpdatedMs) / 60000);
        const isRecent = diffMinutes <= 4 && rawLoc.status !== 'Offline';

        locInfo = {
          latitude: rawLoc.latitude,
          longitude: rawLoc.longitude,
          accuracy: rawLoc.accuracy || 10,
          battery: rawLoc.battery,
          status: isRecent ? (rawLoc.status || 'Active') : 'Offline',
          speed: isRecent ? (rawLoc.speed || 0) : 0,
          lastUpdated: rawLoc.lastUpdated,
          isLive: isRecent,
          isOffline: !isRecent,
          lastSeenText: isRecent
            ? (rawLoc.status || 'Active')
            : (diffMinutes < 60 ? `Last seen ${diffMinutes}m ago` : `Last seen ${Math.round(diffMinutes / 60)}h ago`)
        };
      } else {
        locInfo = {
          latitude: null,
          longitude: null,
          battery: rawLoc.battery || null,
          status: isSharingActive ? 'Location unavailable' : 'Sharing turned off',
          lastUpdated: rawLoc.lastUpdated || null,
          isLive: false,
          isOffline: true,
          lastSeenText: isSharingActive ? 'Location unavailable' : 'Sharing paused'
        };
      }

      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
        email: user.email,
        role: m.role,
        privacy: {
          locationSharingEnabled: privacy.locationSharingEnabled,
          allowedMemberIds: privacy.allowedMemberIds || []
        },
        location: locInfo
      };
    }).filter(Boolean);
  }

  updateLocation(userId, { latitude, longitude, accuracy, battery, speed, status }) {
    const prev = this.data.locations[userId] || {};
    const updated = {
      latitude,
      longitude,
      accuracy: accuracy || prev.accuracy || 10,
      battery: battery !== undefined ? battery : (prev.battery || 85),
      speed: speed || 0,
      status: status || (speed > 5 ? 'Moving' : 'Stationary'),
      lastUpdated: new Date().toISOString()
    };
    this.data.locations[userId] = updated;

    // Check geofences with saved places
    this.checkGeofences(userId, updated);

    this.save();
    return updated;
  }

  updatePrivacy(userId, updates) {
    const current = this.data.privacySettings[userId] || {
      locationSharingEnabled: true,
      shareDuration: 'always',
      shareUntil: null,
      allowedMemberIds: [],
      activitySharingEnabled: true
    };
    this.data.privacySettings[userId] = { ...current, ...updates };
    this.save();
    return this.data.privacySettings[userId];
  }

  getPrivacy(userId) {
    return this.data.privacySettings[userId] || {
      locationSharingEnabled: true,
      shareDuration: 'always',
      shareUntil: null,
      allowedMemberIds: [],
      activitySharingEnabled: true
    };
  }

  checkGeofences(userId, loc) {
    if (!loc.latitude || !loc.longitude) return;
    const user = this.getUser(userId);
    if (!user) return;

    // Find families user belongs to
    const famIds = this.data.familyMembers.filter(m => m.userId === userId).map(m => m.familyId);

    for (const place of this.data.savedPlaces) {
      if (!famIds.includes(place.familyId)) continue;
      const dist = getDistanceMeters(loc.latitude, loc.longitude, place.latitude, place.longitude);
      const isInside = dist <= (place.radius || 150);

      // Check previous state
      if (!place._memberPresence) place._memberPresence = {};
      const wasInside = place._memberPresence[userId] || false;

      if (!wasInside && isInside) {
        // Just arrived!
        place._memberPresence[userId] = true;
        this.createActivityAndNotifications(place.familyId, userId, user.name, 'arrival', place);
      } else if (wasInside && !isInside) {
        // Just left!
        place._memberPresence[userId] = false;
        this.createActivityAndNotifications(place.familyId, userId, user.name, 'departure', place);
      }
    }
  }

  createActivityAndNotifications(familyId, userId, userName, type, place) {
    const text = type === 'arrival'
      ? `${userName} arrived at ${place.name}`
      : `${userName} left ${place.name}`;

    const act = {
      id: 'act_' + Date.now() + Math.random().toString(36).substring(2, 5),
      familyId,
      userId,
      userName,
      type: type === 'arrival' ? 'place_arrival' : 'place_departure',
      icon: place.icon || '📍',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString()
    };
    this.data.activities.unshift(act);

    // Notify configured family members
    const notifyRule = place.notifications?.[userId];
    const shouldNotify = notifyRule && (type === 'arrival' ? notifyRule.onArrival : notifyRule.onDeparture);

    if (shouldNotify) {
      const familyMembers = this.data.familyMembers.filter(m => m.familyId === familyId && m.userId !== userId);
      for (const m of familyMembers) {
        this.data.notifications.unshift({
          id: 'notif_' + Date.now() + Math.random().toString(36).substring(2, 5),
          userId: m.userId,
          title: 'Place Alert',
          body: text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
        });
      }
    }
  }

  getPlaces(familyId) {
    return this.data.savedPlaces.filter(p => p.familyId === familyId);
  }

  addPlace(place) {
    place.id = 'plc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    this.data.savedPlaces.push(place);
    this.save();
    return place;
  }

  deletePlace(placeId) {
    this.data.savedPlaces = this.data.savedPlaces.filter(p => p.id !== placeId);
    this.save();
  }

  matchPlaceCategory(familyId, destLat, destLng, destName = '') {
    const places = this.getPlaces(familyId);
    if (!places || places.length === 0) return null;

    // 1. Proximity matching (within 1000m of a saved category place)
    if (destLat && destLng) {
      let closest = null;
      let minDistance = Infinity;
      for (const p of places) {
        if (!p.latitude || !p.longitude) continue;
        const d = getDistanceMeters(destLat, destLng, p.latitude, p.longitude);
        if (d < minDistance) {
          minDistance = d;
          closest = { place: p, distanceMeters: d };
        }
      }
      if (closest && closest.distanceMeters <= 1000) {
        return closest.place;
      }
    }

    // 2. Name or category keyword match
    if (destName) {
      const q = destName.toLowerCase().trim();
      const matched = places.find(p => {
        const pName = (p.name || '').toLowerCase();
        const pCat = (p.category || '').toLowerCase();
        const pAddr = (p.address || '').toLowerCase();
        return (
          (pName && (q.includes(pName) || pName.includes(q))) ||
          (pCat && (q.includes(pCat) || pCat.includes(q))) ||
          (pAddr && (q.includes(pAddr) || pAddr.includes(q)))
        );
      });
      if (matched) return matched;
    }

    return null;
  }

  startTrip(tripData) {
    // Automatic Category & Detailed Address Matching
    const matchedPlace = this.matchPlaceCategory(
      tripData.familyId,
      tripData.destLat,
      tripData.destLng,
      tripData.destinationName
    );

    const category = matchedPlace?.category || tripData.category || 'Custom';
    const placeName = matchedPlace?.name || tripData.destinationName || 'Destination';
    const detailedAddress = matchedPlace?.address || tripData.detailedAddress || tripData.destinationAddress || '';

    // Automatic destination announcement formatting: "Heading to [Place/Category] — [Detailed Address]"
    let destinationLabel = placeName;
    if (category && category !== 'Custom' && !placeName.toLowerCase().includes(category.toLowerCase())) {
      destinationLabel = `${category} (${placeName})`;
    }
    const announcement = detailedAddress
      ? `Heading to ${destinationLabel} — ${detailedAddress}`
      : `Heading to ${destinationLabel}`;

    const trip = {
      id: 'trip_' + Date.now(),
      status: 'active',
      startedAt: new Date().toISOString(),
      category,
      destinationName: placeName,
      detailedAddress,
      announcement,
      ...tripData
    };
    this.data.trips.unshift(trip);

    // Create activity
    const user = this.getUser(trip.userId);
    this.data.activities.unshift({
      id: 'act_' + Date.now(),
      familyId: trip.familyId,
      userId: trip.userId,
      userName: user ? user.name : 'Family Member',
      type: 'trip_start',
      icon: '🚗',
      text: `${user ? user.name : 'Family Member'}: ${announcement}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString()
    });

    // Notify shared members
    if (trip.sharedWith) {
      for (const uid of trip.sharedWith) {
        this.data.notifications.unshift({
          id: 'notif_' + Date.now() + Math.random().toString(36).substring(2, 5),
          userId: uid,
          title: 'Trip Announcement',
          body: `${user ? user.name : 'Someone'} is ${announcement}. ETA: ${trip.etaMinutes || 12} min.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
        });
      }
    }

    this.save();
    return trip;
  }

  endTrip(tripId) {
    const trip = this.data.trips.find(t => t.id === tripId);
    if (trip) {
      trip.status = 'completed';
      trip.endedAt = new Date().toISOString();
      const user = this.getUser(trip.userId);
      this.data.activities.unshift({
        id: 'act_' + Date.now(),
        familyId: trip.familyId,
        userId: trip.userId,
        userName: user ? user.name : 'Family Member',
        type: 'trip_end',
        icon: '🏁',
        text: `${user ? user.name : 'Alex'} arrived at ${trip.destinationName}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString()
      });
      this.save();
    }
    return trip;
  }

  triggerSOS(userId, familyId, loc) {
    const user = this.getUser(userId);
    const alert = {
      id: 'sos_' + Date.now(),
      userId,
      familyId,
      userName: user ? user.name : 'Family Member',
      avatar: user ? user.avatar : '🚨',
      phone: user ? user.phone : '',
      latitude: loc?.latitude || 40.7720,
      longitude: loc?.longitude || -73.9780,
      battery: loc?.battery || 72,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    this.data.sosAlerts.unshift(alert);

    // Notify all other family members
    const members = this.data.familyMembers.filter(m => m.familyId === familyId && m.userId !== userId);
    for (const m of members) {
      this.data.notifications.unshift({
        id: 'notif_sos_' + Date.now() + Math.random().toString(36).substring(2, 5),
        userId: m.userId,
        title: '🚨 EMERGENCY ALERT',
        body: `Emergency alert from ${user ? user.name : 'Family Member'}!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        isEmergency: true
      });
    }

    this.data.activities.unshift({
      id: 'act_sos_' + Date.now(),
      familyId,
      userId,
      userName: user ? user.name : 'Alex',
      type: 'sos',
      icon: '🚨',
      text: `EMERGENCY ALERT triggered by ${user ? user.name : 'Alex'}!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString()
    });

    this.save();
    return alert;
  }

  resolveSOS(alertId) {
    const alert = this.data.sosAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      this.save();
    }
    return alert;
  }

  getActivities(familyId) {
    return this.data.activities.filter(a => !familyId || a.familyId === familyId).slice(0, 30);
  }

  getNotifications(userId) {
    return this.data.notifications.filter(n => n.userId === userId).slice(0, 20);
  }

  markNotificationsRead(userId) {
    for (const n of this.data.notifications) {
      if (n.userId === userId) n.read = true;
    }
    this.save();
  }
}

export const db = new Database();
