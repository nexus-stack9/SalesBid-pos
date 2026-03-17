import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Package, IndianRupee, Zap, Clock,
  Users, UserCheck, UserX, RefreshCw, BarChart3, ShoppingBag,
  AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { getAllVendors, getAllProductsByVendorId } from '../../services/posCrud';
import { isAdmin } from '../../utils/auth';

/* ─── Design tokens ──────────────────────────────────────────────────── */
const TOKEN = {
  accent: '#2563eb',
  accentLight: '#eff6ff',
  accentMid: '#bfdbfe',
  success: '#059669',
  successLight: '#ecfdf5',
  warn: '#d97706',
  warnLight: '#fffbeb',
  danger: '#dc2626',
  dangerLight: '#fef2f2',
  neutral: '#64748b',
  neutralLight: '#f8fafc',
  border: '#e2e8f0',
  cardShadow: '0 1px 3px 0 rgba(0,0,0,.07), 0 1px 2px -1px rgba(0,0,0,.07)',
  cardShadowHover: '0 10px 24px -4px rgba(0,0,0,.10), 0 4px 8px -2px rgba(0,0,0,.06)',
};

/* ─── Tiny style tag (injected once) ─────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
    .uad-root * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
    .uad-root { background: #f1f5f9; min-height: 100vh; }
    .stat-card { transition: box-shadow .2s, transform .2s; }
    .stat-card:hover { box-shadow: ${TOKEN.cardShadowHover}; transform: translateY(-2px); }
    .tab-btn { transition: background .18s, color .18s; }
    .uad-chart-tooltip { background:#fff!important; border:1px solid ${TOKEN.border}!important; border-radius:10px!important; padding:10px 14px!important; font-size:13px!important; box-shadow:${TOKEN.cardShadow}!important; }
    .badge-up { color:#059669; background:#ecfdf5; }
    .badge-down { color:#dc2626; background:#fef2f2; }
    .section-bar { display:inline-block; width:3px; height:20px; border-radius:2px; background:${TOKEN.accent}; margin-right:10px; flex-shrink:0; }
    .spinner { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .refresh-spin { animation: spin .7s linear infinite; }
  `}</style>
);

/* ─── Reusable: Section heading ───────────────────────────────────────── */
const SectionTitle = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
    <span className="section-bar" />
    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>{children}</h3>
  </div>
);

