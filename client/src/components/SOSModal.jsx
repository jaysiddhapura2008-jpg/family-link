import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Phone, MapPin, BatteryCharging, X, CheckCircle } from 'lucide-react';
import { sounds } from '../utils/audio.js';

export default function SOSModal({
  isOpen,
  onClose,
  currentUser,
  currentFamily,
  onTriggerSOS,
  activeAlert = null,
  onResolveAlert
}) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alertSent, setAlertSent] = useState(false);
  const holdTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    if (activeAlert) {
      setAlertSent(true);
    } else {
      setAlertSent(false);
      setProgress(0);
    }
  }, [activeAlert, isOpen]);

  if (!isOpen) return null;

  const startHold = () => {
    if (alertSent) return;
    setHolding(true);
    const startTime = Date.now();
    const duration = 2000; // 2 seconds press and hold to avoid accidental trigger

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(progressIntervalRef.current);
        setHolding(false);
        triggerEmergency();
      }
    }, 40);
  };

  const cancelHold = () => {
    if (alertSent) return;
    setHolding(false);
    setProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  const triggerEmergency = () => {
    setAlertSent(true);
    sounds.playSOSAlarm();
    if (onTriggerSOS) {
      onTriggerSOS({
        latitude: 28.6139,
        longitude: 77.2090,
        battery: 78
      });
    }
  };

  return (
    <div className="bottom-sheet-backdrop" onClick={onClose}>
      <div
        className="bottom-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          textAlign: 'center',
          padding: '24px 20px 36px 20px'
        }}
      >
        <div className="sheet-handle" />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
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

        {!alertSent ? (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}
            >
              <AlertTriangle size={36} />
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Emergency SOS
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '300px', margin: '0 auto 28px auto' }}>
              Press and hold to alert your selected family members.
            </p>

            {/* Circular Press & Hold Button */}
            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 24px auto' }}>
              <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="70"
                  cy="70"
                  r="62"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="62"
                  stroke="#ef4444"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="390"
                  strokeDashoffset={390 - (390 * progress) / 100}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                />
              </svg>

              <button
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
                onTouchStart={startHold}
                onTouchEnd={cancelHold}
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  width: '116px',
                  height: '116px',
                  borderRadius: '50%',
                  background: holding ? '#dc2626' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transform: holding ? 'scale(0.96)' : 'scale(1)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <span style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '1px' }}>SOS</span>
                <span style={{ fontSize: '11px', opacity: 0.9, marginTop: '2px' }}>
                  {holding ? `${progress}%` : 'Hold 2s'}
                </span>
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              Prevents accidental touches with safety hold confirmation.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🚨</div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#dc2626', marginBottom: '8px' }}>
              Emergency Alert Sent
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
              All members of {currentFamily?.name || 'your family circle'} have been alerted.
            </p>

            {/* Alert Stats Box */}
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <MapPin size={16} color="#ef4444" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                  Current Location:
                </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Near Central Park</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px' }}>⏰</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Time:</span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BatteryCharging size={16} color="#16a34a" />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Battery:</span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>78%</span>
              </div>
            </div>

            {/* Buttons: Call & View Location */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                className="btn-danger"
                onClick={() => {
                  window.location.href = 'tel:911';
                }}
              >
                <Phone size={18} />
                <span>Call Emergency Services</span>
              </button>

              <button
                className="btn-secondary"
                onClick={() => {
                  onClose();
                }}
              >
                <MapPin size={18} color="#4f46e5" />
                <span>View Location on Map</span>
              </button>

              <button
                onClick={() => {
                  if (onResolveAlert) onResolveAlert();
                  setAlertSent(false);
                  onClose();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginTop: '8px',
                  cursor: 'pointer'
                }}
              >
                I'm Safe Now (Cancel Alert)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
