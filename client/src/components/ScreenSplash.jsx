import React, { useEffect } from 'react';
import { Shield, Sparkles } from 'lucide-react';

export default function ScreenSplash({ onContinue, appName = 'FamilyLink' }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div
      onClick={onContinue}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        padding: '32px',
        textAlign: 'center',
        cursor: 'pointer'
      }}
    >
      <div
        style={{
          width: '84px',
          height: '84px',
          borderRadius: '26px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 12px 30px rgba(79, 70, 229, 0.35)',
          marginBottom: '20px',
          animation: 'pulse-ring 2.5s infinite'
        }}
      >
        <Shield size={44} strokeWidth={2.2} />
      </div>

      <h1
        style={{
          fontSize: '28px',
          fontWeight: '800',
          color: '#0f172a',
          letterSpacing: '-0.5px',
          marginBottom: '8px'
        }}
      >
        {appName}
      </h1>

      <p style={{ fontSize: '15px', color: '#64748b', fontWeight: '500' }}>
        Stay connected with your family.
      </p>

      <div
        style={{
          marginTop: '60px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: '#94a3b8'
        }}
      >
        <Sparkles size={14} color="#6366f1" />
        <span>Private • Consensual • Real-Time</span>
      </div>
    </div>
  );
}
