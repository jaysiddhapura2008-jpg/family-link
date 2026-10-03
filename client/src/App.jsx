import React, { useState, useEffect, useRef, useCallback } from 'react';
import BottomNavigation from './components/BottomNavigation.jsx';
import MemberBottomSheet from './components/MemberBottomSheet.jsx';
import SOSModal from './components/SOSModal.jsx';
import StartTripModal from './components/StartTripModal.jsx';
import NotificationsModal from './components/NotificationsModal.jsx';
import MultiUserSimulatorBar from './components/MultiUserSimulatorBar.jsx';
import { sounds } from './utils/audio.js';

// Screens
import ScreenSplash from './components/ScreenSplash.jsx';
import ScreenWelcome from './components/ScreenWelcome.jsx';
import ScreenAuth from './components/ScreenAuth.jsx';
import ScreenCreateOrJoinFamily from './components/ScreenCreateOrJoinFamily.jsx';
import ScreenCreateFamily from './components/ScreenCreateFamily.jsx';
import ScreenJoinFamily from './components/ScreenJoinFamily.jsx';
import ScreenInviteFamily from './components/ScreenInviteFamily.jsx';
import ScreenLocationPermission from './components/ScreenLocationPermission.jsx';
import ScreenHome from './components/ScreenHome.jsx';
import ScreenFamily from './components/ScreenFamily.jsx';
import ScreenAddMember from './components/ScreenAddMember.jsx';
import ScreenPlaces from './components/ScreenPlaces.jsx';
import ScreenAddPlace from './components/ScreenAddPlace.jsx';
import ScreenProfile from './components/ScreenProfile.jsx';
import ScreenLocationSharingSettings from './components/ScreenLocationSharingSettings.jsx';
import ScreenOnboardingPlaces from './components/ScreenOnboardingPlaces.jsx';

export const APP_NAME = 'FamilyLink';

const DEFAULT_INITIAL_USER = {
  id: 'usr_mom',
  name: 'Mom (Anita)',
  phone: '+91 98101 23456',
  email: 'mom@example.com',
  avatar: '👩',
  role: 'Admin'
};

const DEFAULT_INITIAL_FAMILY = {
  id: 'fam_sharma',
  name: 'Sharma Family',
  code: 'SHARMA-789',
  photo: '👨‍👩‍👧‍👦'
};

const DEFAULT_MEMBERS = [
  {
    id: 'usr_mom',
    name: 'Mom (Anita)',
    avatar: '👩',
    phone: '+91 98101 23456',
    role: 'Admin',
    privacy: { locationSharingEnabled: true, allowedMemberIds: ['usr_dad', 'usr_alex', 'usr_sarah'] },
    location: { latitude: 21.1945, longitude: 72.7933, battery: 88, status: 'Home', isLive: true }
  },
  {
    id: 'usr_dad',
    name: 'Dad (Rajesh)',
    avatar: '👨',
    phone: '+91 98101 23457',
    role: 'Member',
    privacy: { locationSharingEnabled: true, allowedMemberIds: ['usr_mom', 'usr_alex', 'usr_sarah'] },
    location: { latitude: 21.1180, longitude: 72.7750, battery: 64, status: 'Work', isLive: true }
  },
  {
    id: 'usr_alex',
    name: 'Alex',
    avatar: '👦',
    phone: '+91 98101 23458',
    role: 'Child',
    privacy: { locationSharingEnabled: true, allowedMemberIds: ['usr_mom', 'usr_dad'] },
    location: { latitude: 21.1620, longitude: 72.7840, battery: 72, status: 'Moving', speed: 15.5, isLive: true }
  },
  {
    id: 'usr_sarah',
    name: 'Sarah',
    avatar: '👧',
    phone: '+91 98101 23459',
    role: 'Child',
    privacy: { locationSharingEnabled: true, allowedMemberIds: [] },
    location: { latitude: 21.1460, longitude: 72.7790, battery: 55, status: 'Offline', isLive: false, isOffline: true, lastSeenText: 'Last seen 24m ago' }
  }
];

