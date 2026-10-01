import React, { useState } from 'react';
import { MapPin, Check, Plus, Trash2, ArrowRight, Sparkles, Navigation, Loader2, Map as MapIcon } from 'lucide-react';
import GoogleMapPickerModal from './GoogleMapPickerModal.jsx';

export default function ScreenOnboardingPlaces({
  familyId,
  currentUserId,
  onComplete,
  onSkip
}) {
  // Pre-configured Places Data tailored specifically for Surat, Gujarat, India with compact 80-100m radius
  const SURAT_CATEGORY_TEMPLATES = [
    {
      category: 'Home',
      icon: '🏠',
      name: 'Home (Adajan)',
      defaultAddress: 'Anand Mahal Road, Adajan, Surat, Gujarat 395009',
      defaultLat: 21.1945,
      defaultLng: 72.7933,
      radius: 100,
      description: 'Your home residence for arrival & departure alerts',
      selected: true
    },
    {
      category: 'Work',
      icon: '💼',
      name: 'Work / Diamond Bourse',
      defaultAddress: 'Surat Diamond Bourse, Khajod, DREAM City, Surat 395007',
      defaultLat: 21.1180,
      defaultLng: 72.7750,
      radius: 100,
      description: 'Office, Textile Market, or Diamond Bourse',
      selected: true
    },
    {
      category: 'School',
      icon: '🏫',
      name: 'School / College (Piplod)',
      defaultAddress: 'Dumas Road, Piplod, Surat, Gujarat 395007',
      defaultLat: 21.1620,
      defaultLng: 72.7840,
      radius: 100,
      description: 'School, college or coaching academy',
      selected: false
    },
    {
      category: 'Gym',
      icon: '🏋️',
      name: "Gold's Gym (Athwa)",
      defaultAddress: 'Ghod Dod Road, Athwa, Surat, Gujarat 395007',
      defaultLat: 21.1730,
      defaultLng: 72.8020,
      radius: 80,
      description: 'Gym, fitness center, or sports club',
      selected: false
    },
    {
      category: 'Custom',
      icon: '❤️',
      name: 'Vesu Residence',
      defaultAddress: 'VIP Road, Vesu, Surat, Gujarat 395007',
      defaultLat: 21.1460,
      defaultLng: 72.7790,
      radius: 100,
      description: 'Frequent relative or friend destination',
      selected: false
    }
  ];

  const SURAT_QUICK_AREAS = [
    { label: 'Trikamnagar', address: 'Trikamnagar-2, Varachha, Surat, Gujarat 395006', lat: 21.2140, lng: 72.8580 },
    { label: 'Varachha', address: 'Mini Bazar, Varachha, Surat, Gujarat 395006', lat: 21.2180, lng: 72.8550 },
    { label: 'Yogi Chowk', address: 'Yogi Chowk, Varachha, Surat, Gujarat 395010', lat: 21.2260, lng: 72.8840 },
    { label: 'Adajan', address: 'Anand Mahal Road, Adajan, Surat, Gujarat 395009', lat: 21.1945, lng: 72.7933 },
    { label: 'Vesu', address: 'VIP Road, Vesu, Surat, Gujarat 395007', lat: 21.1460, lng: 72.7790 },
    { label: 'Ghod Dod Rd', address: 'Ghod Dod Road, Athwa, Surat, Gujarat 395007', lat: 21.1730, lng: 72.8020 },
    { label: 'Katargam', address: 'Gotalawadi, Katargam, Surat, Gujarat 395004', lat: 21.2290, lng: 72.8280 }
  ];

  const [places, setPlaces] = useState(SURAT_CATEGORY_TEMPLATES);
  const [activeSearchCat, setActiveSearchCat] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locatingCat, setLocatingCat] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [pickerPlace, setPickerPlace] = useState(null);

  const toggleCategory = (catName) => {
    setPlaces((prev) =>
      prev.map((p) =>
        p.category === catName ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const updatePlaceField = (catName, field, value) => {
    setPlaces((prev) =>
      prev.map((p) =>
        p.category === catName ? { ...p, [field]: value } : p
      )
    );
  };

  const handleAddressSearch = async (val, catName) => {
    updatePlaceField(catName, 'defaultAddress', val);
    setActiveSearchCat(catName);

    if (!val || val.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result, catName) => {
    const fullAddr = result.description ? `${result.name}, ${result.description}` : result.name;
    updatePlaceField(catName, 'defaultAddress', fullAddr);
    updatePlaceField(catName, 'defaultLat', result.latitude);
    updatePlaceField(catName, 'defaultLng', result.longitude);
    setSearchResults([]);
    setActiveSearchCat(null);
  };

  const handleQuickPickArea = (area, catName) => {
    updatePlaceField(catName, 'defaultAddress', area.address);
    updatePlaceField(catName, 'defaultLat', area.lat);
    updatePlaceField(catName, 'defaultLng', area.lng);
  };

  // High-Accuracy GPS Locator with Reverse-Geocoding for Surat & Gujarat
  const handleUseCurrentLocation = (catName) => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your device browser.');
      return;
    }

    setLocatingCat(catName);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        updatePlaceField(catName, 'defaultLat', lat);
        updatePlaceField(catName, 'defaultLng', lng);

        try {
          const revRes = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
          const revData = await revRes.json();
          if (revData?.address) {
            updatePlaceField(catName, 'defaultAddress', revData.address);
          } else {
            updatePlaceField(catName, 'defaultAddress', `Surat (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          }
        } catch {
          updatePlaceField(catName, 'defaultAddress', `Surat (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        } finally {
          setLocatingCat(null);
        }
      },
      (err) => {
        console.warn('GPS location error:', err);
        setLocatingCat(null);
        alert('GPS signal timed out. You can tap "Pick on Google Map" to pinpoint your exact location.');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const handleConfirmMapPicker = ({ latitude, longitude, address }) => {
    if (!pickerPlace) return;
    updatePlaceField(pickerPlace.category, 'defaultLat', latitude);
    updatePlaceField(pickerPlace.category, 'defaultLng', longitude);
    if (address) {
      updatePlaceField(pickerPlace.category, 'defaultAddress', address);
    }
    setPickerPlace(null);
  };

  const handleSaveAndContinue = async () => {
    setSubmitting(true);

    let effectiveFamId = familyId;
    if (!effectiveFamId) {
      try {
        const stored = JSON.parse(localStorage.getItem('familylink_family') || '{}');
        effectiveFamId = stored.id;
      } catch {}
    }
    if (!effectiveFamId) effectiveFamId = 'fam_sharma';

    let effectiveUserId = currentUserId;
    if (!effectiveUserId) {
      try {
        const stored = JSON.parse(localStorage.getItem('familylink_user') || '{}');
        effectiveUserId = stored.id;
      } catch {}
    }
    if (!effectiveUserId) effectiveUserId = 'usr_mom';

    const selectedPlaces = places
      .filter((p) => p.selected)
      .map((p) => ({
        category: p.category,
        name: p.name,
        address: p.defaultAddress,
        icon: p.icon,
        latitude: p.defaultLat || 21.1702,
        longitude: p.defaultLng || 72.8311,
        radius: p.radius || 100
      }));

    try {
      if (selectedPlaces.length > 0) {
        // Save to backend database
        await fetch('/api/places/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            familyId: effectiveFamId,
            createdBy: effectiveUserId,
            places: selectedPlaces
          })
        });

        // Also persist locally in browser
        localStorage.setItem('familylink_places', JSON.stringify(selectedPlaces));
      }
      setSavedSuccess(true);
      setTimeout(() => {
        setSubmitting(false);
        onComplete(selectedPlaces);
      }, 500);
    } catch (e) {
      console.error('Error saving onboarding places:', e);
      localStorage.setItem('familylink_places', JSON.stringify(selectedPlaces));
      setSubmitting(false);
      onComplete(selectedPlaces);
    }
  };

  const selectedCount = places.filter((p) => p.selected).length;

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#f8fafc',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Scrollable Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 110px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '20px',
              background: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              margin: '0 auto 12px auto',
              boxShadow: '0 8px 18px rgba(79, 70, 229, 0.15)'
            }}
          >
            📍
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            Set Frequent Places
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.4, maxWidth: '320px', margin: '0 auto' }}>
            Tailored for <strong>Surat, Gujarat</strong>. Use Google Satellite Maps to pinpoint exact building locations.
          </p>
        </div>

        {/* Categories Selection Chips */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
            1. Select Place Categories ({selectedCount} selected)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {places.map((p) => {
              const isSelected = p.selected;
              return (
                <button
                  key={p.category}
                  type="button"
                  onClick={() => toggleCategory(p.category)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '9999px',
                    border: isSelected ? '1.5px solid #4f46e5' : '1px solid #cbd5e1',
                    background: isSelected ? '#eef2ff' : '#ffffff',
                    color: isSelected ? '#4338ca' : '#475569',
                    fontSize: '13px',
                    fontWeight: isSelected ? '700' : '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{p.icon}</span>
                  <span>{p.category}</span>
                  {isSelected && <Check size={14} color="#4f46e5" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Address Inputs for Selected Places */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
            2. Verified Surat Street Addresses ({selectedCount} active)
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {places
              .filter((p) => p.selected)
              .map((p) => (
                <div
                  key={p.category}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '16px',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{p.icon}</span>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                          {p.name}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1', background: '#eef2ff', padding: '2px 6px', borderRadius: '6px' }}>
                          {p.category} • Radius: {p.radius || 100}m
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: Pick on Google Map & Live GPS */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setPickerPlace(p)}
                        title="Pinpoint on Google Satellite Map"
                        style={{
                          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '7px 12px',
                          fontSize: '11px',
                          fontWeight: '800',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
                        }}
                      >
                        <MapIcon size={13} />
                        <span>Google Map</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUseCurrentLocation(p.category)}
                        disabled={locatingCat === p.category}
                        title="Use Current GPS in Surat"
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '7px 10px',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {locatingCat === p.category ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            <span>GPS...</span>
                          </>
                        ) : (
                          <>
                            <Navigation size={12} color="#4f46e5" />
                            <span>GPS</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Place Name Edit */}
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      Label Name
                    </label>
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => updatePlaceField(p.category, 'name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: '600',
                        outline: 'none',
                        background: '#f8fafc'
                      }}
                    />
                  </div>

                  {/* Detailed Street Address Input */}
                  <div style={{ position: 'relative' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                      Street Address & Area in Surat
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={p.defaultAddress}
                        onChange={(e) => handleAddressSearch(e.target.value, p.category)}
                        placeholder="Search Surat locality, street, or landmark..."
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 34px',
                          borderRadius: '12px',
                          border: '1.5px solid #cbd5e1',
                          fontSize: '13px',
                          fontWeight: '600',
                          outline: 'none',
                          background: '#ffffff',
                          color: '#1e293b'
                        }}
                      />
                      <MapPin size={16} color="#4f46e5" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                    </div>

                    {/* Quick Pick Surat Localities */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', alignSelf: 'center', marginRight: '4px' }}>
                        Quick Pick:
                      </span>
                      {SURAT_QUICK_AREAS.map((area) => (
                        <button
                          key={area.label}
                          type="button"
                          onClick={() => handleQuickPickArea(area, p.category)}
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '10px',
                            fontWeight: '600',
                            color: '#475569',
                            cursor: 'pointer'
                          }}
                        >
                          {area.label}
                        </button>
                      ))}
                    </div>

                    {/* Coordinates Verification Badge */}
                    {p.defaultLat && p.defaultLng && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>
                          <Check size={13} strokeWidth={3} />
                          <span>Exact Coordinates: {p.defaultLat.toFixed(5)}, {p.defaultLng.toFixed(5)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPickerPlace(p)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#4f46e5',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          Adjust on Google Map
                        </button>
                      </div>
                    )}

                    {/* Autocomplete Dropdown if active */}
                    {activeSearchCat === p.category && searchResults.length > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 50,
                          background: '#ffffff',
                          borderRadius: '14px',
                          border: '1px solid #cbd5e1',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                          marginTop: '4px',
                          maxHeight: '180px',
                          overflowY: 'auto'
                        }}
                      >
                        {searchResults.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelectSearchResult(item, p.category)}
                            style={{
                              padding: '10px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f1f5f9',
                              fontSize: '12px'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{item.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(10px)',
          padding: '14px 20px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '12px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
          zIndex: 40
        }}
      >
        <button
          type="button"
          onClick={onSkip}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          Skip
        </button>

        <button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={submitting}
          style={{
            flex: 2,
            padding: '14px',
            borderRadius: '16px',
            border: 'none',
            background: savedSuccess ? '#16a34a' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
            cursor: submitting ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving Surat Places...</span>
            </>
          ) : savedSuccess ? (
            <>
              <Check size={16} strokeWidth={3} />
              <span>Places Saved!</span>
            </>
          ) : (
            <>
              <span>Save {selectedCount} Places & Continue</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      {/* Google Map Pinpoint Picker Modal */}
      {pickerPlace && (
        <GoogleMapPickerModal
          isOpen={Boolean(pickerPlace)}
          categoryName={pickerPlace.name}
          categoryIcon={pickerPlace.icon}
          initialLat={pickerPlace.defaultLat}
          initialLng={pickerPlace.defaultLng}
          initialAddress={pickerPlace.defaultAddress}
          onConfirm={handleConfirmMapPicker}
          onClose={() => setPickerPlace(null)}
        />
      )}
    </div>
  );
}
