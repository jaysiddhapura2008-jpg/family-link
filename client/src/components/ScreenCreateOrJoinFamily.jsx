import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function ScreenCreateOrJoinFamily({ onCreateFamily, onJoinFamily }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px',
        background: '#f8fafc'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
          Welcome to FamilyLink
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>
          Connect with your circle to share live locations safely.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* CARD 1: Create Family */}
        <div
          onClick={onCreateFamily}
          className="card"
          style={{
            cursor: 'pointer',
            padding: '24px',
            border: '2px solid transparent',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '20px',
                background: '#eef2ff',
                fontSize: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              👨‍👩‍👧
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Create Family</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                Create a private family circle.
              </p>
            </div>
          </div>
          <ChevronRight size={20} color="#94a3b8" />
        </div>

        {/* CARD 2: Join Family */}
        <div
          onClick={onJoinFamily}
          className="card"
          style={{
            cursor: 'pointer',
            padding: '24px',
            border: '2px solid transparent',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0284c7')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '20px',
                background: '#f0f9ff',
                fontSize: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              🔗
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Join Family</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                Join using an invitation.
              </p>
            </div>
          </div>
          <ChevronRight size={20} color="#94a3b8" />
        </div>
      </div>
    </div>
  );
}
