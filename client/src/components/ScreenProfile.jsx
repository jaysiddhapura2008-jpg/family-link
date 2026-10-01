import React from 'react';
import {
  User,
  Shield,
  Eye,
  Activity,
  PhoneCall,
  Bell,
  Sun,
  Lock,
  LogOut,
  Trash2,
  ChevronRight
} from 'lucide-react';

export default function ScreenProfile({
  currentUser,
  privacy,
  onOpenLocationSharing,
  onLogout
}) {
  const isSharing = privacy?.locationSharingEnabled ?? true;

  return (
    <div className="scroll-content">
      {/* Header */}
      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '20px' }}>
        My Profile
      </h2>

      {/* User Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#eef2ff',
            fontSize: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
          }}
        >
          {currentUser?.avatar || '👤'}
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
            {currentUser?.name || 'User'}
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            {currentUser?.phone || currentUser?.email || 'user@example.com'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isSharing ? '#10b981' : '#ef4444'
              }}
            />
            <span style={{ fontSize: '11px', fontWeight: '700', color: isSharing ? '#10b981' : '#ef4444' }}>
              {isSharing ? 'Sharing Location' : 'Sharing Paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Section: PRIVACY */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '6px' }}>
          Privacy
        </h4>
        <div className="card" style={{ padding: '4px 16px', display: 'flex', flexDirection: 'column' }}>
          <div
            onClick={onOpenLocationSharing}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield size={18} color="#4f46e5" />
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Location Sharing</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: isSharing ? '#10b981' : '#ef4444' }}>
                {isSharing ? 'ON' : 'OFF'}
              </span>
              <ChevronRight size={16} color="#94a3b8" />
            </div>
          </div>

          <div
            onClick={onOpenLocationSharing}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Eye size={18} color="#0284c7" />
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Who Can See Me</span>
            </div>
            <ChevronRight size={16} color="#94a3b8" />
          </div>
        </div>
      </div>

      {/* Section: SAFETY */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '6px' }}>
          Safety
        </h4>
        <div className="card" style={{ padding: '4px 16px', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <PhoneCall size={18} color="#10b981" />
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Emergency Contacts</span>
            </div>
            <ChevronRight size={16} color="#94a3b8" />
          </div>

          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>🚨</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>SOS Settings</span>
            </div>
            <ChevronRight size={16} color="#94a3b8" />
          </div>
        </div>
      </div>

      {/* Section: APP */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '6px' }}>
          App
        </h4>
        <div className="card" style={{ padding: '4px 16px', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Bell size={18} color="#f59e0b" />
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Notifications</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#10b981' }}>Enabled</span>
          </div>

          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sun size={18} color="#64748b" />
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Appearance</span>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Light Mode</span>
          </div>
        </div>
      </div>

      {/* Section: SECURITY & ACCOUNT */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '6px' }}>
          Security
        </h4>
        <div className="card" style={{ padding: '4px 16px', display: 'flex', flexDirection: 'column' }}>
          <div
            onClick={onLogout}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LogOut size={18} color="#ef4444" />
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#ef4444' }}>Logout</span>
            </div>
            <ChevronRight size={16} color="#ef4444" />
          </div>
        </div>
      </div>
    </div>
  );
}
