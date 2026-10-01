import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, MapPin, Check } from 'lucide-react';
import L from 'leaflet';

export default function ScreenAddPlace({
  familyId,
  members = [],
  onBack,
  onSavePlace
}) {
  const [placeName, setPlaceName] = useState('');
  const [icon, setIcon] = useState('🏠');
  const [radius, setRadius] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [lat, setLat] = useState(21.1702);
  const [lng, setLng] = useState(72.8311);
  const [isLocating, setIsLocating] = useState(false);
  const [notifications, setNotifications] = useState({
    // Initialize notifications for members
  });

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleRef = useRef(null);
  const markerRef = useRef(null);

  const iconOptions = ['🏠', '🏫', '💼', '❤️', '⚽', '🛒', '☕', '🏥'];

  // Automatically center on real device GPS if available
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          setLat(userLat);
          setLng(userLng);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([userLat, userLng], 15);
            markerRef.current?.setLatLng([userLat, userLng]);
            circleRef.current?.setLatLng([userLat, userLng]);
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  // Initialize mini map for preview & choosing on map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    if (mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 21,
      subdomains: ['0', '1', '2', '3']
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-pin',
      html: `<div style="font-size: 28px; transform: translate(-10px, -24px); cursor: grab; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">📍</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });

    const marker = L.marker([lat, lng], { draggable: true, icon: pinIcon }).addTo(map);
    const circle = L.circle([lat, lng], {
      radius: radius,
      color: '#4f46e5',
      fillColor: '#818cf8',
      fillOpacity: 0.2
    }).addTo(map);

    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setLat(position.lat);
      setLng(position.lng);
      circle.setLatLng(position);
    });

    map.on('click', (e) => {
      setLat(e.latlng.lat);
      setLng(e.latlng.lng);
      marker.setLatLng(e.latlng);
      circle.setLatLng(e.latlng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
    circleRef.current = circle;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        delete mapContainerRef.current._leaflet_id;
      }
    };
  }, []);

  // Update circle radius on change
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radius);
    }
  }, [radius]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const first = data.results[0];
        const newLat = first.latitude || first.lat;
        const newLng = first.longitude || first.lng;
        setLat(newLat);
        setLng(newLng);
        if (!placeName) {
          setPlaceName(first.name);
        }
        mapInstanceRef.current?.flyTo([newLat, newLng], 15);
        markerRef.current?.setLatLng([newLat, newLng]);
        circleRef.current?.setLatLng([newLat, newLng]);
      }
    } catch (err) {
      console.error('AddPlace geocode search error:', err);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setLat(userLat);
        setLng(userLng);
        mapInstanceRef.current?.flyTo([userLat, userLng], 16);
        markerRef.current?.setLatLng([userLat, userLng]);
        circleRef.current?.setLatLng([userLat, userLng]);
        setIsLocating(false);

        try {
          const revRes = await fetch(`/api/geocode/reverse?lat=${userLat}&lng=${userLng}`);
          const revData = await revRes.json();
          if (revData?.address && !placeName) {
            setPlaceName(revData.locality || revData.address.split(',')[0]);
          }
        } catch {}
      },
      (err) => {
        setIsLocating(false);
        alert('GPS timed out. You can tap on the map to place your pin in Surat.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const toggleNotification = (memberId, type) => {
    setNotifications((prev) => {
      const current = prev[memberId] || { onArrival: false, onDeparture: false };
      return {
        ...prev,
        [memberId]: {
          ...current,
          [type]: !current[type]
        }
      };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!placeName.trim()) return;

    onSavePlace({
      familyId,
      name: placeName,
      icon,
      latitude: lat,
      longitude: lng,
      radius: Number(radius),
      notifications
    });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff', overflowY: 'auto' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#475569' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Add a place</h2>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Map Preview at top */}
        <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.85)',
              color: 'white',
              fontSize: '11px',
              fontWeight: '600',
              padding: '4px 10px',
              borderRadius: '20px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            Tap or drag to place pin
          </div>
        </div>

        {/* Search Field */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search location (e.g. City Mall)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '38px', paddingRight: '12px' }}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '15px' }} />
          </div>
          <button type="submit" className="btn-secondary" style={{ width: 'auto', padding: '0 16px', fontSize: '13px' }}>
            Search
          </button>
        </form>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Place Name */}
          <div>
            <label className="input-label">Place name</label>
            <input
              type="text"
              required
              placeholder="e.g. School or Gym"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Place Icon */}
          <div>
            <label className="input-label">Place icon</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {iconOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setIcon(opt)}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    border: icon === opt ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                    background: icon === opt ? '#eef2ff' : '#f8fafc',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Radius Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="input-label" style={{ margin: 0 }}>Geofence radius</label>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#4f46e5' }}>{radius} m</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="25"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              style={{ width: '100%', accentColor: '#4f46e5' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              <span>50 m</span>
              <span>150 m (Standard)</span>
              <span>500 m</span>
            </div>
          </div>

          {/* Screen 17: Place Arrival Feature */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
              Arrival & Departure Notifications
            </h4>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
              Receive instant alerts when family members enter or leave this place.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {members.map((member) => {
                const notif = notifications[member.id] || { onArrival: false, onDeparture: false };
                return (
                  <div
                    key={member.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{member.avatar || '👤'}</span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{member.name}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={notif.onArrival}
                          onChange={() => toggleNotification(member.id, 'onArrival')}
                          style={{ accentColor: '#4f46e5' }}
                        />
                        <span>Arrives at {placeName || 'Place'}</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={notif.onDeparture}
                          onChange={() => toggleNotification(member.id, 'onDeparture')}
                          style={{ accentColor: '#4f46e5' }}
                        />
                        <span>Leaves {placeName || 'Place'}</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
            Save Place
          </button>
        </form>
      </div>
    </div>
  );
}
