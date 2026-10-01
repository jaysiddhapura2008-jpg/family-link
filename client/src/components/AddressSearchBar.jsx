import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Navigation, Plus } from 'lucide-react';

export default function AddressSearchBar({
  onSelectLocation,
  placeholder = "Search any place in India or worldwide..."
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceTimerRef = useRef(null);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 280);
  };

  const handleSelect = (item) => {
    setQuery(item.name);
    setIsOpen(false);
    if (onSelectLocation) {
      onSelectLocation(item);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '84px',
        left: '16px',
        right: '16px',
        zIndex: 550,
        fontFamily: 'inherit'
      }}
    >
      {/* Floating Google-Style Search Input Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(16px)',
          padding: '10px 14px',
          borderRadius: '9999px',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.14)',
          border: '1px solid rgba(226, 232, 240, 0.9)'
        }}
      >
        <Search size={18} color="#1a73e8" style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            width: '100%',
            fontSize: '14px',
            color: '#1e293b',
            fontWeight: '600'
          }}
        />

        {loading && <Loader2 size={16} color="#1a73e8" className="animate-spin" style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }} />}

        {query && !loading && (
          <button
            onClick={clearSearch}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              color: '#94a3b8'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Real-Time Dropdown Suggestions */}
      {isOpen && results.length > 0 && (
        <div
          style={{
            marginTop: '8px',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            padding: '8px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            maxHeight: '260px',
            overflowY: 'auto'
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', padding: '6px 10px', letterSpacing: '0.05em' }}>
            Live Search Results (India & Global)
          </div>
          {results.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#e8f0fe',
                  color: '#1a73e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <MapPin size={16} />
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
