import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, UserCheck, UserX, Clock, RefreshCw
} from 'lucide-react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { getAllVendors } from '../../services/posCrud';

const VendorAnalytics = () => {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    // Status distribution for pie chart
    const statusDistribution = [
      { name: 'Pending', value: vendors?.filter(v => v?.approval_status === 'pending')?.length || 0, color: '#f59e0b' },
      { name: 'Approved', value: vendors?.filter(v => v?.approval_status === 'approved')?.length || 0, color: '#10b981' },
      { name: 'Rejected', value: vendors?.filter(v => v?.approval_status === 'rejected')?.length || 0, color: '#ef4444' }
    ];

    // Vendor registrations over time (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const registrationTrend = months.map(month => {
      const count = Math.floor(Math.random() * 20) + 5; // Mock data - replace with real data
      return { month, vendors: count };
    });

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

    // Active vs Inactive (approved vendors only)
    const approvedVendors = vendors.filter(v => v?.approval_status === 'approved');
    const activeCount = approvedVendors.filter(v => v?.isactive)?.length || 0;
    const inactiveCount = approvedVendors.length - activeCount;

    const activityData = [
      { name: 'Active', value: activeCount, color: '#10b981' },
      { name: 'Inactive', value: inactiveCount, color: '#6b7280' }
    ];

    return {
      statusDistribution,
      registrationTrend,
      categoryDistribution,
      activityData
    };
  }, [vendors]);

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      pending: vendors?.filter(v => v?.approval_status === 'pending')?.length || 0,
      approved: vendors?.filter(v => v?.approval_status === 'approved')?.length || 0,
      rejected: vendors?.filter(v => v?.approval_status === 'rejected')?.length || 0,
    };
  }, [vendors]);

  // Stats for cards
  const stats = useMemo(() => {
    const totalVendors = vendors.length;
    const approvedVendors = vendors.filter(v => v?.approval_status === 'approved');
    const activeVendors = approvedVendors.filter(v => v?.isactive);
    const pendingVendors = vendors.filter(v => v?.approval_status === 'pending');
    
    // Mock growth percentages - replace with real data comparison
    return [
      {
        title: 'Total Vendors',
        value: totalVendors,
        change: '+12.5%',
        isPositive: true,
        icon: Users,
        iconBg: 'bg-blue-500',
        iconColor: 'text-blue-500'
      },
      {
        title: 'Active Vendors',
        value: activeVendors.length,
        change: '+8.2%',
        isPositive: true,
        icon: UserCheck,
        iconBg: 'bg-green-500',
        iconColor: 'text-green-500'
      },
      {
        title: 'Pending Approval',
        value: pendingVendors.length,
        change: '-3.1%',
        isPositive: false,
        icon: Clock,
        iconBg: 'bg-yellow-500',
        iconColor: 'text-yellow-500'
      },
      {
        title: 'Rejected',
        value: statusCounts.rejected,
        change: '+2.4%',
        isPositive: false,
        icon: UserX,
        iconBg: 'bg-red-500',
        iconColor: 'text-red-500'
      }
    ];
  }, [vendors, statusCounts]);

  // Fetch all vendors
  const fetchAllVendors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('📡 Fetching all vendors...');
      const response = await getAllVendors();
      console.log("✅ Fetched vendors:", response?.data?.length, "vendors");
      setVendors(response?.data || []);
      return response?.data || [];
    } catch (err) {
      if (err.response?.status === 204) {
        console.log('ℹ️ No vendors found (204)');
        setVendors([]);
        return [];
      } else {
        console.error('❌ Failed to load vendors:', err);
        setError("Failed to load vendors");
        return [];
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllVendors();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="text-blue-600" size={24} />
                  </div>
                </div>
                <p className="text-gray-600 font-medium">Loading analytics...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserX className="text-red-600" size={32} />
              </div>
              <p className="text-red-600 font-medium text-lg">{error}</p>
              <button
                onClick={fetchAllVendors}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />
          
          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Vendor Analytics Dashboard
                </h1>
                <p className="text-muted-foreground text-lg">
                  Comprehensive analytics and insights for vendor performance and distribution
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchAllVendors}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.iconBg} bg-opacity-10`}>
                      <Icon className={stat.iconColor} size={24} />
                    </div>
                    <span className={`flex items-center text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Status Distribution Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                Vendor Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {analyticsData.statusDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Trend Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                Vendor Registration Trend
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={analyticsData.registrationTrend}>
                  <defs>
                    <linearGradient id="colorVendors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="vendors" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorVendors)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                Top Vendor Categories
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analyticsData.categoryDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="count" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Active vs Inactive */}
            <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-600 to-red-600 rounded-full"></div>
                Active vs Inactive Vendors
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analyticsData.activityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {analyticsData.activityData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
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

export default VendorAnalytics;