const DEFAULT_PLACES = [
  { id: 'plc_home', name: 'Home (Adajan)', category: 'Home', address: 'Anand Mahal Road, Adajan, Surat, Gujarat 395009', icon: '🏠', latitude: 21.1945, longitude: 72.7933, radius: 100 },
  { id: 'plc_school', name: 'School (Piplod)', category: 'School', address: 'Dumas Road, Piplod, Surat, Gujarat 395007', icon: '🏫', latitude: 21.1620, longitude: 72.7840, radius: 100 },
  { id: 'plc_work', name: 'Surat Diamond Bourse', category: 'Work', address: 'Khajod, DREAM City, Surat 395007', icon: '💼', latitude: 21.1180, longitude: 72.7750, radius: 100 }
];

export default function App() {
  // Navigation State
  const [activeScreen, setActiveScreen] = useState('main');
  const [mainTab, setMainTab] = useState('home'); // 'home' | 'family' | 'places' | 'me'
  const [subScreen, setSubScreen] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // User & Family State
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentFamily, setCurrentFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [privacy, setPrivacy] = useState({ locationSharingEnabled: true, shareDuration: 'always', allowedMemberIds: [] });
  const [places, setPlaces] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [sosAlerts, setSosAlerts] = useState([]);

  // Modals & Bottom Sheets
  const [selectedMember, setSelectedMember] = useState(null);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showStartTripModal, setShowStartTripModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);

  // Initial Data & Session Check
  useEffect(() => {
    initAppSession();
  }, []);

  const initAppSession = async () => {
    try {
      setIsLoadingSession(true);
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      setAllUsers(data.users || []);

      const savedUserStr = localStorage.getItem('familylink_user');
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          const meRes = await fetch(`/api/auth/me?userId=${savedUser.id}`);
          if (meRes.ok) {
            const meData = await meRes.json();
            const validUser = meData.user;
            setCurrentUser(validUser);
            localStorage.setItem('familylink_user', JSON.stringify(validUser));

            if (meData.families && meData.families.length > 0) {
              const savedFamStr = localStorage.getItem('familylink_family');
              let selectedFam = meData.families[0];
              if (savedFamStr) {
                try {
                  const parsed = JSON.parse(savedFamStr);
                  const found = meData.families.find((f) => f.id === parsed.id);
                  if (found) selectedFam = found;
                } catch {}
              }
              setCurrentFamily(selectedFam);
              localStorage.setItem('familylink_family', JSON.stringify(selectedFam));
              await refreshFamilyData(selectedFam.id, validUser.id);
              setActiveScreen('main');
            } else {
              setActiveScreen('create_or_join');
            }
            setIsLoadingSession(false);
            return;
          }
        } catch (err) {
          console.warn('Session verification failed, showing auth screen:', err);
        }
      }

      // If no valid session in localStorage, go to welcome / login screen!
      setActiveScreen('welcome');
      setIsLoadingSession(false);
    } catch (e) {
      console.error('Error initializing app session:', e);
      setActiveScreen('welcome');
      setIsLoadingSession(false);
    }
  };

  const loadUserFamily = async (userId) => {
    try {
      const res = await fetch(`/api/family/my?userId=${userId}`);
      const data = await res.json();
      if (data.families && data.families.length > 0) {
        const savedFamStr = localStorage.getItem('familylink_family');
        let selectedFam = data.families[0];
        if (savedFamStr) {
          try {
            const parsed = JSON.parse(savedFamStr);
            const found = data.families.find((f) => f.id === parsed.id);
            if (found) selectedFam = found;
          } catch {}
        }
        setCurrentFamily(selectedFam);
        localStorage.setItem('familylink_family', JSON.stringify(selectedFam));
        await refreshFamilyData(selectedFam.id, userId);
        setActiveScreen('main');
      } else {
        setActiveScreen('create_or_join');
      }
    } catch (e) {
      console.error('Error loading family:', e);
    }
  };

  const refreshFamilyData = useCallback(async (familyId, userId) => {
    if (!familyId || !userId) return;

    try {
      // 1. Members with privacy & locations
      const memRes = await fetch(`/api/family/${familyId}/members?userId=${userId}`);
      const memData = await memRes.json();
      setMembers(memData.members || []);

      // 2. Privacy
      const privRes = await fetch(`/api/privacy?userId=${userId}`);
      const privData = await privRes.json();
      setPrivacy(privData.privacy);

      // 3. Places
      const plcRes = await fetch(`/api/places/${familyId}`);
      const plcData = await plcRes.json();
      setPlaces(plcData.places || []);

      // 4. Trips
      const tripRes = await fetch(`/api/trips/${familyId}`);
      const tripData = await tripRes.json();
      setActiveTrip(tripData.trips?.[0] || null);

      // 5. Activities
      const actRes = await fetch(`/api/activity/${familyId}`);
      const actData = await actRes.json();
      setActivities(actData.activities || []);

      // 6. SOS Alerts
      const sosRes = await fetch(`/api/sos/${familyId}`);
      const sosData = await sosRes.json();
      setSosAlerts(sosData.alerts || []);

      // 7. Notifications
      const notifRes = await fetch(`/api/notifications?userId=${userId}`);
      const notifData = await notifRes.json();
      setNotifications(notifData.notifications || []);
    } catch (e) {
      console.error('Failed refreshing family data:', e);
    }
  }, []);

  // Connect WebSocket for Real-Time Sync
  useEffect(() => {
    if (!currentUser || !currentFamily) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'authenticate',
        userId: currentUser.id,
        familyId: currentFamily.id
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'location_update' || msg.type === 'privacy_update' || msg.type === 'member_joined' || msg.type === 'member_offline' || msg.type === 'member_online') {
          if (msg.autoAnnouncement) {
            sounds.playChime();
          }
          refreshFamilyData(currentFamily.id, currentUser.id);
        } else if (msg.type === 'trip_started' || msg.type === 'trip_ended') {
          if (msg.type === 'trip_started') {
            sounds.playChime();
          }
          refreshFamilyData(currentFamily.id, currentUser.id);
        } else if (msg.type === 'places_updated') {
          fetch(`/api/places/${currentFamily.id}`)
            .then((r) => r.json())
            .then((d) => setPlaces(d.places || []));
        } else if (msg.type === 'sos_alert') {
          setSosAlerts((prev) => [msg.alert, ...prev]);
          setShowSOSModal(true);
          refreshFamilyData(currentFamily.id, currentUser.id);
        } else if (msg.type === 'sos_resolved') {
          setSosAlerts((prev) => prev.filter((a) => a.id !== msg.alertId));
        }
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [currentUser?.id, currentFamily?.id, refreshFamilyData]);

  // Real Device Geolocation Watcher
  useEffect(() => {
    const isSharing = privacy?.locationSharingEnabled ?? true;

    if (isSharing && 'geolocation' in navigator && currentUser) {
      geoWatchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          // Push to backend
          sendLocationUpdate({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed || 0,
            status: pos.coords.speed && pos.coords.speed > 5 ? 'Moving' : 'Active'
          });
        },
        (err) => {
          // Non-blocking fallback for browsers without GPS permission
        },
        { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 }
      );
    } else {
      if (geoWatchRef.current) {
        navigator.geolocation.clearWatch(geoWatchRef.current);
        geoWatchRef.current = null;
      }
    }

    return () => {
      if (geoWatchRef.current) {
        navigator.geolocation.clearWatch(geoWatchRef.current);
      }
    };
  }, [privacy?.locationSharingEnabled, currentUser]);

  const sendLocationUpdate = async (coords) => {
    if (!currentUser) return;
    try {
      let batteryLevel = 85;
      if (navigator.getBattery) {
        const b = await navigator.getBattery();
        batteryLevel = Math.round(b.level * 100);
      }

      const payload = {
        userId: currentUser.id,
        familyId: currentFamily?.id,
        ...coords,
        battery: batteryLevel
      };

      if (!isOnline || isSimulatedOffline) {
        // Device is offline or app closed: cache locally!
        const existing = JSON.parse(localStorage.getItem('familylink_offline_breadcrumbs') || '[]');
        existing.push({ ...payload, timestamp: new Date().toISOString() });
        localStorage.setItem('familylink_offline_breadcrumbs', JSON.stringify(existing.slice(-50)));
        return;
      }

      await fetch('/api/location/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Network error updating location, saving offline breadcrumb:', e);
      const existing = JSON.parse(localStorage.getItem('familylink_offline_breadcrumbs') || '[]');
      existing.push({ ...coords, timestamp: new Date().toISOString() });
      localStorage.setItem('familylink_offline_breadcrumbs', JSON.stringify(existing.slice(-50)));
    }
  };

  const handleToggleSimulateOffline = async () => {
    const nextState = !isSimulatedOffline;
    setIsSimulatedOffline(nextState);

    if (nextState) {
      // Simulate app closed / offline
      await fetch('/api/location/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          familyId: currentFamily?.id,
          status: 'Offline'
        })
      });
    } else {
      // Reconnected
      flushOfflineBreadcrumbs();
      await fetch('/api/location/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          familyId: currentFamily?.id,
          status: 'Active'
        })
      });
    }
    refreshFamilyData(currentFamily.id, currentUser.id);
  };

  // Handlers
  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('familylink_user', JSON.stringify(user));
    loadUserFamily(user.id);
    setSelectedMember(null);
  };

  const handleSimulateMove = async () => {
    if (!currentUser) return;
    const currentLoc = members.find((m) => m.id === currentUser.id)?.location;
    const baseLat = currentLoc?.latitude || 28.6139;
    const baseLng = currentLoc?.longitude || 77.2090;

    let step = 0;
    const interval = setInterval(async () => {
      step++;
      const stepLat = +(baseLat + (step * 0.0006)).toFixed(5);
      const stepLng = +(baseLng + (step * 0.0004)).toFixed(5);

      await sendLocationUpdate({
        latitude: stepLat,
        longitude: stepLng,
        speed: 15.2,
        status: 'Moving'
      });

      refreshFamilyData(currentFamily.id, currentUser.id);

      if (step >= 5) {
        clearInterval(interval);
      }
    }, 350);
  };

  const handleTriggerArrivalDemo = async () => {
    if (!currentUser || places.length === 0) return;
    const targetPlace = places[0]; // e.g. Home or School

    sounds.playChime();

    await sendLocationUpdate({
      latitude: targetPlace.latitude,
      longitude: targetPlace.longitude,
      speed: 0,
      status: targetPlace.name
    });

    setTimeout(() => {
      refreshFamilyData(currentFamily.id, currentUser.id);
    }, 500);
  };

  const handleUpdatePrivacy = async (updates) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/privacy/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          familyId: currentFamily?.id,
          ...updates
        })
      });
      const data = await res.json();
      setPrivacy(data.privacy);
      refreshFamilyData(currentFamily.id, currentUser.id);
    } catch (e) {
      console.error('Error updating privacy:', e);
    }
  };

  const handleSavePlace = async (placeData) => {
    try {
      await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(placeData)
      });
      setSubScreen(null);
      refreshFamilyData(currentFamily.id, currentUser.id);
    } catch (e) {
      console.error('Error saving place:', e);
    }
  };

  const handleDeletePlace = async (placeId) => {
    try {
      await fetch(`/api/places/${placeId}?familyId=${currentFamily?.id}`, {
        method: 'DELETE'
      });
      refreshFamilyData(currentFamily.id, currentUser.id);
    } catch (e) {
      console.error('Error deleting place:', e);
    }
  };

  const handleStartTrip = async (tripData) => {
    try {
      const res = await fetch('/api/trips/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tripData,
          userId: currentUser.id,
          userName: currentUser.name,
          familyId: currentFamily.id
        })
      });
      const data = await res.json();
      setActiveTrip(data.trip);
      refreshFamilyData(currentFamily.id, currentUser.id);
    } catch (e) {
      console.error('Error starting trip:', e);
    }
  };

  const handleEndTrip = async (tripId) => {
    try {
      await fetch(`/api/trips/${tripId}/end`, { method: 'POST' });
      setActiveTrip(null);
      refreshFamilyData(currentFamily.id, currentUser.id);
    } catch (e) {
      console.error('Error ending trip:', e);
    }
  };

  const handleTriggerSOS = async (loc) => {
    try {
      const res = await fetch('/api/sos/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          familyId: currentFamily.id,
          location: loc
        })
      });
      const data = await res.json();
      setSosAlerts((prev) => [data.alert, ...prev]);
      refreshFamilyData(currentFamily.id, currentUser.id);
    } catch (e) {
      console.error('Error triggering SOS:', e);
    }
  };

  const handleResolveSOS = async () => {
    const alert = sosAlerts.find((a) => a.userId === currentUser.id);
    if (!alert) return;
    try {
      await fetch(`/api/sos/${alert.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId: currentFamily.id })
      });
      setSosAlerts((prev) => prev.filter((a) => a.id !== alert.id));
    } catch (e) {
      console.error('Error resolving SOS:', e);
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error('Error marking notifications:', e);
    }
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const isSharing = privacy?.locationSharingEnabled ?? true;

  return (
    <div className="app-container">
      {/* Dynamic Mobile Viewport */}
      <div className="mobile-device-wrapper fullscreen-mode">

        {/* Dynamic Screen Viewport */}
        <div className="app-screen">
          {/* Offline Banner Indicator */}
          {(!isOnline || isSimulatedOffline) && (
            <div className="offline-banner">
              ⚠️ Phone is offline • Location points saved locally & will sync when internet restores
            </div>
          )}

          {/* BRANDED LOADING INTERFACE */}
          {isLoadingSession && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
              color: '#ffffff',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              padding: '24px'
            }}>
              <div style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 32px rgba(79, 70, 229, 0.4)',
                marginBottom: '24px'
              }}>
                <span style={{ fontSize: '38px' }}>👨‍👩‍👧‍👦</span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>FamilyLink</h1>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', fontWeight: '500' }}>Opening your family circle...</p>
            </div>
          )}

          {/* SCREEN 1: SPLASH */}
          {!isLoadingSession && activeScreen === 'splash' && (
            <ScreenSplash
              appName={APP_NAME}
              onContinue={() => setActiveScreen('welcome')}
            />
          )}

          {/* SCREEN 2: WELCOME */}
          {!isLoadingSession && activeScreen === 'welcome' && (
            <ScreenWelcome
              onCreateAccount={() => setActiveScreen('auth_register')}
              onLogin={() => setActiveScreen('auth_login')}
            />
          )}

          {/* SCREEN 3: AUTH (REGISTER / LOGIN) */}
          {!isLoadingSession && (activeScreen === 'auth_register' || activeScreen === 'auth_login') && (
            <ScreenAuth
              isLoginMode={activeScreen === 'auth_login'}
              onBack={() => setActiveScreen('welcome')}
              onSuccess={(user, families) => {
                setCurrentUser(user);
                localStorage.setItem('familylink_user', JSON.stringify(user));
                setAllUsers((prev) => [...prev.filter((u) => u.id !== user.id), user]);
                if (families && families.length > 0) {
                  setCurrentFamily(families[0]);
                  localStorage.setItem('familylink_family', JSON.stringify(families[0]));
                  refreshFamilyData(families[0].id, user.id);
                  setActiveScreen('main');
                } else {
                  setActiveScreen('create_or_join');
                }
              }}
            />
          )}

          {/* SCREEN 4: CREATE OR JOIN FAMILY */}
          {!isLoadingSession && activeScreen === 'create_or_join' && (
            <ScreenCreateOrJoinFamily
              onCreateFamily={() => setActiveScreen('create_family')}
              onJoinFamily={() => setActiveScreen('join_family')}
            />
          )}

          {/* SCREEN 5: CREATE FAMILY */}
          {!isLoadingSession && activeScreen === 'create_family' && (
            <ScreenCreateFamily
              currentUserId={currentUser?.id}
              currentUserName={currentUser?.name}
              onBack={() => setActiveScreen('create_or_join')}
              onCreatedFamily={(family) => {
                setCurrentFamily(family);
                localStorage.setItem('familylink_family', JSON.stringify(family));
                if (currentUser) {
                  refreshFamilyData(family.id, currentUser.id);
                }
                setActiveScreen('invite_family');
              }}
              onSkip={() => setActiveScreen('permission')}
            />
          )}

          {/* SCREEN 4B: JOIN FAMILY WITH CODE */}
          {!isLoadingSession && activeScreen === 'join_family' && (
            <ScreenJoinFamily
              currentUserId={currentUser?.id}
              onBack={() => setActiveScreen('create_or_join')}
              onJoined={(family) => {
                setCurrentFamily(family);
                localStorage.setItem('familylink_family', JSON.stringify(family));
                refreshFamilyData(family.id, currentUser.id);
                setActiveScreen('main');
              }}
            />
          )}

          {/* SCREEN 6: INVITE FAMILY */}
          {!isLoadingSession && activeScreen === 'invite_family' && (
            <ScreenInviteFamily
              family={currentFamily}
              onDone={() => setActiveScreen('main')}
            />
          )}

          {/* SCREEN 7: LOCATION PERMISSION */}
          {!isLoadingSession && activeScreen === 'permission' && (
            <ScreenLocationPermission
              familyName={currentFamily?.name || 'Sharma Family'}
              onAllowed={(coords) => {
                sendLocationUpdate({ ...coords, status: 'Active' });
                setActiveScreen('main');
              }}
              onDenied={() => {
                handleUpdatePrivacy({ locationSharingEnabled: false });
                setActiveScreen('main');
              }}
            />
          )}

          {/* SCREEN 7B: ONBOARDING PLACE CATEGORIES WITH DETAILED ADDRESS */}
          {!isLoadingSession && activeScreen === 'onboarding_places' && (
            <ScreenOnboardingPlaces
              familyId={currentFamily?.id}
              currentUserId={currentUser?.id}
              onComplete={(savedPlaces) => {
                if (currentFamily && currentUser) {
                  refreshFamilyData(currentFamily.id, currentUser.id);
                }
                setActiveScreen('main');
              }}
              onSkip={() => setActiveScreen('main')}
            />
          )}

          {/* MAIN 4-TAB NAVIGATION APPLICATION */}
          {!isLoadingSession && activeScreen === 'main' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              {/* TAB 1: HOME (SCREEN 8) */}
              {mainTab === 'home' && (
                <ScreenHome
                  currentUser={currentUser}
                  currentFamily={currentFamily}
                  members={members}
                  places={places}
                  sosAlerts={sosAlerts}
                  selectedMember={selectedMember}
                  unreadCount={unreadNotifCount}
                  onOpenNotifications={() => setShowNotificationsModal(true)}
                  onOpenProfile={() => setMainTab('me')}
                  onFamilySelect={() => setActiveScreen('create_or_join')}
                  onSelectMember={(m) => setSelectedMember(m)}
                  onSelectPlace={(p) => setMainTab('places')}
                  onViewAllFamily={() => setMainTab('family')}
                  onOpenSOS={() => setShowSOSModal(true)}
                />
              )}

              {/* TAB 2: FAMILY (SCREEN 9) */}
              {mainTab === 'family' && !subScreen && (
                <ScreenFamily
                  currentFamily={currentFamily}
                  members={members}
                  onSelectMember={(m) => setSelectedMember(m)}
                  onAddMember={() => setSubScreen('add_member')}
                  onOpenSOS={() => setShowSOSModal(true)}
                />
              )}

              {/* SCREEN 10: ADD MEMBER */}
              {mainTab === 'family' && subScreen === 'add_member' && (
                <ScreenAddMember
                  currentFamily={currentFamily}
                  onBack={() => setSubScreen(null)}
                />
              )}

              {/* TAB 3: PLACES (SCREEN 11) */}
              {mainTab === 'places' && !subScreen && (
                <ScreenPlaces
                  places={places}
                  onAddPlace={() => setSubScreen('add_place')}
                  onOpenCategorySetup={() => setActiveScreen('onboarding_places')}
                  onSelectPlace={(p) => {}}
                  onDeletePlace={handleDeletePlace}
                />
              )}

              {/* SCREENS 12 & 17: ADD PLACE */}
              {mainTab === 'places' && subScreen === 'add_place' && (
                <ScreenAddPlace
                  familyId={currentFamily?.id}
                  members={members}
                  onBack={() => setSubScreen(null)}
                  onSavePlace={handleSavePlace}
                />
              )}

              {/* TAB 4: ME / PROFILE (SCREEN 13) */}
              {mainTab === 'me' && !subScreen && (
                <ScreenProfile
                  currentUser={currentUser}
                  privacy={privacy}
                  onOpenLocationSharing={() => setSubScreen('location_settings')}
                  onLogout={() => {
                    localStorage.removeItem('familylink_user');
                    localStorage.removeItem('familylink_family');
                    setActiveScreen('welcome');
                  }}
                />
              )}

              {/* SCREEN 19: LOCATION SHARING SETTINGS */}
              {mainTab === 'me' && subScreen === 'location_settings' && (
                <ScreenLocationSharingSettings
                  privacy={privacy}
                  members={members}
                  currentUserId={currentUser?.id}
                  onBack={() => setSubScreen(null)}
                  onUpdatePrivacy={handleUpdatePrivacy}
                />
              )}

              {/* 4 MAIN BOTTOM NAVIGATION TABS (Visible across main screens) */}
              <BottomNavigation
                currentTab={mainTab}
                onSelectTab={(tab) => {
                  setSubScreen(null);
                  setMainTab(tab);
                }}
              />
            </div>
          )}

          {/* SCREEN 12: MEMBER LOCATION CARD BOTTOM SHEET */}
          <MemberBottomSheet
            member={selectedMember}
            activities={activities}
            onClose={() => setSelectedMember(null)}
          />

          {/* SCREEN 23: SOS EMERGENCY MODAL */}
          <SOSModal
            isOpen={showSOSModal}
            onClose={() => setShowSOSModal(false)}
            currentUser={currentUser}
            currentFamily={currentFamily}
            activeAlert={sosAlerts.find((a) => a.userId === currentUser?.id)}
            onTriggerSOS={handleTriggerSOS}
            onResolveAlert={handleResolveSOS}
          />

          {/* SCREEN 21: START TRIP MODAL */}
          <StartTripModal
            isOpen={showStartTripModal}
            onClose={() => setShowStartTripModal(false)}
            members={members}
            places={places}
            currentUserId={currentUser?.id}
            onStartTrip={handleStartTrip}
          />

          {/* SCREEN 24: NOTIFICATIONS MODAL */}
          <NotificationsModal
            isOpen={showNotificationsModal}
            onClose={() => setShowNotificationsModal(false)}
            notifications={notifications}
            onMarkAllRead={handleMarkAllRead}
          />
        </div>
      </div>
    </div>
  );
}
