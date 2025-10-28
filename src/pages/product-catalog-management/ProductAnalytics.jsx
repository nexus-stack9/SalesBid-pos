import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Package, IndianRupee, Zap, Clock, RefreshCw
} from 'lucide-react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { getAllProductsByVendorId } from '../../services/posCrud';

const ProductAnalytics = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    // Total stats
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
      { range: '₹0-1000', min: 0, max: 1000, count: 0 },
      { range: '₹1000-5000', min: 1000, max: 5000, count: 0 },
      { range: '₹5000-10000', min: 5000, max: 10000, count: 0 },
      { range: '₹10000+', min: 10000, max: Infinity, count: 0 }
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

    // Recent activity (mock data - replace with real timestamps)
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

  // Stats for cards
  const stats = useMemo(() => {
    return [
      {
        title: 'Total Products',
        value: analyticsData.totalProducts,
        change: '+12.5%',
        isPositive: true,
        icon: Package,
        iconBg: 'bg-blue-500',
        iconColor: 'text-blue-500',
        description: `${analyticsData.activeProducts} active`
      },
      {
        title: 'Live Auctions',
        value: analyticsData.liveAuctions,
        change: '+8.2%',
        isPositive: true,
        icon: Zap,
        iconBg: 'bg-green-500',
        iconColor: 'text-green-500',
        description: 'Currently running'
      },
      {
        title: 'Scheduled',
        value: analyticsData.scheduledAuctions,
        change: '+15.3%',
        isPositive: true,
        icon: Clock,
        iconBg: 'bg-yellow-500',
        iconColor: 'text-yellow-500',
        description: 'Upcoming auctions'
      },
      {
        title: 'Total Value',
        value: `₹${(analyticsData.totalRevenue / 1000).toFixed(1)}K`,
        change: '+23.1%',
        isPositive: true,
        icon: IndianRupee,
        iconBg: 'bg-purple-500',
        iconColor: 'text-purple-500',
        description: 'Inventory value'
      }
    ];
  }, [analyticsData]);

  const fetchAllProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = getUserData();
      
      if (!userData?.vendorId) {
        setError("Vendor ID not found");
        setProducts([]);
        setIsLoading(false);
        return;
      }

      const response = await getAllProductsByVendorId(userData.vendorId);
      
      if (response?.data && Array.isArray(response.data)) {
        setProducts(response.data);
        console.log(`✅ Loaded ${response.data.length} products`);
      } else {
        setProducts([]);
        console.log("⚠️ No products found or invalid data format");
      }
      
    } catch (err) {
      console.error("❌ Error details:", err);
      
      if (err.response?.status === 204) {
        console.log("ℹ️ 204: No products available for this vendor");
        setProducts([]);
      } else {
        setError(err.response?.data?.error || "Failed to load products");
        setProducts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-purple-600 mx-auto mb-6"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="text-purple-600" size={32} />
                  </div>
                </div>
                <p className="text-gray-600 font-semibold text-lg">Loading analytics...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-red-600" size={32} />
              </div>
              <p className="text-red-600 font-medium text-lg">{error}</p>
              <button
                onClick={fetchAllProducts}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb />
          
          {/* Enhanced Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  Product Analytics Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                  Comprehensive analytics and insights for your product catalog and auctions
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={fetchAllProducts}
                  className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm font-medium"
                >
                  <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.iconBg} bg-opacity-10`}>
                      <Icon className={stat.iconColor} size={28} />
                    </div>
                    <span className={`flex items-center text-sm font-semibold px-2.5 py-1 rounded-full ${stat.isPositive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                      {stat.isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Auction Status Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                Auction Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analyticsData.auctionStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.auctionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {analyticsData.auctionStatusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                Top Categories
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analyticsData.categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
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
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                Price Range Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={analyticsData.priceRanges}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="range" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#a855f7" 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Stock Status */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-orange-600 to-red-600 rounded-full"></div>
                Stock Status
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analyticsData.stockData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.stockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {analyticsData.stockData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductAnalytics;