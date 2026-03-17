import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserX } from 'lucide-react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import VendorStatusTabs from './components/VendorStatusTabs';
import VendorSearchFilters from './components/VendorSearchFilters';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import VendorTable from './components/VendorTable';
import VendorPagination from './components/VendorPagination';
import { getAllVendors, updateVendorStatus, updateVendorActiveStatus } from '../../services/posCrud';
import { deleteRecord } from '../../services/crudService';

/* ─── Design tokens ──────────────────────────────────────────────────── */
const TOKEN = {
  accent: '#2563eb',
  accentLight: '#eff6ff',
  danger: '#dc2626',
  dangerLight: '#fef2f2',
  border: '#e2e8f0',
  cardShadow: '0 1px 3px 0 rgba(0,0,0,.07), 0 1px 2px -1px rgba(0,0,0,.07)',
};

/* ─── Global styles ───────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
    .vmd-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
    .vmd-root { background: #f1f5f9; min-height: 100vh; }
    .spinner { animation: spin .9s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `}</style>
);

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════ */
const VendorManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ field: 'created_date_time', direction: 'desc' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /* ── Filter + sort ──────────────────────────────────────────────────── */
  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendors?.filter(vendor => {
      if (vendor?.approval_status !== activeTab) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!vendor?.business_name?.toLowerCase()?.includes(q) &&
            !vendor?.vendor_name?.toLowerCase()?.includes(q) &&
            !vendor?.email?.toLowerCase()?.includes(q)) return false;
      }
      if (selectedCategory !== 'all' && vendor?.items_category?.toLowerCase() !== selectedCategory) return false;
      if (selectedDateRange !== 'all') {
        const vendorDate = new Date(vendor.created_at || vendor.registrationDate);
        const daysDiff = Math.floor((new Date() - vendorDate) / (1000 * 60 * 60 * 24));
        const limits = { today: 0, week: 7, month: 30, quarter: 90, year: 365 };
        if (daysDiff > (limits[selectedDateRange] ?? Infinity)) return false;
      }
      return true;
    });

    filtered?.sort((a, b) => {
      let aVal = a?.[sortConfig.field], bVal = b?.[sortConfig.field];
      if (['created_date_time', 'created_at'].includes(sortConfig.field)) { aVal = new Date(aVal); bVal = new Date(bVal); }
      else if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal?.toLowerCase(); }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [vendors, activeTab, searchQuery, selectedCategory, selectedDateRange, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedVendors?.length / itemsPerPage);
  const paginatedVendors = filteredAndSortedVendors?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusCounts = useMemo(() => ({
    pending: vendors?.filter(v => v?.approval_status === 'pending')?.length || 0,
    approved: vendors?.filter(v => v?.approval_status === 'approved')?.length || 0,
    rejected: vendors?.filter(v => v?.approval_status === 'rejected')?.length || 0,
  }), [vendors]);

  /* ── Data fetching ──────────────────────────────────────────────────── */
  const fetchAllVendors = async () => {
    setIsLoading(true); setError(null);
    try {
      const response = await getAllVendors();
      setVendors(response?.data || []);
      return response?.data || [];
    } catch (err) {
      if (err.response?.status === 204) { setVendors([]); return []; }
      setError("Failed to load vendors"); return [];
    } finally { setIsLoading(false); }
  };

  const handleVendorActiveToggle = async (vendorId, newStatus) => {
    setVendors(prev => prev.map(v => v?.vendor_id === vendorId ? { ...v, isactive: newStatus } : v));
    try { await fetchAllVendors(); }
    catch { setVendors(prev => prev.map(v => v?.vendor_id === vendorId ? { ...v, isactive: !newStatus } : v)); }
  };

  const handleTabChange = (tab) => { setActiveTab(tab); setCurrentPage(1); setSelectedVendors([]); };

  const handleStatusChange = async (vendorId, newStatus, justification) => {
    try {
      await updateVendorStatus(vendorId, newStatus, justification);
      await fetchAllVendors();
    } catch { alert("Error updating vendor status. Please try again."); }
  };

  const handleBulkSelect = (vendorId, isSelected) => {
    setSelectedVendors(prev => isSelected ? [...prev, vendorId] : prev.filter(id => id !== vendorId));
  };

  const handleSelectAll = (isSelected) => {
    setSelectedVendors(isSelected ? paginatedVendors?.map(v => v?.vendor_id) : []);
  };

  const runBulk = async (label, fn) => {
    if (!selectedVendors.length) { alert(`Please select vendors to ${label}`); return; }
    if (!window.confirm(`Are you sure you want to ${label} ${selectedVendors.length} vendor(s)?`)) return;
    setIsLoading(true);
    try {
      const results = await Promise.allSettled(selectedVendors.map(fn));
      const ok = results.filter(r => r.status === 'fulfilled').length;
      const fail = results.filter(r => r.status === 'rejected').length;
      await fetchAllVendors();
      setSelectedVendors([]);
      alert(fail > 0 ? `${label} ${ok} vendor(s). Failed: ${fail}.` : `Successfully ${label}d ${ok} vendor(s).`);
    } catch { alert(`Failed to ${label} vendors.`); }
    finally { setIsLoading(false); }
  };

  const handleBulkApprove = () => runBulk('approve', id => updateVendorStatus(id, 'approved', 'Bulk approved by admin'));
  const handleBulkReject = () => runBulk('reject', id => updateVendorStatus(id, 'rejected', 'Bulk rejected by admin'));
  const handleBulkActivate = () => runBulk('activate', id => updateVendorActiveStatus(id, true));
  const handleBulkDeactivate = () => runBulk('deactivate', id => updateVendorActiveStatus(id, false));
  const handleBulkDelete = async () => {
    if (!selectedVendors.length) { alert('Please select vendors to delete'); return; }
    if (!window.confirm(`⚠️ DELETE ${selectedVendors.length} vendor(s)? This cannot be undone!`)) return;
    setIsLoading(true);
    try {
      const results = await Promise.allSettled(selectedVendors.map(id => deleteRecord('vendorForm', id)));
      const ok = results.filter(r => r.status === 'fulfilled').length;
      const fail = results.filter(r => r.status === 'rejected').length;
      await fetchAllVendors();
      setSelectedVendors([]);
      alert(fail > 0 ? `Deleted ${ok}. Failed: ${fail}.` : `Deleted ${ok} vendor(s).`);
    } catch { alert('Failed to delete vendors.'); }
    finally { setIsLoading(false); }
  };

  const handleClearFilters = () => { setSearchQuery(''); setSelectedCategory('all'); setSelectedDateRange('all'); setCurrentPage(1); };
  const handlePageChange = (page) => { setCurrentPage(page); setSelectedVendors([]); };
  const handleItemsPerPageChange = (n) => { setItemsPerPage(n); setCurrentPage(1); setSelectedVendors([]); };
  const handleSort = (cfg) => { setSortConfig(cfg); setCurrentPage(1); };

  useEffect(() => { fetchAllVendors(); }, []);
  useEffect(() => { setSelectedVendors([]); }, [activeTab]);

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="vmd-root">
      <GlobalStyles />
      <Header />
      <main style={{ paddingTop: 64 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 48px' }}>
          <Breadcrumb />

          {/* Page header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, background: TOKEN.accent, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={24} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>
                  Vendor Management
                </h1>
                <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
                  Manage vendor onboarding, approvals, and status across your marketplace
                </p>
              </div>
            </div>
          </div>

          {/* Status tabs */}
          <VendorStatusTabs activeTab={activeTab} onTabChange={handleTabChange} counts={statusCounts} />

          {/* Search + filters */}
          <VendorSearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
            onClearFilters={handleClearFilters}
            resultsCount={filteredAndSortedVendors?.length}
          />

          {/* Bulk actions */}
          <BulkActionsToolbar
            selectedCount={selectedVendors?.length}
            activeTab={activeTab}
            onBulkApprove={handleBulkApprove}
            onBulkReject={handleBulkReject}
            onBulkActivate={handleBulkActivate}
            onBulkDeactivate={handleBulkDeactivate}
            onBulkDelete={handleBulkDelete}
            onClearSelection={() => setSelectedVendors([])}
          />

          {/* Loading / Error / Table */}
          {isLoading ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '64px 24px', background: '#fff', borderRadius: 14,
              border: `1px solid ${TOKEN.border}`, boxShadow: TOKEN.cardShadow,
            }}>
              <div style={{ position: 'relative', width: 52, height: 52, marginBottom: 18 }}>
                <svg className="spinner" viewBox="0 0 52 52" width={52} height={52}>
                  <circle cx="26" cy="26" r="22" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <circle cx="26" cy="26" r="22" fill="none" stroke={TOKEN.accent} strokeWidth="4" strokeDasharray="34 100" strokeLinecap="round" />
                </svg>
                <Users size={18} color={TOKEN.accent} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
              </div>
              <p style={{ color: '#475569', fontWeight: 600, fontSize: 14, margin: 0 }}>Loading vendors…</p>
            </div>
          ) : error ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '56px 24px', background: TOKEN.dangerLight, borderRadius: 14,
              border: `1px solid #fecaca`, boxShadow: TOKEN.cardShadow,
            }}>
              <div style={{ width: 52, height: 52, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <UserX size={24} color={TOKEN.danger} />
              </div>
              <p style={{ color: TOKEN.danger, fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{error}</p>
              <button
                onClick={fetchAllVendors}
                style={{ padding: '9px 22px', background: TOKEN.danger, color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div style={{
                background: '#fff', borderRadius: 14,
                border: `1px solid ${TOKEN.border}`,
                boxShadow: TOKEN.cardShadow,
                overflow: 'hidden',
              }}>
                <VendorTable
                  vendors={paginatedVendors}
                  onStatusChange={handleStatusChange}
                  onBulkSelect={handleBulkSelect}
                  selectedVendors={selectedVendors}
                  onSelectAll={handleSelectAll}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onVendorActiveToggle={handleVendorActiveToggle}
                />
              </div>
              <div style={{ marginTop: 20 }}>
                <VendorPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredAndSortedVendors?.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default VendorManagementDashboard;