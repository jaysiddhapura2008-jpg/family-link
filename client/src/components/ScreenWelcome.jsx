import React from 'react';
import { ShieldCheck, MapPin, Heart, Users } from 'lucide-react';

export default function ScreenWelcome({ onCreateAccount, onLogin }) {
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
      {/* Top illustration representation */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            position: 'relative',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #e0e7ff 0%, #f8fafc 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px'
          }}
        >
          {/* Circular Map Graphic */}
          <div
            style={{
              position: 'absolute',
              width: '180px',
              height: '180px',
              border: '2px dashed #cbd5e1',
              borderRadius: '50%'
            }}
          />

          {/* Central Shield */}
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
              zIndex: 2
            }}
          >
            <ShieldCheck size={32} />
          </div>

          {/* Connected Family Avatar Markers */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '40px',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '2px solid #10b981'
            }}
          >
            👩
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              left: '25px',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '2px solid #0284c7'
            }}
          >
            👦
          </div>

          <div
            style={{
              position: 'absolute',
              top: '55px',
              right: '25px',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '2px solid #6366f1'
            }}
          >
            👨
          </div>
        </div>

        {/* Headline & Subtitle */}
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#0f172a',
            textAlign: 'center',
            lineHeight: 1.25,
            marginBottom: '12px'
          }}
        >
          Stay connected with the people who matter.
        </h2>

        <p
          style={{
            fontSize: '14px',
            color: '#64748b',
            textAlign: 'center',
            lineHeight: 1.5,
            padding: '0 8px'
          }}
        >
          Share your location, stay updated, and know when your family gets where they're going.
        </p>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
        <button className="btn-primary" onClick={onCreateAccount}>
          Create Account
        </button>
        <button className="btn-secondary" onClick={onLogin}>
          Log In
        </button>
      </div>
    </div>
  );
}
