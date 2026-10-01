import React from 'react';
import { MapPin, Plus, Trash2, BellRing, ChevronRight } from 'lucide-react';

export default function ScreenPlaces({
  places = [],
  onAddPlace,
  onOpenCategorySetup,
  onSelectPlace,
  onDeletePlace
}) {
  return (
    <div className="scroll-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>My Places</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Get notified when family arrives or leaves.
          </p>
        </div>
        {onOpenCategorySetup && (
          <button
            onClick={onOpenCategorySetup}
            style={{
              background: '#eef2ff',
              border: '1px solid #c7d2fe',
              color: '#4338ca',
              padding: '6px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            ⚙️ Categories
          </button>
        )}
      </div>

      {places.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '28px'
            }}
          >
            📍
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            No saved places yet.
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            Add places like Home, School, or Work to receive arrival alerts.
          </p>
          <button className="btn-primary" onClick={onAddPlace}>
            <Plus size={18} />
            <span>Add Place</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {places.map((place) => {
            const hasNotifications = place.notifications && Object.keys(place.notifications).length > 0;

            return (
              <div
                key={place.id}
                onClick={() => onSelectPlace(place)}
                className="card"
                style={{
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px'
                    }}
                  >
                    {place.icon || '📍'}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                        {place.name}
                      </h4>
                      {place.category && (
                        <span style={{ fontSize: '10px', fontWeight: '700', background: '#e0e7ff', color: '#4338ca', padding: '1px 6px', borderRadius: '4px' }}>
                          {place.category}
                        </span>
                      )}
                    </div>
                    {place.address && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', maxWidth: '230px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {place.address}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {place.radius || 150} m geofence
                      </span>
                      {hasNotifications && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#4f46e5',
                            background: '#eef2ff',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <BellRing size={10} /> Alerts ON
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove ${place.name}?`)) {
                        onDeletePlace(place.id);
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '6px',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      borderRadius: '8px'
                    }}
                    title="Delete place"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} color="#cbd5e1" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {places.length > 0 && (
        <button className="btn-primary" onClick={onAddPlace}>
          <Plus size={18} />
          <span>+ Add Place</span>
        </button>
      )}
    </div>
  );
}
