import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { X, Check, Crosshair, Layers, Search, MapPin, Navigation, Loader2 } from 'lucide-react';

export default function GoogleMapPickerModal({
  isOpen,
  categoryName = 'Place',
  categoryIcon = '📍',
  initialLat = 21.1702,
  initialLng = 72.8311,
  initialAddress = '',
  onConfirm,
  onClose
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const [mapStyle, setMapStyle] = useState('satellite'); // default to satellite for maximum accuracy
  const [currentLat, setCurrentLat] = useState(initialLat || 21.1702);
  const [currentLng, setCurrentLng] = useState(initialLng || 72.8311);
  const [currentAddress, setCurrentAddress] = useState(initialAddress || 'Surat, Gujarat, India');
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const googleTileUrls = {
    satellite: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', // Google Hybrid Satellite with street names
    streets: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'   // Google Street map
  };

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      const lat = initialLat || 21.1702;
      const lng = initialLng || 72.8311;
      setCurrentLat(lat);
      setCurrentLng(lng);
      setCurrentAddress(initialAddress || 'Surat, Gujarat, India');
    }
  }, [isOpen, initialLat, initialLng, initialAddress]);

  // Initialize Leaflet with Google Maps
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (mapContainerRef.current._leaflet_id) {
      delete mapContainerRef.current._leaflet_id;
    }

    const startLat = initialLat || 21.1702;
    const startLng = initialLng || 72.8311;

    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: 17,
      zoomControl: false,
      attributionControl: false
    });

    const tileLayer = L.tileLayer(googleTileUrls[mapStyle], {
      maxZoom: 21,
      subdomains: ['0', '1', '2', '3']
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Invalidate size once rendered
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    // Update coordinates as user pans the map
    const handleMove = () => {
      const center = map.getCenter();
      setCurrentLat(center.lat);
      setCurrentLng(center.lng);

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(async () => {
        setIsReverseGeocoding(true);
        try {
          const res = await fetch(`/api/geocode/reverse?lat=${center.lat}&lng=${center.lng}`);
          const data = await res.json();
          if (data?.address) {
            setCurrentAddress(data.address);
          }
        } catch {
        } finally {
          setIsReverseGeocoding(false);
        }
      }, 500);
    };

    map.on('move', handleMove);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      map.off('move', handleMove);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isOpen]);

  // Switch Google Maps Layer (Satellite vs Streets)
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

  // Center on Live Phone GPS Location
  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation not supported on this browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 19, { animate: true, duration: 1.2 });
        }
      },
      (err) => {
        setIsLocating(false);
        alert('Could not acquire GPS fix. Please ensure Location is enabled on your phone.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Search inside map picker
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (item) => {
    const lat = item.latitude;
    const lng = item.longitude;
    if (mapInstanceRef.current && lat && lng) {
      mapInstanceRef.current.flyTo([lat, lng], 18, { animate: true, duration: 1.2 });
      setCurrentAddress(item.description ? `${item.name}, ${item.description}` : item.name);
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const handleConfirm = () => {
    onConfirm({
      latitude: Number(currentLat.toFixed(6)),
      longitude: Number(currentLng.toFixed(6)),
      address: currentAddress
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          height: '92vh',
          background: '#ffffff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.3)'
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>{categoryIcon}</span>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Pinpoint {categoryName} on Google Map
              </h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                Drag map to place crosshair on your exact building in Surat
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search bar inside map */}
        <div style={{ position: 'relative', padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', zIndex: 10 }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Surat building, road, colony..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: '600',
                  outline: 'none',
                  background: '#ffffff'
                }}
              />
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '10px', top: '11px' }} />
            </div>
            <button
              type="submit"
              disabled={searching}
              style={{
                padding: '0 14px',
                borderRadius: '12px',
                border: 'none',
                background: '#4f46e5',
                color: 'white',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {searching ? '...' : 'Search'}
            </button>
          </form>

          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '16px',
                right: '16px',
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                zIndex: 100,
                maxHeight: '180px',
                overflowY: 'auto'
              }}
            >
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSearchResult(item)}
                  style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{item.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

          {/* Center Crosshair Target Pin */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              zIndex: 800,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
            }}
          >
            <div
              style={{
                background: '#ffffff',
                color: '#4f46e5',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '800',
                marginBottom: '4px',
                border: '1.5px solid #4f46e5',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap'
              }}
            >
              {categoryIcon} {categoryName}
            </div>

            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#4f46e5',
                border: '3px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <Crosshair size={20} strokeWidth={2.5} />
            </div>

            {/* Target stem pointing to exact center */}
            <div style={{ width: '2px', height: '12px', background: '#4f46e5' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
          </div>

          {/* Google Satellite / Streets Layer Switcher */}
          <div style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 850 }}>
            <button
              type="button"
              onClick={() => setMapStyle(mapStyle === 'satellite' ? 'streets' : 'satellite')}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(6px)',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                cursor: 'pointer'
              }}
            >
              <Layers size={14} color="#4f46e5" />
              <span>{mapStyle === 'satellite' ? 'Google Satellite' : 'Google Streets'}</span>
            </button>
          </div>

          {/* Locate Me Floating Button */}
          <div style={{ position: 'absolute', bottom: '16px', right: '14px', zIndex: 850 }}>
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              title="Fly to My Live GPS"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
                cursor: 'pointer'
              }}
            >
              {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Navigation size={20} />}
            </button>
          </div>
        </div>

        {/* Bottom Details & Confirmation Bar */}
        <div
          style={{
            padding: '16px 20px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <MapPin size={20} color="#4f46e5" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', lineHeight: 1.3 }}>
                {isReverseGeocoding ? 'Detecting street in Surat...' : currentAddress}
              </div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#16a34a', marginTop: '2px' }}>
                📍 GPS Coordinates: {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#64748b',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Check size={16} strokeWidth={3} />
              <span>Confirm This Exact Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
