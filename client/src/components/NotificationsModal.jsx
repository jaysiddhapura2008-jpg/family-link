import React from 'react';
import { Bell, CheckCheck, X, AlertTriangle, MapPin, Navigation } from 'lucide-react';

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead
}) {
  if (!isOpen) return null;

  const getIcon = (n) => {
    if (n.isEmergency || n.title?.includes('EMERGENCY')) {
      return <AlertTriangle size={18} color="#ef4444" />;
    }
    if (n.title?.includes('Trip')) {
      return <Navigation size={18} color="#0284c7" />;
    }
    return <MapPin size={18} color="#4f46e5" />;
  };

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div
        className="bottom-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '82vh' }}
      >
        <div className="sheet-handle" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="#4f46e5" />
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Notifications</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onMarkAllRead}
              style={{
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <CheckCheck size={16} />
              Mark all read
            </button>
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
        </div>

        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <Bell size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <p style={{ fontSize: '14px', fontWeight: '600' }}>No new notifications</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>You're all caught up with family activity.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  background: n.read ? '#ffffff' : '#f0fdf4',
                  border: n.read ? '1px solid #e2e8f0' : '1.5px solid #86efac',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: n.isEmergency ? '#fee2e2' : '#eef2ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getIcon(n)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{n.title}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', marginTop: '3px', lineHeight: 1.4 }}>{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
