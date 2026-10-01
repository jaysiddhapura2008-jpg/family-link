import React from 'react';
import { Navigation, Clock, Flag, CheckCircle } from 'lucide-react';

export default function ActiveTripCard({
  trip,
  onEndTrip,
  isOwner = false
}) {
  if (!trip) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '90px',
        left: '16px',
        right: '16px',
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        padding: '16px',
        boxShadow: 'var(--shadow-lg)',
        border: '1.5px solid #0284c7',
        zIndex: 480
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🚗</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                {trip.userName || 'Family Member'}
              </h4>
              {trip.category && (
                <span style={{ fontSize: '10px', fontWeight: '700', background: '#e0e7ff', color: '#4338ca', padding: '1px 6px', borderRadius: '6px' }}>
                  {trip.category}
                </span>
              )}
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0369a1', marginTop: '2px' }}>
              {trip.announcement || `Heading to ${trip.destinationName}`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7' }}>
                On the way
              </span>
              <span style={{ color: '#94a3b8' }}>•</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                ETA: {trip.etaMinutes || 12} min
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f0f9ff',
          borderRadius: '14px',
          padding: '10px 14px',
          margin: '10px 0 12px 0',
          fontSize: '13px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0369a1', fontWeight: '700' }}>
          <Navigation size={16} />
          <span>{trip.distanceKm || 4.2} km</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: '600' }}>
          <Clock size={16} />
          <span>Expected arrival: {trip.expectedArrival || '8:25 PM'}</span>
        </div>
      </div>

      {isOwner && (
        <button
          onClick={() => onEndTrip(trip.id)}
          className="btn-secondary"
          style={{
            padding: '10px',
            fontSize: '13px',
            fontWeight: '700',
            color: '#dc2626',
            borderColor: '#fca5a5',
            background: '#fff'
          }}
        >
          <CheckCircle size={16} color="#dc2626" />
          <span>End Trip</span>
        </button>
      )}
    </div>
  );
}
