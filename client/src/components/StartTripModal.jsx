import React, { useState } from 'react';
import { Navigation, X, Check, MapPin } from 'lucide-react';

export default function StartTripModal({
  isOpen,
  onClose,
  members = [],
  places = [],
  currentUserId,
  onStartTrip
}) {
  const [destination, setDestination] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState(
    members.filter((m) => m.id !== currentUserId).map((m) => m.id)
  );

  if (!isOpen) return null;

  // Use configured Place Categories if available, otherwise fallback
  const availableDestinations = places.length > 0 ? places.map(p => ({
    name: p.name,
    category: p.category || 'Place',
    address: p.address || '',
    icon: p.icon || '📍',
    lat: p.latitude || 28.6139,
    lng: p.longitude || 77.2090,
    dist: '3.5 km',
    eta: 10
  })) : [
    { name: 'Home', category: 'Home', address: 'B-14 Connaught Place, New Delhi', icon: '🏠', lat: 28.6139, lng: 77.2090, dist: '2.5 km', eta: 8 },
    { name: 'Office', category: 'Work', address: 'Statesman House, Barakhamba Road', icon: '💼', lat: 28.6318, lng: 77.2194, dist: '3.8 km', eta: 11 },
    { name: 'School', category: 'School', address: 'DPS Sector 12, R.K. Puram', icon: '🏫', lat: 28.5710, lng: 77.1820, dist: '4.2 km', eta: 12 },
    { name: "Gold's Gym", category: 'Gym', address: 'Outer Circle, Connaught Place', icon: '🏋️', lat: 28.6340, lng: 77.2180, dist: '1.8 km', eta: 6 }
  ];

  const handleToggleMember = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((mId) => mId !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const handleStart = (customDest = null) => {
    const dest = customDest || selectedPlace || availableDestinations.find((d) => d.name === destination) || {
      name: destination || 'Destination',
      category: 'Custom',
      address: '',
      lat: 28.6139,
      lng: 77.2090,
      dist: '4.0 km',
      eta: 12
    };

    onStartTrip({
      destinationName: dest.name,
      category: dest.category,
      detailedAddress: dest.address,
      destLat: dest.lat,
      destLng: dest.lng,
      distanceKm: parseFloat(dest.dist) || 4.0,
      etaMinutes: dest.eta || 12,
      sharedWith: selectedMembers
    });
    onClose();
  };

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Where are you going?</h3>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label className="input-label">Enter destination</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="e.g. City Mall"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '40px' }}
            />
            <MapPin size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
          </div>
        </div>

        {/* Configured Categories List */}
        <div style={{ marginBottom: '16px' }}>
          <label className="input-label" style={{ marginBottom: '8px' }}>Select from Saved Place Categories</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '170px', overflowY: 'auto' }}>
            {availableDestinations.map((d) => {
              const isSelected = selectedPlace?.name === d.name || destination === d.name;
              return (
                <div
                  key={d.name}
                  onClick={() => {
                    setSelectedPlace(d);
                    setDestination(d.name);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: isSelected ? '1.5px solid #4f46e5' : '1px solid #e2e8f0',
                    background: isSelected ? '#eef2ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{d.icon}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{d.name}</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', background: '#e0e7ff', color: '#4338ca', padding: '1px 5px', borderRadius: '4px' }}>{d.category}</span>
                      </div>
                      {d.address && (
                        <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '210px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.address}
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5' }}>~{d.eta}m</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Automatic Destination Announcement Preview */}
        {(selectedPlace || destination) && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '10px 12px',
            marginBottom: '16px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: '800', color: '#15803d', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.04em' }}>
              📢 Automatic Destination Announcement
            </div>
            <div style={{ fontWeight: '700', color: '#166534', marginTop: '2px' }}>
              Heading to {selectedPlace?.name || destination} ({selectedPlace?.category || 'Custom'})
              {selectedPlace?.address ? ` — ${selectedPlace.address}` : ''}
            </div>
          </div>
        )}

        {/* Share trip with */}
        <div style={{ marginBottom: '24px' }}>
          <label className="input-label" style={{ marginBottom: '10px' }}>Share trip with</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {members.filter((m) => m.id !== currentUserId).map((member) => {
              const isChecked = selectedMembers.includes(member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => handleToggleMember(member.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>{member.avatar || '👤'}</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{member.name}</span>
                  </div>
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      background: isChecked ? '#4f46e5' : '#ffffff',
                      border: isChecked ? 'none' : '2px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                  >
                    {isChecked && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() => handleStart()}
        >
          <Navigation size={18} />
          <span>Start Trip</span>
        </button>
      </div>
    </div>
  );
}
