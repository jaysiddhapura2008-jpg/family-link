import React, { useState } from 'react';
import { Smartphone, Monitor, Play, WifiOff, Wifi, MapPin, X, Settings2 } from 'lucide-react';

export default function MultiUserSimulatorBar({
  currentUser,
  users = [],
  onSwitchUser,
  onSimulateMove,
  isSharing,
  onToggleSharing,
  isFullscreen,
  onToggleFullscreen,
  onTriggerArrivalDemo,
  isSimulatedOffline,
  onToggleSimulateOffline
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Toggle Button (Unobtrusive on mobile phones) */}
      {!isOpen && (
        <button
          className="sim-bar-floating-trigger"
          onClick={() => setIsOpen(true)}
          title="Open FamilyLink Testing Bar"
        >
          <Settings2 size={13} />
          <span>Switch User / Test Tools</span>
        </button>
      )}

      {/* Expanded Menu */}
      {isOpen && (
        <div className="sim-bar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
            <span style={{ fontWeight: '800', fontSize: '13px', color: '#818cf8' }}>
              FamilyLink Test Tools
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* User Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', width: '100%' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>View as:</span>
            {users.map((u) => {
              const isCurrent = currentUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  className={`sim-btn ${isCurrent ? 'active' : ''}`}
                  onClick={() => onSwitchUser(u)}
                >
                  <span>{u.avatar || '👤'}</span>
                  <span>{u.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            {/* Simulate App Closed / Internet Off Toggle */}
            <button
              className="sim-btn"
              onClick={onToggleSimulateOffline}
              style={{
                background: isSimulatedOffline ? '#b45309' : '#334155',
                color: isSimulatedOffline ? '#fff' : '#f1f5f9'
              }}
              title="Simulate closing the app or cutting internet connection"
            >
              {isSimulatedOffline ? <WifiOff size={13} /> : <Wifi size={13} />}
              <span>{isSimulatedOffline ? 'App Closed / Offline' : 'Online / Live'}</span>
            </button>

            {/* Quick Location Consent Toggle */}
            <button
              className="sim-btn"
              onClick={() => onToggleSharing(!isSharing)}
              style={{
                background: isSharing ? '#065f46' : '#991b1b'
              }}
            >
              <span>{isSharing ? '🟢 Sharing ON' : '🔴 Sharing OFF'}</span>
            </button>

            {/* Movement Simulation */}
            <button
              className="sim-btn"
              onClick={onSimulateMove}
              title="Simulate movement on map"
            >
              <MapPin size={13} />
              <span>Move</span>
            </button>

            {/* Trigger Geofence Arrival */}
            <button
              className="sim-btn"
              onClick={onTriggerArrivalDemo}
              title="Simulate arriving at School/Home"
            >
              <Play size={13} />
              <span>Arrive Place</span>
            </button>

            {/* Fullscreen / Phone Frame Toggle */}
            <button
              className="sim-btn"
              onClick={onToggleFullscreen}
              title="Toggle full screen mobile"
            >
              {isFullscreen ? <Smartphone size={13} /> : <Monitor size={13} />}
              <span>{isFullscreen ? 'Phone Frame' : 'Full Screen'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
