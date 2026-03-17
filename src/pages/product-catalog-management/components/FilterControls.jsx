import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Search, SlidersHorizontal, Plus, X } from 'lucide-react';

/* ─── tokens ─────────────────────────────────────────────────────────── */
const T = {
  accent: '#2563eb',
  accentLight: '#eff6ff',
  border: '#e2e8f0',
  shadow: '0 1px 3px 0 rgba(0,0,0,.07)',
};

const selectStyle = {
  width: '100%', padding: '8px 12px', fontSize: 13, fontWeight: 500,
  border: `1px solid ${T.border}`, borderRadius: 9, background: '#fff',
  color: '#374151', outline: 'none', cursor: 'pointer',
  appearance: 'none', WebkitAppearance: 'none',
};

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 };

/* ─── Component ──────────────────────────────────────────────────────── */
const FilterControls = ({ onFilterChange, onSearch, onAddProduct }) => {
  const [filters, setFilters] = useState({ category: '', vendor: '', auctionStatus: '', dateRange: '', priceRange: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const decodeJWT = (token) => {
    try {
      const b = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(atob(b).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
    } catch { return null; }
  };

  const getUserData = () => {
    const token = Cookies.get('authToken') || Cookies.get('accessToken') || localStorage.getItem('authToken');
    if (token) { const d = decodeJWT(token); if (d) return d; }
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  };

  useEffect(() => {
    const u = getUserData();
    setIsAdmin(u?.role?.toLowerCase() === 'salesbidadmin');
  }, []);

  const CATEGORIES = [{ value: '', label: 'All Categories' }, { value: 'electronics', label: 'Electronics' }, { value: 'fashion', label: 'Fashion' }, { value: 'home', label: 'Home & Garden' }, { value: 'sports', label: 'Sports & Outdoors' }, { value: 'books', label: 'Books' }, { value: 'automotive', label: 'Automotive' }];
  const VENDORS = [{ value: '', label: 'All Vendors' }, { value: 'techmart', label: 'TechMart Solutions' }, { value: 'fashionhub', label: 'Fashion Hub' }, { value: 'homeessentials', label: 'Home Essentials' }, { value: 'sportsworld', label: 'Sports World' }, { value: 'bookstore', label: 'Digital Bookstore' }];
  const AUCTION_STATUSES = [{ value: '', label: 'All Statuses' }, { value: 'live', label: 'Live' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'ended', label: 'Ended' }, { value: 'draft', label: 'Draft' }];
  const DATE_RANGES = [{ value: '', label: 'All Time' }, { value: 'today', label: 'Today' }, { value: 'week', label: 'This Week' }, { value: 'month', label: 'This Month' }, { value: 'quarter', label: 'This Quarter' }];
  const PRICE_RANGES = [{ value: '', label: 'All Prices' }, { value: '0-50', label: '₹0–₹50' }, { value: '50-100', label: '₹50–₹100' }, { value: '100-500', label: '₹100–₹500' }, { value: '500-1000', label: '₹500–₹1,000' }, { value: '1000+', label: '₹1,000+' }];

  const handleFilterChange = (key, value) => {
    const nf = { ...filters, [key]: value };
    setFilters(nf); onFilterChange(nf);
  };

  const handleSearch = (e) => { e?.preventDefault(); onSearch(searchQuery); };

  const clearFilters = () => {
    const c = { category: '', vendor: '', auctionStatus: '', dateRange: '', priceRange: '' };
    setFilters(c); setSearchQuery(''); onFilterChange(c); onSearch('');
  };

  const hasActive = Object.values(filters).some(v => v !== '') || searchQuery !== '';
  const activeCount = Object.values(filters).filter(v => v !== '').length + (searchQuery ? 1 : 0);

  return (
    <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px 22px', marginBottom: 18, boxShadow: T.shadow }}>
      {/* Top row: search + actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products, SKUs, vendors…"
            style={{ width: '100%', padding: '9px 12px 9px 34px', border: `1px solid ${T.border}`, borderRadius: 9, fontSize: 13, color: '#374151', background: '#f8fafc', outline: 'none' }}
          />
        </form>
        <button
          onClick={() => setShowAdvanced(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', border: `1px solid ${showAdvanced ? T.accent : T.border}`, borderRadius: 9, background: showAdvanced ? T.accentLight : '#fff', color: showAdvanced ? T.accent : '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer', position: 'relative' }}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: T.accent, color: '#fff', borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeCount}</span>}
        </button>
        <button
          onClick={onAddProduct}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: 'none', borderRadius: 9, background: T.accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: `0 2px 8px ${T.accent}44` }}
        >
          <Plus size={15} />
          Add Product
        </button>
      </div>

      {/* Filters row */}
      {showAdvanced && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(160px, 1fr))`, gap: 14, marginBottom: 14 }}>
            {[
              { key: 'category', opts: CATEGORIES, label: 'Category' },
              ...(isAdmin ? [{ key: 'vendor', opts: VENDORS, label: 'Vendor' }] : []),
              { key: 'auctionStatus', opts: AUCTION_STATUSES, label: 'Auction Status' },
              { key: 'dateRange', opts: DATE_RANGES, label: 'Date Range' },
              { key: 'priceRange', opts: PRICE_RANGES, label: 'Price Range' },
            ].map(({ key, opts, label }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <select value={filters[key]} onChange={e => handleFilterChange(key, e.target.value)} style={selectStyle}>
                    {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width={14} height={14} viewBox="0 0 14 14" fill="none">
                    <path d="M3 5l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Advanced inputs */}
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Advanced</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
              {[
                { placeholder: 'Min Price', type: 'number' },
                { placeholder: 'Max Price', type: 'number' },
                { placeholder: 'Start Date', type: 'date' },
                { placeholder: 'End Date', type: 'date' },
              ].map((inp, i) => (
                <div key={i}>
                  <label style={labelStyle}>{inp.placeholder}</label>
                  <input type={inp.type} placeholder={inp.placeholder} style={{ ...selectStyle, padding: '8px 12px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasActive && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: showAdvanced ? 14 : 0, paddingTop: showAdvanced ? 14 : 0, borderTop: showAdvanced ? `1px solid ${T.border}` : 'none' }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Active:</span>
          {Object.entries(filters).map(([key, value]) => {
            if (!value || (key === 'vendor' && !isAdmin)) return null;
            return (
              <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: T.accentLight, color: T.accent, borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                <button onClick={() => handleFilterChange(key, '')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: T.accent }}>
                  <X size={12} />
                </button>
              </span>
            );
          })}
          {searchQuery && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: T.accentLight, color: T.accent, borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
              Search: {searchQuery}
              <button onClick={() => { setSearchQuery(''); onSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: T.accent }}>
                <X size={12} />
              </button>
            </span>
          )}
          <button onClick={clearFilters} style={{ fontSize: 12, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, textDecoration: 'underline', fontFamily: 'inherit' }}>
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterControls;