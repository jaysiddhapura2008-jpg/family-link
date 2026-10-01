import React from 'react';
import { Home, Users, MapPin, User } from 'lucide-react';

export default function BottomNavigation({ currentTab, onSelectTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, emoji: '🏠' },
    { id: 'family', label: 'Family', icon: Users, emoji: '👨‍👩‍👧' },
    { id: 'places', label: 'Places', icon: MapPin, emoji: '📍' },
    { id: 'me', label: 'Me', icon: User, emoji: '👤' }
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
          >
            <span className="nav-icon" style={{ fontSize: '18px' }}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
