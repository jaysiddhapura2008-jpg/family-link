import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Plus, Minus, Crosshair, Layers } from 'lucide-react';

export default function MapView({
  members = [],
  places = [],
  activeTrip = null,
  sosAlerts = [],
  selectedMember = null,
  onSelectMember,
  onSelectPlace,
  userLocation = null,
  searchedLocation = null,
  currentUserId = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});
  const circlesRef = useRef([]);
  const tripPolylineRef = useRef(null);
  const searchMarkerRef = useRef(null);
  const hasAutoCenteredRef = useRef(false);

  // Map layer styles: Google Streets (default), Google Satellite/Hybrid, Google Terrain
  const [mapStyle, setMapStyle] = useState('streets'); // 'streets' | 'satellite' | 'terrain'
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const googleTileUrls = {
    streets: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    satellite: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    terrain: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
  };

  // Initialize Map with Google Maps Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    if (mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }

    // Default center: Surat, Gujarat, India
    const defaultCenter = [21.1702, 72.8311];
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // Real Google Maps Streets Tiles
    const tileLayer = L.tileLayer(googleTileUrls[mapStyle], {
      maxZoom: 21,
      subdomains: ['0', '1', '2', '3']
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

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

  // Switch Tile Layer when style changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(googleTileUrls[mapStyle], {
      maxZoom: 21,
      subdomains: ['0', '1', '2', '3']
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [mapStyle]);

  // Smoothly Fly to Member when selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedMember) return;
    const loc = selectedMember.location;
    if (loc?.latitude && loc?.longitude) {
      map.flyTo([loc.latitude, loc.longitude], 16, { animate: true, duration: 1.2 });
    }
  }, [selectedMember]);

  // Auto-center map on current user's live GPS position when first locked
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const myMember = members.find((m) => m.id === currentUserId);
    const myLoc = userLocation || myMember?.location;

    if (myLoc?.latitude && myLoc?.longitude && !hasAutoCenteredRef.current) {
      hasAutoCenteredRef.current = true;
      map.flyTo([myLoc.latitude, myLoc.longitude], 17, { animate: true, duration: 1.5 });
    }
  }, [userLocation, members, currentUserId]);

  // Update Places Geofences
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old circles
    circlesRef.current.forEach((c) => map.removeLayer(c));
    circlesRef.current = [];

    places.forEach((place) => {
      if (!place.latitude || !place.longitude) return;

      // Geofence Circle (Google style soft overlay)
      const circle = L.circle([place.latitude, place.longitude], {
        radius: place.radius || 150,
        color: '#1a73e8',
        fillColor: '#4285f4',
        fillOpacity: 0.18,
        weight: 2,
        dashArray: '5, 5'
      }).addTo(map);

      // Icon Marker for Place
      const placeIcon = L.divIcon({
        className: 'place-custom-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            background: white;
            border-radius: 50%;
            box-shadow: 0 3px 10px rgba(0,0,0,0.22);
            border: 2px solid #1a73e8;
            font-size: 17px;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            ${place.icon || '📍'}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([place.latitude, place.longitude], { icon: placeIcon }).addTo(map);
      marker.on('click', () => {
        if (onSelectPlace) onSelectPlace(place);
      });

      circlesRef.current.push(circle);
      circlesRef.current.push(marker);
    });
  }, [places, onSelectPlace]);

  // Update Member Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentMemberIds = new Set(members.map((m) => m.id));

    // Remove old markers
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentMemberIds.has(id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    members.forEach((member) => {
      const loc = member.location;
      const hasLoc = loc && loc.latitude && loc.longitude;
      const isSOS = sosAlerts.some((s) => s.userId === member.id && s.status === 'active');

      if (!hasLoc) {
        if (markersRef.current[member.id]) {
          map.removeLayer(markersRef.current[member.id]);
          delete markersRef.current[member.id];
        }
        return;
      }

      // Status indicator:
      // Green = active/sharing
      // Amber = offline (last known location)
      // Blue = moving
      // Red = SOS
      let statusClass = 'green';
      let labelSubtext = '';
      if (isSOS) {
        statusClass = 'red';
      } else if (loc.status === 'Moving' || (loc.speed && loc.speed > 5)) {
        statusClass = 'blue';
      } else if (loc.isOffline || !loc.isLive) {
        statusClass = 'amber';
        labelSubtext = ` • ${loc.lastSeenText || 'Last seen'}`;
      }

      const isSelected = selectedMember?.id === member.id;

      const customHtml = `
        <div class="family-marker" style="transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.2s;">
          <div class="marker-avatar" style="${isSelected ? 'border-color: #1a73e8; box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.4);' : ''} ${loc.isOffline ? 'opacity: 0.9;' : ''}">
            <span>${member.avatar || '👤'}</span>
            <div class="marker-status-badge ${statusClass}"></div>
          </div>
          <div class="marker-label" style="${loc.isOffline ? 'background: rgba(71, 85, 105, 0.9);' : ''}">
            ${member.name}${labelSubtext}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'member-leaflet-icon',
        html: customHtml,
        iconSize: [60, 68],
        iconAnchor: [30, 34]
      });

      if (markersRef.current[member.id]) {
        markersRef.current[member.id].setLatLng([loc.latitude, loc.longitude]);
        markersRef.current[member.id].setIcon(customIcon);
      } else {
        const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          if (onSelectMember) onSelectMember(member);
        });
        markersRef.current[member.id] = marker;
      }
    });
  }, [members, sosAlerts, selectedMember, onSelectMember]);

  // Update Active Trip Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tripPolylineRef.current) {
      map.removeLayer(tripPolylineRef.current);
      tripPolylineRef.current = null;
    }

    if (activeTrip && activeTrip.destLat && activeTrip.destLng) {
      const traveler = members.find((m) => m.id === activeTrip.userId);
      const originLat = traveler?.location?.latitude || 28.6139;
      const originLng = traveler?.location?.longitude || 77.2090;

      const path = [
        [originLat, originLng],
        [(originLat + activeTrip.destLat) / 2 + 0.004, (originLng + activeTrip.destLng) / 2],
        [activeTrip.destLat, activeTrip.destLng]
      ];

      tripPolylineRef.current = L.polyline(path, {
        color: '#1a73e8',
        weight: 5,
        opacity: 0.9
      }).addTo(map);

      // Destination flag marker
      const destIcon = L.divIcon({
        className: 'dest-marker',
        html: `
          <div style="background: #1a73e8; color: white; border-radius: 20px; padding: 5px 10px; font-size: 12px; font-weight: 700; white-space: nowrap; box-shadow: 0 3px 10px rgba(0,0,0,0.3);">
            🏁 ${activeTrip.destinationName}
          </div>
        `,
        iconSize: [80, 24],
        iconAnchor: [40, 12]
      });
      L.marker([activeTrip.destLat, activeTrip.destLng], { icon: destIcon }).addTo(map);
    }
  }, [activeTrip, members]);

  // Handle Searched Location (Live Search result)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (searchMarkerRef.current) {
      map.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }

    if (searchedLocation && (searchedLocation.latitude || searchedLocation.lat) && (searchedLocation.longitude || searchedLocation.lng)) {
      const sLat = searchedLocation.latitude || searchedLocation.lat;
      const sLng = searchedLocation.longitude || searchedLocation.lng;
      const sName = searchedLocation.name || 'Searched Location';
      const sDesc = searchedLocation.description || '';

      map.flyTo([sLat, sLng], 16, { animate: true, duration: 1.2 });

      const searchPinHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            background: #ea4335;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 12px;
            box-shadow: 0 3px 8px rgba(234, 67, 53, 0.45);
            white-space: nowrap;
            margin-bottom: 2px;
            border: 1px solid white;
          ">
            ${sName}
          </div>
          <div style="font-size: 26px; line-height: 1; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3));">
            📍
          </div>
        </div>
      `;

      const searchIcon = L.divIcon({
        className: 'searched-pin-marker',
        html: searchPinHtml,
        iconSize: [120, 60],
        iconAnchor: [60, 56]
      });

      const marker = L.marker([sLat, sLng], { icon: searchIcon }).addTo(map);
      marker.bindPopup(`
        <div style="padding: 4px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="font-size: 14px; font-weight: 700; color: #1e293b;">${sName}</div>
          ${sDesc ? `<div style="font-size: 12px; color: #64748b; margin-top: 4px;">${sDesc}</div>` : ''}
          <div style="margin-top: 6px; font-size: 11px; color: #1a73e8; font-weight: 600;">Coordinates: ${sLat.toFixed(4)}, ${sLng.toFixed(4)}</div>
        </div>
      `, { offset: [0, -30] }).openPopup();

      searchMarkerRef.current = marker;
    }
  }, [searchedLocation]);

  // Floating controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedMember && selectedMember.location?.latitude) {
      map.flyTo([selectedMember.location.latitude, selectedMember.location.longitude], 17);
      return;
    }

    // Prioritize user's own live phone GPS position!
    const myMember = members.find((m) => m.id === currentUserId);
    const myLoc = userLocation || myMember?.location;
    if (myLoc?.latitude && myLoc?.longitude) {
      map.flyTo([myLoc.latitude, myLoc.longitude], 17, { animate: true, duration: 1.2 });
      return;
    }

    const validMembers = members.filter((m) => m.location?.latitude && m.location?.longitude);
    if (validMembers.length > 0) {
      const bounds = L.latLngBounds(validMembers.map((m) => [m.location.latitude, m.location.longitude]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 });
    } else {
      map.flyTo([28.6139, 77.2090], 14);
    }
  };

  const myMember = members.find((m) => m.id === currentUserId);
  const myLoc = userLocation || myMember?.location;
  const myAccuracy = myLoc?.accuracy;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Live GPS Accuracy Signal Badge */}
      {myLoc?.latitude && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '9999px',
            padding: '6px 12px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: '700',
            color: myAccuracy && myAccuracy <= 25 ? '#15803d' : '#475569',
            zIndex: 420,
            border: '1px solid rgba(226, 232, 240, 0.9)'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: myAccuracy && myAccuracy <= 25 ? '#22c55e' : '#f59e0b',
              boxShadow: `0 0 6px ${myAccuracy && myAccuracy <= 25 ? '#22c55e' : '#f59e0b'}`
            }}
          />
          <span>{myAccuracy ? `GPS: ±${Math.round(myAccuracy)}m accuracy` : 'GPS Live'}</span>
        </div>
      )}
    </div>
  );
}
