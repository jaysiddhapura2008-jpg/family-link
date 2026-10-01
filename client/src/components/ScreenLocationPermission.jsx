import React, { useState } from 'react';
import { MapPin, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function ScreenLocationPermission({ familyName = 'Sharma Family', onAllowed, onDenied }) {
  const [requesting, setRequesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const getFallbackLocation = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return { latitude: data.latitude, longitude: data.longitude, accuracy: 2500, speed: 0 };
      }
    } catch {
      try {
        const res2 = await fetch('https://ipwhois.app/json/');
        const data2 = await res2.json();
        if (data2.latitude && data2.longitude) {
          return { latitude: data2.latitude, longitude: data2.longitude, accuracy: 2500, speed: 0 };
        }
      } catch {}
    }
    return { latitude: 21.1702, longitude: 72.8311, accuracy: 2500, speed: 0 };
  };

  const handleAllow = () => {
    setRequesting(true);
    setErrorMsg('');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setRequesting(false);
          onAllowed({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || 0
          });
        },
        async (error) => {
          console.warn('GPS acquiring or timed out, using network location:', error.message);
          const fallback = await getFallbackLocation();
          setRequesting(false);
          onAllowed(fallback);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      getFallbackLocation().then((loc) => {
        setRequesting(false);
        onAllowed(loc);
      });
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '36px 24px 28px 24px',
        background: '#ffffff'
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {/* Icon: 📍 */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: '#eef2ff',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            marginBottom: '24px',
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.15)'
          }}
        >
          📍
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
          Share your location
        </h2>

        <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.5, maxWidth: '310px', marginBottom: '28px' }}>
          Your family can see your location when you choose to share it.
        </p>

        {/* Who can see me Box */}
        <div
          style={{
            width: '100%',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} color="#4f46e5" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Who can see me:</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
            {familyName}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
          <CheckCircle size={14} />
          <span>You can turn sharing off at any time</span>
        </div>

        {errorMsg && (
          <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '12px' }}>
            {errorMsg}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
        <button
          className="btn-primary"
          onClick={handleAllow}
          disabled={requesting}
        >
          {requesting ? 'Requesting GPS...' : 'Allow Location'}
        </button>

        <button
          className="btn-secondary"
          onClick={onDenied}
        >
          Not Now
        </button>
      </div>
    </div>
  );
}
