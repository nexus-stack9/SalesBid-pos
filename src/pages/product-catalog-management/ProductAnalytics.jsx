import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Package, IndianRupee, Zap, Clock, 
  Users, UserCheck, UserX, RefreshCw, BarChart3, ShoppingBag,
  AlertCircle, CheckCircle, XCircle, TrendingDown as TrendDown
} from 'lucide-react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { getAllVendors, getAllProductsByVendorId } from '../../services/posCrud';
import { isAdmin } from '../../utils/auth';

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
      try {
        return JSON.parse(cachedUser);
      } catch (error) {
        console.error('Error parsing cached user data:', error);
      }
    }
    return null;
  };

  // ==================== PRODUCT ANALYTICS ====================
  const productAnalytics = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p?.isactive).length;
    const liveAuctions = products.filter(p => p?.auctionstatus === 'live').length;
    const scheduledAuctions = products.filter(p => p?.auctionstatus === 'scheduled').length;
    const totalRevenue = products.reduce((sum, p) => sum + (parseFloat(p?.starting_price) || 0), 0);

    // Auction status distribution
    const auctionStatusData = [
      { name: 'Live', value: liveAuctions, color: '#10b981' },
      { name: 'Scheduled', value: scheduledAuctions, color: '#f59e0b' },
      { name: 'Ended', value: products.filter(p => p?.auctionstatus === 'ended').length, color: '#6b7280' },
      { name: 'Draft', value: products.filter(p => !p?.auctionstatus || p?.auctionstatus === 'draft').length, color: '#94a3b8' }
    ];

    // Category distribution
    const categoryCount = {};
    products.forEach(product => {
      const category = product?.category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const categoryData = Object.keys(categoryCount).slice(0, 5).map(category => ({
      name: category,
      count: categoryCount[category]
    }));

    // Price range distribution
    const priceRanges = [
      { range: '₹0-1K', min: 0, max: 1000, count: 0 },
      { range: '₹1K-5K', min: 1000, max: 5000, count: 0 },
      { range: '₹5K-10K', min: 5000, max: 10000, count: 0 },
      { range: '₹10K+', min: 10000, max: Infinity, count: 0 }
    ];

    products.forEach(product => {
      const price = parseFloat(product?.starting_price) || 0;
      priceRanges.forEach(range => {
        if (price >= range.min && price < range.max) {
          range.count++;
        }
      });
    });

    // Stock status
    const stockData = [
      { name: 'In Stock', value: products.filter(p => (p?.quantity || 0) > 10).length, color: '#10b981' },
      { name: 'Low Stock', value: products.filter(p => {
        const qty = p?.quantity || 0;
        return qty > 0 && qty <= 10;
      }).length, color: '#f59e0b' },
      { name: 'Out of Stock', value: products.filter(p => (p?.quantity || 0) === 0).length, color: '#ef4444' }
    ];

    // Monthly trend (mock data)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const activityData = months.map(month => ({
      month,
      products: Math.floor(Math.random() * 30) + 10
    }));

    return {
      totalProducts,
      activeProducts,
      liveAuctions,
      scheduledAuctions,
      totalRevenue,
      auctionStatusData,
      categoryData,
      priceRanges,
      stockData,
      activityData
    };
  }, [products]);

  // ==================== VENDOR ANALYTICS ====================
  const vendorAnalytics = useMemo(() => {
    const statusDistribution = [
      { name: 'Pending', value: vendors?.filter(v => v?.approval_status === 'pending')?.length || 0, color: '#f59e0b' },
      { name: 'Approved', value: vendors?.filter(v => v?.approval_status === 'approved')?.length || 0, color: '#10b981' },
      { name: 'Rejected', value: vendors?.filter(v => v?.approval_status === 'rejected')?.length || 0, color: '#ef4444' }
    ];

    // Vendor registrations over time
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const registrationTrend = months.map(month => ({
      month,
      vendors: Math.floor(Math.random() * 20) + 5
    }));

    // Category distribution
    const categoryCount = {};
    vendors.forEach(vendor => {
      const category = vendor?.items_category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const categoryDistribution = Object.keys(categoryCount).slice(0, 5).map(category => ({
      name: category,
      count: categoryCount[category]
    }));

    // Active vs Inactive
    const approvedVendors = vendors.filter(v => v?.approval_status === 'approved');
    const activeCount = approvedVendors.filter(v => v?.isactive)?.length || 0;
    const inactiveCount = approvedVendors.length - activeCount;

    const activityData = [
      { name: 'Active', value: activeCount, color: '#10b981' },
      { name: 'Inactive', value: inactiveCount, color: '#6b7280' }
    ];

    const statusCounts = {
      pending: vendors?.filter(v => v?.approval_status === 'pending')?.length || 0,
      approved: vendors?.filter(v => v?.approval_status === 'approved')?.length || 0,
      rejected: vendors?.filter(v => v?.approval_status === 'rejected')?.length || 0,
    };

    return {
      statusDistribution,
      registrationTrend,
      categoryDistribution,
      activityData,
      statusCounts
    };
  }, [vendors]);

  // ==================== STATS CARDS ====================
  const productStats = useMemo(() => [
    {
      title: 'Total Products',
      value: productAnalytics.totalProducts,
      change: '+12.5%',
      isPositive: true,
      icon: Package,
      iconBg: 'bg-blue-500',
      iconColor: 'text-blue-500',
      description: `${productAnalytics.activeProducts} active`
    },
    {
      title: 'Live Auctions',
      value: productAnalytics.liveAuctions,
      change: '+8.2%',
      isPositive: true,
      icon: Zap,
      iconBg: 'bg-green-500',
      iconColor: 'text-green-500',
      description: 'Currently running'
    },
    {
      title: 'Scheduled',
      value: productAnalytics.scheduledAuctions,
      change: '+15.3%',
      isPositive: true,
      icon: Clock,
      iconBg: 'bg-yellow-500',
      iconColor: 'text-yellow-500',
      description: 'Upcoming auctions'
    },
    {
      title: 'Total Value',
      value: `₹${(productAnalytics.totalRevenue / 1000).toFixed(1)}K`,
      change: '+23.1%',
      isPositive: true,
      icon: IndianRupee,
      iconBg: 'bg-purple-500',
      iconColor: 'text-purple-500',
      description: 'Inventory value'
    }
  ], [productAnalytics]);

  const vendorStats = useMemo(() => {
    const totalVendors = vendors.length;
    const approvedVendors = vendors.filter(v => v?.approval_status === 'approved');
    const activeVendors = approvedVendors.filter(v => v?.isactive);
    const pendingVendors = vendors.filter(v => v?.approval_status === 'pending');

    return [
      {
        title: 'Total Vendors',
        value: totalVendors,
        change: '+12.5%',
        isPositive: true,
        icon: Users,
        iconBg: 'bg-blue-500',
        iconColor: 'text-blue-500',
        description: 'All registered'
      },
      {
        title: 'Active Vendors',
        value: activeVendors.length,
        change: '+8.2%',
        isPositive: true,
        icon: UserCheck,
        iconBg: 'bg-green-500',
        iconColor: 'text-green-500',
        description: 'Currently active'
      },
      {
        title: 'Pending Approval',
        value: pendingVendors.length,
        change: '-3.1%',
        isPositive: false,
        icon: Clock,
        iconBg: 'bg-yellow-500',
        iconColor: 'text-yellow-500',
        description: 'Awaiting review'
      },
      {
        title: 'Rejected',
        value: vendorAnalytics.statusCounts.rejected,
        change: '+2.4%',
        isPositive: false,
        icon: UserX,
        iconBg: 'bg-red-500',
        iconColor: 'text-red-500',
        description: 'Not approved'
      }
    ];
  }, [vendors, vendorAnalytics]);

  // ==================== DATA FETCHING ====================
  const fetchAllVendors = async () => {
    if (!adminAccess) return;
    
    setIsLoadingVendors(true);
    setVendorError(null);
    try {
      console.log('📡 Fetching all vendors...');
      const response = await getAllVendors();
      console.log("✅ Fetched vendors:", response?.data?.length, "vendors");
      setVendors(response?.data || []);
    } catch (err) {
      if (err.response?.status === 204) {
        console.log('ℹ️ No vendors found (204)');
        setVendors([]);
      } else {
        console.error('❌ Failed to load vendors:', err);
        setVendorError("Failed to load vendors");
      }
    } finally {
      setIsLoadingVendors(false);
    }
  };

  const fetchAllProducts = async () => {
    setIsLoadingProducts(true);
    setProductError(null);
    try {
      const userData = getUserData();
      
      if (!userData?.vendorId) {
        setProductError("Vendor ID not found");
        setProducts([]);
        return;
      }

      console.log('📡 Fetching products for vendor:', userData.vendorId);
      const response = await getAllProductsByVendorId(userData.vendorId);
      
      if (response?.data && Array.isArray(response.data)) {
        setProducts(response.data);
        console.log(`✅ Loaded ${response.data.length} products`);
      } else {
        setProducts([]);
        console.log("⚠️ No products found");
      }
    } catch (err) {
      console.error("❌ Error loading products:", err);
      
      if (err.response?.status === 204) {
        console.log("ℹ️ No products available");
        setProducts([]);
      } else {
        setProductError(err.response?.data?.error || "Failed to load products");
      }
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'products') {
      fetchAllProducts();
    } else if (activeTab === 'vendors' && adminAccess) {
      fetchAllVendors();
    }
  };

  useEffect(() => {
    fetchAllProducts();
    if (adminAccess) {
      fetchAllVendors();
      setActiveTab('products'); // Default to products
    }
  }, []);

  // ==================== LOADING STATE ====================
  const isLoading = activeTab === 'products' ? isLoadingProducts : isLoadingVendors;
  const currentError = activeTab === 'products' ? productError : vendorError;

  if (isLoading && (activeTab === 'products' ? products.length === 0 : vendors.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{paddingLeft: '5rem'}}>
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BarChart3 className="text-blue-600" size={32} />
                  </div>
                </div>
                <p className="text-gray-600 font-semibold text-lg">Loading analytics data...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{paddingLeft: '5rem'}}>
          <Breadcrumb />
          
          {/* ==================== HEADER ==================== */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <BarChart3 className="text-white" size={32} />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                </div>
                <p className="text-gray-600 text-lg">
                  Comprehensive insights and performance metrics for your business
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRefresh}
                  className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm font-medium"
                >
                  <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* ==================== TABS ==================== */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200 inline-flex gap-2">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'products'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ShoppingBag size={20} />
                Product Analytics
              </button>
              {adminAccess && (
                <button
                  onClick={() => setActiveTab('vendors')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeTab === 'vendors'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users size={20} />
                  Vendor Analytics
                </button>
              )}
            </div>
          </div>

          {/* ==================== ERROR STATE ==================== */}
          {currentError && (
            <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-900 font-semibold text-lg mb-1">Error Loading Data</h3>
                  <p className="text-red-600">{currentError}</p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* ==================== PRODUCT ANALYTICS ==================== */}
          {activeTab === 'products' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {productStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105 hover:-translate-y-1 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${stat.iconBg} bg-opacity-10`}>
                          <Icon className={stat.iconColor} size={28} />
                        </div>
                        <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                          stat.isPositive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                        }`}>
                          {stat.isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                          {stat.change}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                        <p className="text-xs text-gray-400 font-medium">{stat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Auction Status Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                    <h3 className="text-xl font-bold text-gray-900">Auction Status Distribution</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={productAnalytics.auctionStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {productAnalytics.auctionStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '12px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    {productAnalytics.auctionStatusData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                    <h3 className="text-xl font-bold text-gray-900">Top Product Categories</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={productAnalytics.categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '12px'
                        }} 
                      />
                      <Bar dataKey="count" fill="url(#colorBar)" radius={[10, 10, 0, 0]} />
                      <defs>
                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Price Range Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                    <h3 className="text-xl font-bold text-gray-900">Price Range Distribution</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={productAnalytics.priceRanges}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="range" stroke="#888" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '12px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#a855f7" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Stock Status */}
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-orange-600 to-red-600 rounded-full"></div>
                    <h3 className="text-xl font-bold text-gray-900">Inventory Stock Status</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={productAnalytics.stockData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {productAnalytics.stockData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '12px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    {productAnalytics.stockData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VENDOR ANALYTICS (ADMIN ONLY) ==================== */}
          {activeTab === 'vendors' && adminAccess && (
            <div className="space-y-8">
              {/* Admin Badge */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Admin Access Granted</h3>
                    <p className="text-blue-100">You have full access to vendor analytics and management</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {vendorStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105 hover:-translate-y-1 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${stat.iconBg} bg-opacity-10`}>
                          <Icon className={stat.iconColor} size={28} />
                        </div>
                        <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                          stat.isPositive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                        }`}>
                          {stat.isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                          {stat.change}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                        <p className="text-xs text-gray-400 font-medium">{stat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                    <h3 className="text-xl font-bold text-gray-900">Vendor Approval Status</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={vendorAnalytics.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {vendorAnalytics.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '12px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    {vendorAnalytics.statusDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Registration Trend */}
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                    <h3 className="text-xl font-bold text-gray-900">Registration Trend</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={vendorAnalytics.registrationTrend}>
                      <defs>
                        <linearGradient id="colorVendors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#888" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '12px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="vendors" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorVendors)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                    <h3 className="text-xl font-bold text-gray-900">Top Vendor Categories</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={vendorAnalytics.categoryDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#888" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '12px'
                        }} 
                      />
                      <Bar dataKey="count" fill="url(#colorVendorBar)" radius={[10, 10, 0, 0]} />
                      <defs>
                        <linearGradient id="colorVendorBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Active vs Inactive */}
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-orange-600 to-red-600 rounded-full"></div>
                    <h3 className="text-xl font-bold text-gray-900">Activity Status</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={vendorAnalytics.activityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {vendorAnalytics.activityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '12px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    {vendorAnalytics.activityData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== NO ACCESS MESSAGE ==================== */}
          {activeTab === 'vendors' && !adminAccess && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="text-yellow-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-yellow-900 mb-3">Access Restricted</h3>
              <p className="text-yellow-700 text-lg">
                Vendor analytics are only available to administrators.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UnifiedAnalyticsDashboard;