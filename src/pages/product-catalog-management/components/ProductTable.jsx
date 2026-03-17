import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import ImageGalleryModal from '../../../components/ui/ImageGalleryModal';
import ScheduleAuctionModal from '../../../components/ui/ScheduleAuctionModal';
import ProductViewModal from '../../../components/ui/ProductViewModal';
import GoLiveModal from '../../../components/ui/GoLiveModal';

/* ─── Styles ─────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

.pt-root { font-family: 'DM Sans', sans-serif; }
.pt-root * { box-sizing: border-box; }

/* ── Table row ── */
.pt-tbody-row {
  display: contents;
}
.pt-tbody-row > div {
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  padding: 12px 14px;
  transition: background 0.12s;
  min-width: 0;
}
.pt-tbody-row:hover > div { background: #f8fafc; }
.pt-tbody-row.selected > div { background: #eff6ff; }

/* ── Icon action button ── */
.pt-act {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; color: #64748b; transition: all 0.13s;
  flex-shrink: 0; padding: 0;
}
.pt-act:hover { background: #eff6ff; border-color: #2563eb; color: #2563eb; }
.pt-act.pt-live { background: #dc2626; border-color: #dc2626; color: #fff; }
.pt-act.pt-live:hover { background: #b91c1c; }
.pt-act:disabled { opacity: 0.28; cursor: not-allowed; pointer-events: none; }

/* ── Auction badge ── */
.pt-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 700;
}
.pt-badge.live      { background: #ecfdf5; color: #059669; }
.pt-badge.scheduled { background: #fffbeb; color: #d97706; }
.pt-badge.ended     { background: #f1f5f9; color: #64748b; }
.pt-badge.draft     { background: #f8fafc; color: #94a3b8; }
.pt-badge .dot-live { animation: pt-pulse 2s infinite; }

@keyframes pt-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ── Status pill ── */
.pt-status {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 11px; border-radius: 20px; border: none;
  font-size: 12px; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: filter 0.13s;
  white-space: nowrap;
}
.pt-status:hover { filter: brightness(0.93); }
.pt-status.on  { background: #ecfdf5; color: #059669; }
.pt-status.off { background: #f1f5f9; color: #64748b; }

/* ── Media button ── */
.pt-media {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 9px; border: 1px solid #e2e8f0;
  border-radius: 7px; background: #f8fafc; color: #475569;
  font-size: 11px; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: all 0.12s;
}
.pt-media:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }

/* ── Schedule cal btn ── */
.pt-cal {
  width: 26px; height: 26px; border-radius: 6px;
  border: 1px solid #e2e8f0; background: transparent;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; color: #94a3b8; transition: all 0.12s;
}
.pt-cal:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }

/* ── Inline date editing ── */
.pt-date-read {
  background: none; border: none; cursor: pointer;
  padding: 2px 6px; border-radius: 5px;
  font-size: 12px; color: #374151; font-family: inherit;
  transition: background 0.1s;
}
.pt-date-read:hover { background: #eff6ff; color: #2563eb; }
.pt-date-input {
  padding: 4px 8px; border: 1.5px solid #93c5fd; border-radius: 7px;
  font-size: 12px; font-family: inherit; outline: none; background: #fff;
}

/* ── Mobile card ── */
.pt-card {
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 14px; padding: 15px 16px;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.pt-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07); }
.pt-card.sel { border-color: #93c5fd; background: #f0f7ff; }

/* ── Empty state ── */
.pt-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 72px 24px; text-align: center;
}

/* ── Responsive ── */
@media (min-width: 1280px) { .pt-mobile-view { display: none !important; } }
@media (min-width: 1024px) and (max-width: 1279px) { 
  .pt-mobile-view { display: none !important; }
  .pt-tablet-view { display: flex !important; }
}
@media (max-width: 1023px) { 
  .pt-desktop-view { display: none !important; }
  .pt-tablet-view { display: none !important; }
}
@media (max-width: 767px) { 
  .pt-tablet-view { display: flex !important; }
}
`;

/* ─── Helpers ────────────────────────────────────────────────────────── */
const PH_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23f1f5f9' width='80' height='80'/%3E%3Ccircle cx='40' cy='32' r='12' fill='%23cbd5e1'/%3E%3Cellipse cx='40' cy='60' rx='18' ry='10' fill='%23cbd5e1'/%3E%3C/svg%3E";

const getMainImg = p => {
  if (!p?.image_path) return null;
  const s = p.image_path.trim();
  return s.includes(',') ? s.split(',')[0].trim() : s;
};

const getImages = p => {
  if (!p?.image_path) return [];
  return p.image_path.trim().split(',')
    .map(u => u.trim()).filter(Boolean)
    .map((url, i) => ({ url, alt: `${p.name} ${i + 1}` }));
};

const fmtDate = d => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
};

const canGoLive = p => p?.isactive && p?.auction_start && p?.auction_end;

/* ─── Sub-components ─────────────────────────────────────────────────── */

const AuctionBadge = ({ status }) => {
  const s = status || 'draft';
  return (
    <span className={`pt-badge ${s}`}>
      <span
        className={s === 'live' ? 'dot-live' : ''}
        style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }}
      />
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
};

const EditableDate = ({ productId, field, value, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');

  const handleSave = () => { onSave(productId, field, val); setEditing(false); };

  if (editing) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <input
        type="date"
        value={val}
        onChange={e => setVal(e.target.value)}
        className="pt-date-input"
        style={{ width: 120 }}
        autoFocus
      />
      <button onClick={handleSave} style={{ width: 22, height: 22, border: 'none', borderRadius: 5, background: '#059669', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>
        <Icon name="Check" size={11} />
      </button>
      <button onClick={() => setEditing(false)} style={{ width: 22, height: 22, border: 'none', borderRadius: 5, background: '#f1f5f9', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>
        <Icon name="X" size={11} />
      </button>
    </div>
  );

  return (
    <button className="pt-date-read" onClick={() => { setVal(value || ''); setEditing(true); }}>
      {fmtDate(value) ?? <span style={{ color: '#cbd5e1' }}>—</span>}
    </button>
  );
};

/* ─── ProductAvatar ──────────────────────────────────────────────────── */
const ProductAvatar = ({ product, size = 40, imgErrors, onError }) => {
  const imgUrl = getMainImg(product);
  const hasFail = imgErrors[product?.product_id];
  return (
    <div style={{
      width: size, height: size, borderRadius: size <= 40 ? 10 : 12,
      overflow: 'hidden', background: '#f1f5f9', flexShrink: 0,
      border: '1px solid #e8edf2',
    }}>
      <img
        src={imgUrl && !hasFail ? imgUrl : PH_IMG}
        alt={product?.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={() => onError(product?.product_id)}
        loading="lazy"
      />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   DESKTOP TABLE — uses CSS Grid (no <table>), fully contained, no scroll
   XL: 1280px+
   LG: 1024px-1279px
   MD: 768px-1023px (Tablet - simplified view)
   SM: <768px (Mobile cards)
═══════════════════════════════════════════════════════════════════════ */

// XL Desktop grid - full columns
const GRID_XL = '40px minmax(0,2fr) 70px minmax(0,1.3fr) minmax(0,0.9fr) 90px minmax(0,1.1fr) minmax(0,1.3fr) 110px 110px';

// Desktop/LG grid - slightly condensed
const GRID_LG = '36px minmax(0,1.8fr) 60px minmax(0,1.2fr) minmax(0,0.8fr) 80px minmax(0,1fr) minmax(0,1.2fr) 100px 100px';

// Default/fallback grid
const GRID = GRID_XL;

const DesktopTable = ({ products, selectedProducts, onSelectProduct, onSelectAll, onStatusToggle, onEditProduct, setGallery, setSched, setView, setLive, imgErrors, setImgError, onCellValueUpdate }) => {
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const allSel = products.length > 0 && products.every(p => selectedProducts?.includes(p.product_id));
  const indSel = products.length > 0 && products.some(p => selectedProducts?.includes(p.product_id)) && !allSel;

  // Determine grid based on viewport
  const getGrid = () => {
    if (viewportWidth >= 1280) return GRID_XL;
    if (viewportWidth >= 1024) return GRID_LG;
    return GRID_LG; // Fallback to LG for tablet
  };

  // Listen for resize
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentGrid = getGrid();

};

/* ═══════════════════════════════════════════════════════════════════════
   MOBILE CARDS
═══════════════════════════════════════════════════════════════════════ */
const MobileCards = ({ products, selectedProducts, onSelectProduct, onStatusToggle, onEditProduct, setGallery, setSched, setView, setLive, imgErrors, setImgError, statusFilter, onApprove, onReject }) => (
  <div className="pt-mobile-view" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14 }}>
    {products.map((p, idx) => {
      const sel = selectedProducts?.includes(p.product_id);
      return (
        <div key={`m${p.product_id}${idx}`} className={`pt-card${sel ? ' sel' : ''}`}>

          {/* Row 1: checkbox + avatar + name + price */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ paddingTop: 3, flexShrink: 0 }}>
              <Checkbox checked={sel} onChange={e => onSelectProduct(p.product_id, e.target.checked)} />
            </div>
            <ProductAvatar product={p} size={52} imgErrors={imgErrors} onError={id => setImgError(prev => ({ ...prev, [id]: true }))} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
              <p style={{ margin: '2px 0 3px', fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>#{p.product_id}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.seller || '—'}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>₹{(p.starting_price || 0).toLocaleString('en-IN')}</p>
              {p.bid_amount && <p style={{ margin: '2px 0 0', fontSize: 10, color: '#059669', fontWeight: 700 }}>↑ ₹{p.bid_amount}</p>}
            </div>
          </div>

          {/* Row 2: tags */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
            {p.category && <span style={{ padding: '3px 9px', borderRadius: 6, background: '#f1f5f9', fontSize: 11, fontWeight: 600, color: '#475569' }}>{p.category}</span>}
            <AuctionBadge status={p.auctionstatus} />
            <button className="pt-media" onClick={() => setGallery({ open: true, p })}>
              <Icon name="Images" size={12} />{getImages(p).length}
            </button>
            {/* Hide Schedule Auction button for approved/pending/rejected pages */}
            {!statusFilter && (
              <button className="pt-cal" style={{ marginLeft: 'auto' }} onClick={() => setSched({ open: true, p })} title="Schedule Auction">
                <Icon name="Calendar" size={13} />
              </button>
            )}
          </div>

          {/* Row 3: dates */}
          {(p.auction_start || p.auction_end) && (
            <div style={{ display: 'flex', gap: 20, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
              {[['Start', p.auction_start], ['End', p.auction_end]].map(([label, val]) => val ? (
                <div key={label}>
                  <p style={{ margin: '0 0 2px', fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#374151' }}>{fmtDate(val)}</p>
                </div>
              ) : null)}
            </div>
          )}

          {/* Row 4: status + actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Show rejection reason for rejected products */}
            {statusFilter === 'rejected' && p.rejection_reason && (
              <div style={{ marginBottom: 8, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, width: '100%' }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejection Reason</span>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7f1d1d', fontWeight: 500 }}>{p.rejection_reason}</p>
              </div>
            )}
            {/* Hide Active/Inactive toggle for approved/pending/rejected pages */}
            {!statusFilter && (
              <button className={`pt-status ${p.isactive ? 'on' : 'off'}`} onClick={() => onStatusToggle(p.product_id)}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
                {p.isactive ? 'Active' : 'Inactive'}
              </button>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="pt-act" onClick={() => onEditProduct(p.product_id)}><Icon name="Pencil" size={14} /></button>
              <button className="pt-act" onClick={() => setView({ open: true, p })}><Icon name="Eye" size={14} /></button>
              {/* Hide Go Live button for approved/pending/rejected pages */}
              {!statusFilter && (
                <button className={`pt-act${canGoLive(p) ? ' pt-live' : ''}`} onClick={() => canGoLive(p) && setLive({ open: true, p })} disabled={!canGoLive(p)}><Icon name="Video" size={14} /></button>
              )}
              {/* Approve/Reject buttons for pending products (admin only) */}
              {statusFilter === 'pending' && (
                <>
                  <button 
                    className="pt-act" 
                    onClick={() => onApprove && onApprove(p.product_id)}
                    title="Approve"
                    style={{ background: '#ecfdf5', borderColor: '#059669', color: '#059669' }}
                  >
                    <Icon name="Check" size={14} />
                  </button>
                  <button 
                    className="pt-act" 
                    onClick={() => onReject && onReject(p)}
                    title="Reject"
                    style={{ background: '#fef2f2', borderColor: '#dc2626', color: '#dc2626' }}
                  >
                    <Icon name="X" size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════
    TABLET CARDS (768px - 1023px)
═══════════════════════════════════════════════════════════════════════ */
const TabletCards = ({ products, selectedProducts, onSelectProduct, onSelectAll, onStatusToggle, onEditProduct, setGallery, setSched, setView, setLive, imgErrors, setImgError, statusFilter, onApprove, onReject }) => {
  const allSel = products.length > 0 && products.every(p => selectedProducts?.includes(p.product_id));
  const indSel = products.length > 0 && products.some(p => selectedProducts?.includes(p.product_id)) && !allSel;

  return (
    <div className="pt-tablet-view" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      {/* Select All Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 10, marginBottom: 4 }}>
        <Checkbox checked={allSel} indeterminate={indSel} onChange={e => onSelectAll(e.target.checked)} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Select All</span>
        <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{products.length} products</span>
      </div>

      {products.map((p, idx) => {
        const sel = selectedProducts?.includes(p.product_id);
        return (
          <div key={`t${p.product_id}${idx}`} className={`pt-card${sel ? ' sel' : ''}`} style={{ padding: 14 }}>
            {/* Main Row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <div style={{ paddingTop: 2, flexShrink: 0 }}>
                <Checkbox checked={sel} onChange={e => onSelectProduct(p.product_id, e.target.checked)} />
              </div>
              <ProductAvatar product={p} size={56} imgErrors={imgErrors} onError={id => setImgError(prev => ({ ...prev, [id]: true }))} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                <p style={{ margin: '2px 0', fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>#{p.product_id}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.seller || '—'}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>₹{(p.starting_price || 0).toLocaleString('en-IN')}</p>
                {p.bid_amount && <p style={{ margin: '2px 0 0', fontSize: 10, color: '#059669', fontWeight: 700 }}>↑ ₹{p.bid_amount}</p>}
              </div>
            </div>

            {/* Details Row */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
              {p.category && <span style={{ padding: '3px 8px', borderRadius: 6, background: '#f1f5f9', fontSize: 11, fontWeight: 600, color: '#475569' }}>{p.category}</span>}
              <AuctionBadge status={p.auctionstatus} />
              <button className="pt-media" onClick={() => setGallery({ open: true, p })}>
                <Icon name="Images" size={12} />{getImages(p).length}
              </button>
              {/* Hide Schedule Auction button for approved/pending/rejected pages */}
              {!statusFilter && (
                <button className="pt-cal" style={{ marginLeft: 'auto' }} onClick={() => setSched({ open: true, p })} title="Schedule Auction">
                  <Icon name="Calendar" size={13} />
                </button>
              )}
            </div>

            {/* Footer Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Show rejection reason for rejected products */}
              {statusFilter === 'rejected' && p.rejection_reason && (
                <div style={{ marginBottom: 8, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, width: '100%' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejection Reason</span>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7f1d1d', fontWeight: 500 }}>{p.rejection_reason}</p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                {p.auction_start && (
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start</span>
                    <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 600, color: '#374151' }}>{fmtDate(p.auction_start)}</p>
                  </div>
                )}
                {p.auction_end && (
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>End</span>
                    <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 600, color: '#374151' }}>{fmtDate(p.auction_end)}</p>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Hide Active/Inactive toggle for approved/pending/rejected pages */}
                {!statusFilter && (
                  <button className={`pt-status ${p.isactive ? 'on' : 'off'}`} onClick={() => onStatusToggle(p.product_id)} style={{ padding: '4px 10px' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
                    {p.isactive ? 'Active' : 'Inactive'}
                  </button>
                )}
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="pt-act" onClick={() => onEditProduct(p.product_id)}><Icon name="Pencil" size={12} /></button>
                  <button className="pt-act" onClick={() => setView({ open: true, p })}><Icon name="Eye" size={12} /></button>
                  {/* Hide Go Live button for approved/pending/rejected pages */}
                  {!statusFilter && (
                    <button className={`pt-act${canGoLive(p) ? ' pt-live' : ''}`} onClick={() => canGoLive(p) && setLive({ open: true, p })} disabled={!canGoLive(p)}><Icon name="Video" size={12} /></button>
                  )}
                  {/* Approve/Reject buttons for pending products (admin only) */}
                  {statusFilter === 'pending' && (
                    <>
                      <button 
                        className="pt-act" 
                        onClick={() => onApprove && onApprove(p.product_id)}
                        title="Approve"
                        style={{ background: '#ecfdf5', borderColor: '#059669', color: '#059669' }}
                      >
                        <Icon name="Check" size={12} />
                      </button>
                      <button 
                        className="pt-act" 
                        onClick={() => onReject && onReject(p)}
                        title="Reject"
                        style={{ background: '#fef2f2', borderColor: '#dc2626', color: '#dc2626' }}
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════════ */
const ProductTable = ({
  products, onStatusToggle, onAuctionToggle, onEditProduct, onBulkAction,
  selectedProducts, onSelectProduct, onSelectAll, onCellValueUpdate, onAuctionSchedule,
  statusFilter, onApprove, onReject,
}) => {
  const [imgErrors, setImgError] = useState({});
  const [gallery, setGallery]   = useState({ open: false, p: null });
  const [sched, setSched]       = useState({ open: false, p: null });
  const [view, setView]         = useState({ open: false, p: null });
  const [live, setLive]         = useState({ open: false, p: null });

  const shared = { products, selectedProducts, onSelectProduct, onStatusToggle, onEditProduct, setGallery, setSched, setView, setLive, imgErrors, setImgError, statusFilter, onApprove, onReject };

  return (
    <div className="pt-root" style={{ width: '100%' }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {!products?.length ? (
        <div className="pt-empty">
          <div style={{ width: 68, height: 68, borderRadius: 18, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <Icon name="Package" size={30} color="#94a3b8" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#64748b', margin: '0 0 6px' }}>No products found</p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Adjust filters or add a new product</p>
        </div>
      ) : (
        <>
          <DesktopTable {...shared} onSelectAll={onSelectAll} onCellValueUpdate={onCellValueUpdate} />
          <TabletCards {...shared} onSelectAll={onSelectAll} />
          <MobileCards {...shared} />
        </>
      )}

      <ImageGalleryModal
        isOpen={gallery.open}
        onClose={() => setGallery({ open: false, p: null })}
        images={gallery.p ? getImages(gallery.p) : []}
        title={`${gallery.p?.name || 'Product'} — Images`}
      />
      <ScheduleAuctionModal
        isOpen={sched.open}
        onClose={() => setSched({ open: false, p: null })}
        product={sched.p}
        onSchedule={async d => { if (onAuctionSchedule) await onAuctionSchedule(d); setSched({ open: false, p: null }); }}
      />
      <ProductViewModal isOpen={view.open} onClose={() => setView({ open: false, p: null })} product={view.p} />
      <GoLiveModal isOpen={live.open} onClose={() => setLive({ open: false, p: null })} product={live.p} onGoLive={() => {}} />
    </div>
  );
};

export default ProductTable;