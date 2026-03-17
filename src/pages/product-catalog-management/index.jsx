import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FilterControls from './components/FilterControls';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import ProductTable from './components/ProductTable';
import ProductUploadModal from './components/ProductUploadModal';
import { getAllProductsByVendorId } from '../../services/posCrud';
import { insertRecord, uploadMultipleFiles, updatedata } from '../../services/crudService';

/* ─── Styles ─────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.pcm-root { font-family: 'DM Sans', sans-serif; background: #f1f5f9; min-height: 100vh; }
.pcm-root * { box-sizing: border-box; }

/* ── Pagination buttons ── */
.pg { display: inline-flex; align-items: center; justify-content: center; height: 36px; min-width: 36px; padding: 0 8px; border: 1.5px solid #e2e8f0; border-radius: 9px; background: #fff; color: #475569; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.13s; user-select: none; }
.pg:hover:not(:disabled):not(.pg-active) { background: #eff6ff; border-color: #93c5fd; color: #2563eb; }
.pg-active { background: #2563eb !important; border-color: #2563eb !important; color: #fff !important; box-shadow: 0 2px 10px rgba(37,99,235,0.3); }
.pg:disabled { opacity: 0.3; cursor: not-allowed; }
.pg-icon { width: 36px; }
.pg-dots { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; color: #94a3b8; font-size: 14px; letter-spacing: 0.05em; cursor: default; }
.pg-perpage { height: 36px; padding: 0 30px 0 10px; border: 1.5px solid #e2e8f0; border-radius: 9px; background: #fff; color: #475569; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; appearance: none; -webkit-appearance: none; outline: none; transition: border-color 0.13s; }
.pg-perpage:hover { border-color: #93c5fd; }

/* ── Spinner ── */
.pcm-spin { animation: pcm-rotate 0.85s linear infinite; }
@keyframes pcm-rotate { to { transform: rotate(360deg); } }

/* ── Summary chip ── */
.pcm-chip { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 5px 14px; font-size: 13px; font-weight: 600; color: #475569; white-space: nowrap; }
`;

/* ─── Utils ──────────────────────────────────────────────────────────── */
const getUserData = () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } };
const FILE_PFX = 'https://pub-a9806e1f673d447a94314a6d53e85114.r2.dev';

/* ─── Pagination ─────────────────────────────────────────────────────── */
const Pagination = ({ page, totalPages, total, perPage, onPage, onPerPage }) => {
  if (total === 0) return null;

  const from = (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  /* Smart page list with ellipsis */
  const pageList = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set([1, 2, totalPages - 1, totalPages, page - 1, page, page + 1].filter(n => n >= 1 && n <= totalPages));
    const sorted = [...set].sort((a, b) => a - b);
    const out = [];
    sorted.forEach((n, i) => {
      if (i > 0 && n - sorted[i - 1] > 1) out.push('…');
      out.push(n);
    });
    return out;
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
      background: '#fff', borderRadius: 14,
      border: '1.5px solid #e2e8f0',
      padding: '13px 18px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>

      {/* Left: range info + rows-per-page */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
          <strong style={{ color: '#0f172a' }}>{from}</strong>
          {' '}–{' '}
          <strong style={{ color: '#0f172a' }}>{to}</strong>
          {' '}of{' '}
          <strong style={{ color: '#0f172a' }}>{total}</strong>
          {' '}products
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Show</span>
          <div style={{ position: 'relative' }}>
            <select className="pg-perpage" value={perPage} onChange={e => onPerPage(+e.target.value)}>
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width={11} height={11} viewBox="0 0 11 11"><path d="M1 3l4.5 4.5L10 3" stroke="#94a3b8" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
          </div>
        </div>
      </div>

      {/* Right: page controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>

        {/* First */}
        <button className="pg pg-icon" onClick={() => onPage(1)} disabled={page === 1} title="First page" aria-label="First page">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M6 3L2 7l4 4M12 3L8 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        {/* Prev */}
        <button className="pg pg-icon" onClick={() => onPage(page - 1)} disabled={page === 1} title="Previous" aria-label="Previous page">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        {/* Page numbers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {pageList().map((item, i) =>
            item === '…' ? (
              <span key={`d${i}`} className="pg-dots">···</span>
            ) : (
              <button
                key={item}
                className={`pg${page === item ? ' pg-active' : ''}`}
                style={{ width: 36 }}
                onClick={() => onPage(item)}
                aria-label={`Page ${item}`}
                aria-current={page === item ? 'page' : undefined}
              >
                {item}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button className="pg pg-icon" onClick={() => onPage(page + 1)} disabled={page === totalPages} title="Next" aria-label="Next page">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>

        {/* Last */}
        <button className="pg pg-icon" onClick={() => onPage(totalPages)} disabled={page === totalPages} title="Last page" aria-label="Last page">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8 3l4 4-4 4M2 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════ */
const ProductCatalogManagement = ({ statusFilter }) => {
  const [products, setProducts]         = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [selected, setSelected]         = useState([]);
  const [uploadOpen, setUploadOpen]     = useState(false);
  const [editOpen, setEditOpen]         = useState(false);
  const [editingProduct, setEditing]    = useState(null);
  const [page, setPage]                 = useState(1);
  const [perPage, setPerPage]           = useState(10);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  
  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingProduct, setRejectingProduct] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  /* ── fetch ── */
  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const u = getUserData();
      if (!u?.vendorId) { setError('Vendor ID not found'); setProducts([]); setFiltered([]); return; }
      
      let res;
      // For normal products page, pass only vendorId
      // For approved/pending/rejected pages, pass auctionstatus in params
      if (statusFilter === 'approved') {
        res = await getAllProductsByVendorId(u.vendorId, 'approved');
      } else if (statusFilter === 'pending') {
        res = await getAllProductsByVendorId(u.vendorId, 'pending');
      } else if (statusFilter === 'rejected') {
        res = await getAllProductsByVendorId(u.vendorId, 'rejected');
      } else {
        // Normal products - pass only vendorId
        res = await getAllProductsByVendorId(u.vendorId);
      }
      
      const data = Array.isArray(res?.data) ? res.data : [];
      
      setProducts(data); setFiltered(data);
    } catch (err) {
      if (err?.response?.status === 204) { setProducts([]); setFiltered([]); }
      else setError(err?.response?.data?.error || 'Failed to load products');
    } finally { setLoading(false); }
  };

  // Approve product
  const approveProduct = async (productId) => {
    try {
      setLoading(true);
      await updatedata('productForm', productId, { 
        auctionstatus: 'approved',
        rejection_reason: null
      });
      await fetchAll(); // Refresh the list
    } catch (err) {
      setError('Failed to approve product');
    } finally {
      setLoading(false);
    }
  };

  // Open reject modal
  const openRejectModal = (product) => {
    setRejectingProduct(product);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  // Confirm reject
  const confirmReject = async () => {
    if (!rejectingProduct || !rejectReason.trim()) return;
    try {
      setLoading(true);
      await updatedata('productForm', rejectingProduct.product_id, { 
        auctionstatus: 'rejected',
        rejection_reason: rejectReason.trim()
      });
      setRejectModalOpen(false);
      setRejectingProduct(null);
      setRejectReason('');
      await fetchAll(); // Refresh the list
    } catch (err) {
      setError('Failed to reject product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [statusFilter]);

  /* ── filter / search ── */
  const handleFilter = f => {
    let r = [...products];
    if (f?.category)     r = r.filter(p => p?.category?.toLowerCase() === f.category.toLowerCase());
    if (f?.vendor)       r = r.filter(p => p?.seller?.toLowerCase()?.includes(f.vendor.toLowerCase()));
    if (f?.auctionStatus) r = r.filter(p => p?.auctionstatus === f.auctionStatus);
    setFiltered(r); setPage(1);
  };
  const handleSearch = q => {
    if (!q?.trim()) { setFiltered(products); setPage(1); return; }
    const lq = q.toLowerCase();
    setFiltered(products.filter(p =>
      p?.name?.toLowerCase()?.includes(lq) ||
      p?.sku?.toLowerCase()?.includes(lq) ||
      p?.seller?.toLowerCase()?.includes(lq)
    ));
    setPage(1);
  };

  /* ── helpers ── */
  const applyUpdate = patch => {
    const u = prev => prev.map(p => selected.includes(p.product_id) ? { ...p, ...patch } : p);
    setProducts(u); setFiltered(u);
  };
  const applyById = (id, patch) => {
    const u = prev => prev.map(p => p.product_id === id ? { ...p, ...patch } : p);
    setProducts(u); setFiltered(u);
  };

  /* ── status toggles ── */
  const handleStatusToggle = async id => {
    try {
      const p = products.find(x => x.product_id === id); if (!p) return;
      const ns = !p.isactive;
      const r = await updatedata('productForm', id, { isactive: ns });
      if (r.success) applyById(id, { isactive: ns });
    } catch {}
  };

  /* ── selection ── */
  const pageItems = () => filtered.slice((page - 1) * perPage, page * perPage);
  const handleSelect    = (id, s) => setSelected(prev => s ? [...prev, id] : prev.filter(x => x !== id));
  const handleSelectAll = s => {
    const ids = pageItems().map(p => p.product_id);
    setSelected(prev => s ? [...new Set([...prev, ...ids])] : prev.filter(x => !ids.includes(x)));
  };

  /* ── schedule ── */
  const handleSchedule = async data => {
    try {
      const upd = { auction_start: data.startDateTime.toISOString(), auction_end: data.endDateTime.toISOString(), starting_price: data.minBid, auction_status: 'scheduled', auctionstatus: 'scheduled' };
      const r = await updatedata('productForm', data.productId, upd);
      if (!r.success) { alert('Failed to schedule.'); return; }
      applyById(data.productId, upd);
      alert('Auction scheduled!');
    } catch { alert('Failed to schedule.'); }
  };

  /* ── cell update ── */
  const handleCellUpdate = async (pid, field, val) => {
    try {
      const MAP = { name: 'product_name', description: 'product_description', status: 'product_status', isactive: 'is_active', auctionstatus: 'auction_status' };
      const d = ['startDate', 'auction_start'].includes(field) ? { auction_start: val }
              : ['endDate', 'auction_end'].includes(field)     ? { auction_end: val }
              : { [MAP[field] || field]: val };
      const r = await updatedata('productForm', pid, d);
      if (r.success) applyById(pid, d);
    } catch {}
  };

  /* ── bulk ── */
  const handleBulk = async action => {
    if (!selected.length) return;
    try {
      setLoading(true);
      if (action === 'delete') {
        if (!window.confirm(`Delete ${selected.length} product(s)?`)) { setLoading(false); return; }
        await Promise.all(selected.map(id => updatedata('productForm', id, { is_active: false })));
        const f = prev => prev.filter(p => !selected.includes(p.product_id));
        setProducts(f); setFiltered(f);
      } else if (action === 'send-for-approval') {
        // Send rejected products back for approval - set auctionstatus to pending
        await Promise.all(selected.map(id => updatedata('productForm', id, { auctionstatus: 'pending' })));
        fetchAll(); // Refresh the list
      } else {
        const MAP = { activate: { is_active: true, isactive: true }, deactivate: { is_active: false, isactive: false }, 'start-auction': { auctionstatus: 'live' }, 'end-auction': { auctionstatus: 'ended' } };
        if (MAP[action]) {
          await Promise.all(selected.map(id => updatedata('productForm', id, MAP[action])));
          applyUpdate(MAP[action]);
        }
      }
      setSelected([]);
    } catch {} finally { setLoading(false); }
  };

  /* ── file helper ── */
  const processFiles = async (vendorId, productId, pd) => {
    const fp = {}, allF = [], tMap = {}, imgs = [...(pd.existingImageUrls || [])], vids = [...(pd.existingVideoUrls || [])];
    ['imageFiles', 'videoFiles', 'documentFiles'].forEach(k => {
      const t = k === 'imageFiles' ? 'image' : k === 'videoFiles' ? 'video' : 'document';
      (pd[k] || []).forEach(f => { allF.push(f); tMap[f.name] = t; });
    });
    if (pd.manifestFile) { allF.push(pd.manifestFile); tMap[pd.manifestFile.name] = 'manifest'; }
    if (allF.length) {
      try {
        const res = await uploadMultipleFiles(allF, `${vendorId}/Products/${productId}`);
        if (res.success) {
          const mf = [];
          allF.forEach(f => {
            const path = `${FILE_PFX}/${vendorId}/Products/${productId}/${f.name}`, t = tMap[f.name];
            if (t === 'image') imgs.push(path);
            else if (t === 'video') vids.push(path);
            else if (t === 'document') mf.push(path);
            else if (t === 'manifest') { mf.length = 0; mf.push(path); }
          });
          if (mf.length) fp.manifest_url = mf.join(',');
        }
      } catch {}
    }
    if (!pd.manifestFile && !pd.documentFiles?.length && pd.existingManifestUrl) fp.manifest_url = pd.existingManifestUrl;
    if (imgs.length) fp.image_path = imgs.join(',');
    if (vids.length) fp.video_path = vids.join(',');
    return fp;
  };

  /* ── save / edit ── */
  const handleSave = async pd => {
    try {
      const u = getUserData();
      const res = await insertRecord('productForm', { ...pd, name: pd.name || '', created_by: u?.email || '', seller_id: u?.vendorId || null, vendor_id: u?.vendorId || null, vendor_email: u?.email || '', currentBid: null, image_path: '', video_path: '', manifest_url: '' });
      if (!res.success || !res.id) { alert('Failed to create product.'); return false; }
      const fp = await processFiles(u?.vendorId, res.id, pd);
      if (Object.keys(fp).length) await updatedata('productForm', res.id, fp);
      await fetchAll(); setUploadOpen(false); alert('Product added!'); return true;
    } catch { alert('Error saving product.'); return false; }
  };

  const handleEditSave = async pd => {
    try {
      const u = getUserData(), pid = editingProduct.product_id;
      const res = await updatedata('productForm', pid, pd);
      if (!res.success) { alert('Failed to update.'); return false; }
      const fp = await processFiles(u?.vendorId, pid, pd);
      if (Object.keys(fp).length) await updatedata('productForm', pid, fp);
      await fetchAll(); setEditOpen(false); setEditing(null); alert('Product updated!'); return true;
    } catch { alert('Error updating.'); return false; }
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const handlePage = p => { setPage(Math.max(1, Math.min(p, totalPages))); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handlePerPage = n => { setPerPage(n); setPage(1); setSelected([]); };

  /* ── render ─────────────────────────────────────────────────────────── */
  return (
    <div className="pcm-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <Header />

      <main style={{ paddingTop: 64 }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '28px 24px 56px 10px' }}>
          <Breadcrumb />

          {/* ── Page header ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ width: 46, height: 46, background: '#2563eb', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 10px rgba(37,99,235,0.28)' }}>
              <Package size={22} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                {statusFilter === 'approved' ? 'Approved Products' : statusFilter === 'pending' ? 'Pending Products' : statusFilter === 'rejected' ? 'Rejected Products' : 'Product Catalog'}
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>
                {statusFilter === 'approved' ? 'View all approved product listings' : statusFilter === 'pending' ? 'Review and approve or reject products' : statusFilter === 'rejected' ? 'View rejected products and reasons' : 'Manage listings, auction controls, and inventory'}
              </p>
            </div>
            {filtered.length > 0 && (
              <div className="pcm-chip" style={{ marginLeft: 'auto' }}>
                {filtered.length} product{filtered.length !== 1 ? 's' : ''}
              </div>
            )}
            {!statusFilter && (
              <button
                onClick={() => setUploadOpen(true)}
                style={{ marginLeft: 'auto', padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 10px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                Add Product
              </button>
            )}
          </div>

          {/* ── Error ── */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 11, padding: '11px 16px', marginBottom: 18 }}>
              <svg width={16} height={16} viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.5"/><path d="M8 5v3M8 11v.5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500, flex: 1 }}>{error}</span>
              <button
                onClick={fetchAll}
                style={{ padding: '5px 14px', border: 'none', borderRadius: 7, background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Filters ── */}
          <FilterControls
            onFilterChange={handleFilter}
            onSearch={handleSearch}
            onAddProduct={() => setUploadOpen(true)}
          />

          {/* ── Bulk toolbar ── */}
          <BulkActionsToolbar
            selectedCount={selected.length}
            onBulkAction={handleBulk}
            onClearSelection={() => setSelected([])}
            onExport={() => {}}
            statusFilter={statusFilter}
          />

          {/* ── Table / Loading ── */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '72px 24px', background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ position: 'relative', width: 52, height: 52, marginBottom: 18 }}>
                <svg className="pcm-spin" viewBox="0 0 52 52" width={52} height={52}>
                  <circle cx="26" cy="26" r="22" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <circle cx="26" cy="26" r="22" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray="35 103" strokeLinecap="round" />
                </svg>
                <Package size={17} color="#2563eb" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
              </div>
              <p style={{ color: '#475569', fontWeight: 600, fontSize: 14, margin: 0 }}>Loading products…</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Table card */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <ProductTable
                  products={pageItems()}
                  onStatusToggle={handleStatusToggle}
                  onAuctionToggle={() => {}}
                  onEditProduct={id => { const p = products.find(x => x.product_id === id); if (p) { setEditing(p); setEditOpen(true); } }}
                  onBulkAction={handleBulk}
                  selectedProducts={selected}
                  onSelectProduct={handleSelect}
                  onSelectAll={handleSelectAll}
                  onCellValueUpdate={handleCellUpdate}
                  onAuctionSchedule={handleSchedule}
                  statusFilter={statusFilter}
                  onApprove={approveProduct}
                  onReject={openRejectModal}
                />
              </div>

              {/* Pagination */}
              {filtered.length > 0 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={filtered.length}
                  perPage={perPage}
                  onPage={handlePage}
                  onPerPage={handlePerPage}
                />
              )}
            </div>
          )}
        </div>
      </main>

      <ProductUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSave={handleSave}
        isEditMode={false}
      />
      <ProductUploadModal
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); setEditing(null); }}
        onSave={handleEditSave}
        initialData={editingProduct}
        isEditMode={true}
      />

      {/* Rejection Reason Modal */}
      {rejectModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 24, width: '90%', maxWidth: 420,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Reject Product</h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 16px' }}>
              Please provide a reason for rejecting <strong>{rejectingProduct?.name}</strong>
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              style={{
                width: '100%', minHeight: 100, padding: 12, borderRadius: 10, border: '1.5px solid #e2e8f0',
                fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', marginBottom: 16
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setRejectModalOpen(false); setRejectingProduct(null); }}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim() || loading}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff',
                  fontSize: 14, fontWeight: 600, cursor: rejectReason.trim() && !loading ? 'pointer' : 'not-allowed',
                  opacity: rejectReason.trim() && !loading ? 1 : 0.5
                }}
              >
                {loading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalogManagement;