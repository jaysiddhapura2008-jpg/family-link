import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';

export default function TopHeader({
  currentUser,
  currentFamily,
  unreadCount = 0,
  onOpenNotifications,
  onOpenProfile,
  onFamilySelect
}) {
  return (
    <header className="top-floating-header">
      {/* Profile Avatar / Quick Link */}
      <button
        className="circle-icon-btn"
        onClick={onOpenProfile}
        title="My Profile"
        style={{ fontSize: '18px' }}
      >
        {currentUser?.avatar || '👤'}
      </button>

      {/* Family Selector Pill */}
      <button
        className="floating-pill"
        onClick={onFamilySelect}
      >
        <span style={{ fontSize: '16px' }}>{currentFamily?.photo || '👨‍👩‍👧‍👦'}</span>
        <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentFamily?.name || 'Family Circle'}
        </span>
        <ChevronDown size={16} color="#64748b" />
      </button>

      {/* Notification Bell */}
      <button
        className="circle-icon-btn"
        onClick={onOpenNotifications}
        title="Notifications"
        style={{ position: 'relative' }}
      >
        <Bell size={20} color="#334155" />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: '#ef4444',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              minWidth: '16px',
              height: '16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}