/* ─── Reusable: Stat card ─────────────────────────────────────────────── */
const StatCard = ({ title, value, change, isPositive, icon: Icon, color, sub }) => (
  <div
    className="stat-card"
    style={{
      background: '#fff',
      border: `1px solid ${TOKEN.border}`,
      borderRadius: 14,
      padding: '22px 24px',
      boxShadow: TOKEN.cardShadow,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div
        style={{
          width: 42, height: 42, borderRadius: 10,
          background: color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={color} />
      </div>
      <span
        className={isPositive ? 'badge-up' : 'badge-down'}
        style={{
          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
          display: 'flex', alignItems: 'center', gap: 3,
        }}
      >
        {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {change}
      </span>
    </div>
    <div style={{ color: '#64748b', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', lineHeight: 1.1, marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{sub}</div>
  </div>
);

/* ─── Chart card wrapper ──────────────────────────────────────────────── */
const ChartCard = ({ title, children }) => (
  <div
    style={{
      background: '#fff',
      border: `1px solid ${TOKEN.border}`,
      borderRadius: 14,
      padding: '22px 24px',
      boxShadow: TOKEN.cardShadow,
    }}
  >
    <SectionTitle>{title}</SectionTitle>
    {children}
  </div>
);

/* ─── Legend row ──────────────────────────────────────────────────────── */
const LegendRow = ({ items }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 18 }}>
    {items.map((item, i) => (
      <div
        key={i}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#f8fafc', border: `1px solid ${TOKEN.border}`,
          borderRadius: 8, padding: '5px 12px',
        }}
      >
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{item.name}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{item.value}</span>
      </div>
    ))}
  </div>
);

const TooltipStyle = {
  contentStyle: {
    background: '#fff', border: `1px solid ${TOKEN.border}`,
    borderRadius: 10, padding: '10px 14px', fontSize: 13,
    boxShadow: TOKEN.cardShadow,
  }
};

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════ */
const UnifiedAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [vendorError, setVendorError] = useState(null);
  const [productError, setProductError] = useState(null);
  const adminAccess = isAdmin();

  const getUserData = () => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try { return JSON.parse(cachedUser); } catch { }
    }
    return null;
  };

  /* ── Product analytics ──────────────────────────────────────────────── */
  const productAnalytics = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p?.isactive).length;
    const liveAuctions = products.filter(p => p?.auctionstatus === 'live').length;
    const scheduledAuctions = products.filter(p => p?.auctionstatus === 'scheduled').length;
    const totalRevenue = products.reduce((sum, p) => sum + (parseFloat(p?.starting_price) || 0), 0);

    const auctionStatusData = [
      { name: 'Live', value: liveAuctions, color: TOKEN.success },
      { name: 'Scheduled', value: scheduledAuctions, color: TOKEN.warn },
      { name: 'Ended', value: products.filter(p => p?.auctionstatus === 'ended').length, color: '#94a3b8' },
      { name: 'Draft', value: products.filter(p => !p?.auctionstatus || p?.auctionstatus === 'draft').length, color: '#cbd5e1' },
    ];

    const categoryCount = {};
    products.forEach(p => { const c = p?.category || 'Other'; categoryCount[c] = (categoryCount[c] || 0) + 1; });
    const categoryData = Object.keys(categoryCount).slice(0, 5).map(n => ({ name: n, count: categoryCount[n] }));

    const priceRanges = [
      { range: '₹0–1K', min: 0, max: 1000, count: 0 },
      { range: '₹1K–5K', min: 1000, max: 5000, count: 0 },
      { range: '₹5K–10K', min: 5000, max: 10000, count: 0 },
      { range: '₹10K+', min: 10000, max: Infinity, count: 0 },
    ];
    products.forEach(p => {
      const price = parseFloat(p?.starting_price) || 0;
      priceRanges.forEach(r => { if (price >= r.min && price < r.max) r.count++; });
    });

    const stockData = [
      { name: 'In Stock', value: products.filter(p => (p?.quantity || 0) > 10).length, color: TOKEN.success },
      { name: 'Low Stock', value: products.filter(p => { const q = p?.quantity || 0; return q > 0 && q <= 10; }).length, color: TOKEN.warn },
      { name: 'Out of Stock', value: products.filter(p => (p?.quantity || 0) === 0).length, color: TOKEN.danger },
    ];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const activityData = months.map(month => ({ month, products: Math.floor(Math.random() * 30) + 10 }));

    return { totalProducts, activeProducts, liveAuctions, scheduledAuctions, totalRevenue, auctionStatusData, categoryData, priceRanges, stockData, activityData };
  }, [products]);

  /* ── Vendor analytics ───────────────────────────────────────────────── */
  const vendorAnalytics = useMemo(() => {
    const statusDistribution = [
      { name: 'Pending', value: vendors?.filter(v => v?.approval_status === 'pending')?.length || 0, color: TOKEN.warn },
      { name: 'Approved', value: vendors?.filter(v => v?.approval_status === 'approved')?.length || 0, color: TOKEN.success },
      { name: 'Rejected', value: vendors?.filter(v => v?.approval_status === 'rejected')?.length || 0, color: TOKEN.danger },
    ];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const registrationTrend = months.map(month => ({ month, vendors: Math.floor(Math.random() * 20) + 5 }));

    const categoryCount = {};
    vendors.forEach(v => { const c = v?.items_category || 'Other'; categoryCount[c] = (categoryCount[c] || 0) + 1; });
    const categoryDistribution = Object.keys(categoryCount).slice(0, 5).map(n => ({ name: n, count: categoryCount[n] }));

    const approvedVendors = vendors.filter(v => v?.approval_status === 'approved');
    const activeCount = approvedVendors.filter(v => v?.isactive)?.length || 0;
    const activityData = [
      { name: 'Active', value: activeCount, color: TOKEN.success },
      { name: 'Inactive', value: approvedVendors.length - activeCount, color: '#94a3b8' },
    ];

    const statusCounts = {
      pending: vendors?.filter(v => v?.approval_status === 'pending')?.length || 0,
      approved: vendors?.filter(v => v?.approval_status === 'approved')?.length || 0,
      rejected: vendors?.filter(v => v?.approval_status === 'rejected')?.length || 0,
    };

    return { statusDistribution, registrationTrend, categoryDistribution, activityData, statusCounts };
  }, [vendors]);

  /* ── Stats cards ────────────────────────────────────────────────────── */
  const productStats = useMemo(() => [
    { title: 'Total Products', value: productAnalytics.totalProducts, change: '+12.5%', isPositive: true, icon: Package, color: TOKEN.accent, sub: `${productAnalytics.activeProducts} active` },
    { title: 'Live Auctions', value: productAnalytics.liveAuctions, change: '+8.2%', isPositive: true, icon: Zap, color: TOKEN.success, sub: 'Currently running' },
    { title: 'Scheduled', value: productAnalytics.scheduledAuctions, change: '+15.3%', isPositive: true, icon: Clock, color: TOKEN.warn, sub: 'Upcoming auctions' },
    { title: 'Total Value', value: `₹${(productAnalytics.totalRevenue / 1000).toFixed(1)}K`, change: '+23.1%', isPositive: true, icon: IndianRupee, color: '#7c3aed', sub: 'Inventory value' },
  ], [productAnalytics]);

  const vendorStats = useMemo(() => {
    const totalVendors = vendors.length;
    const approvedVendors = vendors.filter(v => v?.approval_status === 'approved');
    const activeVendors = approvedVendors.filter(v => v?.isactive);
    const pendingVendors = vendors.filter(v => v?.approval_status === 'pending');
    return [
      { title: 'Total Vendors', value: totalVendors, change: '+12.5%', isPositive: true, icon: Users, color: TOKEN.accent, sub: 'All registered' },
      { title: 'Active Vendors', value: activeVendors.length, change: '+8.2%', isPositive: true, icon: UserCheck, color: TOKEN.success, sub: 'Currently active' },
      { title: 'Pending Approval', value: pendingVendors.length, change: '-3.1%', isPositive: false, icon: Clock, color: TOKEN.warn, sub: 'Awaiting review' },
      { title: 'Rejected', value: vendorAnalytics.statusCounts.rejected, change: '+2.4%', isPositive: false, icon: UserX, color: TOKEN.danger, sub: 'Not approved' },
    ];
  }, [vendors, vendorAnalytics]);

  /* ── Data fetching ──────────────────────────────────────────────────── */
  const fetchAllVendors = async () => {
    if (!adminAccess) return;
    setIsLoadingVendors(true); setVendorError(null);
    try {
      const response = await getAllVendors();
      setVendors(response?.data || []);
    } catch (err) {
      if (err.response?.status === 204) setVendors([]);
      else setVendorError("Failed to load vendors");
    } finally { setIsLoadingVendors(false); }
  };

  const fetchAllProducts = async () => {
    setIsLoadingProducts(true); setProductError(null);
    try {
      const userData = getUserData();
      if (!userData?.vendorId) { setProductError("Vendor ID not found"); setProducts([]); return; }
      const response = await getAllProductsByVendorId(userData.vendorId);
      setProducts(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      if (err.response?.status === 204) setProducts([]);
      else setProductError(err.response?.data?.error || "Failed to load products");
    } finally { setIsLoadingProducts(false); }
  };

  const handleRefresh = () => {
    if (activeTab === 'products') fetchAllProducts();
    else if (activeTab === 'vendors' && adminAccess) fetchAllVendors();
  };

  useEffect(() => {
    fetchAllProducts();
    if (adminAccess) { fetchAllVendors(); setActiveTab('products'); }
  }, []);

  const isLoading = activeTab === 'products' ? isLoadingProducts : isLoadingVendors;
  const currentError = activeTab === 'products' ? productError : vendorError;

  /* ── Full-screen loader ─────────────────────────────────────────────── */
  if (isLoading && (activeTab === 'products' ? products.length === 0 : vendors.length === 0)) {
    return (
      <div className="uad-root">
        <GlobalStyles />
        <Header />
        <main style={{ paddingTop: 64 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 60, height: 60, margin: '0 auto 20px' }}>
                <svg className="spinner" viewBox="0 0 60 60" width={60} height={60}>
                  <circle cx="30" cy="30" r="26" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <circle cx="30" cy="30" r="26" fill="none" stroke={TOKEN.accent} strokeWidth="4" strokeDasharray="40 120" strokeLinecap="round" />
                </svg>
                <BarChart3 size={22} color={TOKEN.accent} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
              </div>
              <p style={{ color: '#475569', fontWeight: 600, fontSize: 14 }}>Loading analytics…</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="uad-root">
      <GlobalStyles />
      <Header />
      <main style={{ paddingTop: 64 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 48px', paddingLeft: '5rem' }}>
          <Breadcrumb />

          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, background: TOKEN.accent, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BarChart3 size={24} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>Analytics Dashboard</h1>
                <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0', fontWeight: 400 }}>Comprehensive insights and performance metrics</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 18px', borderRadius: 9, border: `1px solid ${TOKEN.border}`,
                background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', boxShadow: TOKEN.cardShadow,
              }}
            >
              <RefreshCw size={15} className={isLoading ? 'refresh-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'inline-flex', background: '#fff', border: `1px solid ${TOKEN.border}`, borderRadius: 11, padding: 4, gap: 4, marginBottom: 28, boxShadow: TOKEN.cardShadow }}>
            {[
              { key: 'products', label: 'Product Analytics', icon: ShoppingBag },
              ...(adminAccess ? [{ key: 'vendors', label: 'Vendor Analytics', icon: Users }] : []),
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                className="tab-btn"
                onClick={() => setActiveTab(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px', borderRadius: 8, border: 'none',
                  background: activeTab === key ? TOKEN.accent : 'transparent',
                  color: activeTab === key ? '#fff' : '#64748b',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  boxShadow: activeTab === key ? `0 2px 8px ${TOKEN.accent}44` : 'none',
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Error banner */}
          {currentError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: TOKEN.dangerLight, border: `1px solid #fecaca`, borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
              <AlertCircle size={20} color={TOKEN.danger} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#7f1d1d', fontSize: 14 }}>Error Loading Data</div>
                <div style={{ color: TOKEN.danger, fontSize: 13 }}>{currentError}</div>
              </div>
              <button onClick={handleRefresh} style={{ padding: '7px 16px', background: TOKEN.danger, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Retry
              </button>
            </div>
          )}

          {/* ── PRODUCT TAB ─────────────────────────────────────────────── */}
          {activeTab === 'products' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {productStats.map((s, i) => <StatCard key={i} {...s} />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 20 }}>
                <ChartCard title="Auction Status Distribution">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={productAnalytics.auctionStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                        {productAnalytics.auctionStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip {...TooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <LegendRow items={productAnalytics.auctionStatusData} />
                </ChartCard>

                <ChartCard title="Top Product Categories">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={productAnalytics.categoryData} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TooltipStyle} />
                      <Bar dataKey="count" fill={TOKEN.accent} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Price Range Distribution">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={productAnalytics.priceRanges}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={TOKEN.accent} stopOpacity={0.18} />
                          <stop offset="100%" stopColor={TOKEN.accent} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="range" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TooltipStyle} />
                      <Area type="monotone" dataKey="count" stroke={TOKEN.accent} strokeWidth={2.5} fill="url(#priceGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Inventory Stock Status">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={productAnalytics.stockData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                        {productAnalytics.stockData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip {...TooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <LegendRow items={productAnalytics.stockData} />
                </ChartCard>
              </div>
            </div>
          )}

          {/* ── VENDOR TAB ──────────────────────────────────────────────── */}
          {activeTab === 'vendors' && adminAccess && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Admin notice */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: TOKEN.accentLight, border: `1px solid ${TOKEN.accentMid}`, borderRadius: 12, padding: '16px 22px' }}>
                <div style={{ width: 36, height: 36, background: TOKEN.accent, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: 14 }}>Admin Access Granted</div>
                  <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 2 }}>Full access to vendor analytics and management</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {vendorStats.map((s, i) => <StatCard key={i} {...s} />)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 20 }}>
                <ChartCard title="Vendor Approval Status">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={vendorAnalytics.statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                        {vendorAnalytics.statusDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip {...TooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <LegendRow items={vendorAnalytics.statusDistribution} />
                </ChartCard>

                <ChartCard title="Registration Trend">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={vendorAnalytics.registrationTrend}>
                      <defs>
                        <linearGradient id="vendorGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={TOKEN.success} stopOpacity={0.18} />
                          <stop offset="100%" stopColor={TOKEN.success} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TooltipStyle} />
                      <Area type="monotone" dataKey="vendors" stroke={TOKEN.success} strokeWidth={2.5} fill="url(#vendorGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Top Vendor Categories">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={vendorAnalytics.categoryDistribution} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TooltipStyle} />
                      <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Activity Status">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={vendorAnalytics.activityData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                        {vendorAnalytics.activityData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip {...TooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <LegendRow items={vendorAnalytics.activityData} />
                </ChartCard>
              </div>
            </div>
          )}

          {/* No access */}
          {activeTab === 'vendors' && !adminAccess && (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', border: `1px solid ${TOKEN.border}`, borderRadius: 14, boxShadow: TOKEN.cardShadow }}>
              <div style={{ width: 60, height: 60, background: '#fef9c3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <XCircle size={28} color="#ca8a04" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Access Restricted</h3>
              <p style={{ fontSize: 14, color: '#64748b' }}>Vendor analytics are only available to administrators.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UnifiedAnalyticsDashboard;