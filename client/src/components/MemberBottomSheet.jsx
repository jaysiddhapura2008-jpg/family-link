import React from 'react';
import { Navigation, Phone, MessageSquare, BatteryCharging, X } from 'lucide-react';

export default function MemberBottomSheet({
  member,
  activities = [],
  onClose,
  onStartTripWith
}) {
  if (!member) return null;

  const loc = member.location;
  const isMoving = loc?.status === 'Moving' || (loc?.speed && loc.speed > 5);
  const isAvailable = loc && loc.isLive && loc.latitude;

  // Filter activities for this member
  const memberActivities = activities.filter((a) => a.userId === member.id);

  // Fallback demo activities if none yet
  const displayActivities = memberActivities.length > 0 ? memberActivities : [
    { id: '1', time: '8:20 AM', icon: '📍', text: 'Arrived at School' },
    { id: '2', time: '6:40 PM', icon: '📍', text: 'Left School' },
    { id: '3', time: '7:05 PM', icon: '📍', text: 'Arrived Gym' },
    { id: '4', time: '8:00 PM', icon: '🏠', text: 'Going Home' }
  ];

  const handleDirections = () => {
    if (loc?.latitude && loc?.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`, '_blank');
    } else {
      alert('Location not currently available for directions.');
    }
  };

  const handleCall = () => {
    if (member.phone) {
      window.location.href = `tel:${member.phone}`;
    } else {
      alert(`Calling ${member.name}...`);
    }
  };

  const handleMessage = () => {
    if (member.phone) {
      window.location.href = `sms:${member.phone}`;
    } else {
      alert(`Opening messages for ${member.name}...`);
    }
  };

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              {member.avatar || '👤'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{member.name}</h3>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    background: '#f1f5f9',
                    color: '#64748b',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}
                >
                  {member.role || 'Member'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: !isAvailable ? '#94a3b8' : loc?.isOffline ? '#f59e0b' : isMoving ? '#0284c7' : '#10b981'
                  }}
                />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: !isAvailable ? '#64748b' : loc?.isOffline ? '#d97706' : isMoving ? '#0284c7' : '#10b981'
                  }}
                >
                  {!isAvailable ? 'Location unavailable' : loc?.isOffline ? `Offline (${loc.lastSeenText || 'Last seen'})` : isMoving ? 'Moving' : loc?.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

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
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Location & Battery detail */}
        <div
          style={{
            background: loc?.isOffline ? '#fffbeb' : '#f8fafc',
            border: loc?.isOffline ? '1px solid #fde68a' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
              {isAvailable
                ? loc?.isOffline
                  ? `Last Known: Near ${loc.status || 'City Center'}`
                  : `Near ${loc.status || 'City Center'}`
                : 'Location unavailable'}
            </p>
            <p style={{ fontSize: '12px', color: loc?.isOffline ? '#b45309' : '#64748b', marginTop: '2px' }}>
              {loc?.isOffline
                ? `Phone offline • ${loc.lastSeenText || 'Last confirmed spot'}`
                : loc?.lastUpdated
                  ? `Last updated ${new Date(loc.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Last updated recently'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: '700', fontSize: '13px' }}>
            <BatteryCharging size={18} />
            <span>{loc?.battery ? `${loc.battery}%` : '85%'}</span>
          </div>
        </div>

        {/* Action Buttons: Directions, Call, Message */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '22px' }}>
          <button
            onClick={handleDirections}
            className="btn-secondary"
            style={{ padding: '10px 8px', fontSize: '13px', flexDirection: 'column', gap: '4px', borderRadius: '14px' }}
          >
            <Navigation size={18} color="#4f46e5" />
            <span>Directions</span>
          </button>
          <button
            onClick={handleCall}
            className="btn-secondary"
            style={{ padding: '10px 8px', fontSize: '13px', flexDirection: 'column', gap: '4px', borderRadius: '14px' }}
          >
            <Phone size={18} color="#10b981" />
            <span>Call</span>
          </button>
          <button
            onClick={handleMessage}
            className="btn-secondary"
            style={{ padding: '10px 8px', fontSize: '13px', flexDirection: 'column', gap: '4px', borderRadius: '14px' }}
          >
            <MessageSquare size={18} color="#0284c7" />
            <span>Message</span>
          </button>
        </div>

        {/* Today's Activity Section */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#334155', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Today's Activity
          </h4>
          <div className="timeline">
            {displayActivities.slice(0, 4).map((act, i) => (
              <div key={act.id || i} className="timeline-item">
                <div className="timeline-dot">{act.icon || '📍'}</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{act.time}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginTop: '2px' }}>
                  {act.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
