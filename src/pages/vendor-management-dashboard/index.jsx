import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, UserCheck, UserX, Clock,
  Calendar, Filter, Download, RefreshCw
} from 'lucide-react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import VendorStatusTabs from './components/VendorStatusTabs';
import VendorSearchFilters from './components/VendorSearchFilters';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import VendorTable from './components/VendorTable';
import VendorPagination from './components/VendorPagination';
import { getAllVendors, updateVendorStatus, updateVendorActiveStatus } from '../../services/posCrud';
import { deleteRecord } from '../../services/crudService';

const VendorManagementDashboard = () => {
  // State management
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

  // Filter and sort vendors
  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendors?.filter(vendor => {
      if (vendor?.approval_status !== activeTab) return false;

      if (searchQuery) {
        const query = searchQuery?.toLowerCase();
        if (!vendor?.business_name?.toLowerCase()?.includes(query) &&
            !vendor?.vendor_name?.toLowerCase()?.includes(query) &&
            !vendor?.email?.toLowerCase()?.includes(query)) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && vendor?.items_category?.toLowerCase() !== selectedCategory) {
        return false;
      }

      if (selectedDateRange !== 'all') {
        const vendorDate = new Date(vendor.created_at || vendor.registrationDate);
        const now = new Date();
        const daysDiff = Math.floor((now - vendorDate) / (1000 * 60 * 60 * 24));

        switch (selectedDateRange) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
          case 'quarter':
            if (daysDiff > 90) return false;
            break;
          case 'year':
            if (daysDiff > 365) return false;
            break;
        }
      }

      return true;
    });

    filtered?.sort((a, b) => {
      let aValue = a?.[sortConfig?.field];
      let bValue = b?.[sortConfig?.field];

      if (sortConfig?.field === 'created_date_time' || sortConfig?.field === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase();
        bValue = bValue?.toLowerCase();
      }

      if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [vendors, activeTab, searchQuery, selectedCategory, selectedDateRange, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedVendors?.length / itemsPerPage);
  const paginatedVendors = filteredAndSortedVendors?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const handleVendorActiveToggle = async (vendorId, newStatus) => {
    console.log('🔵 handleVendorActiveToggle called:', { vendorId, newStatus });

    setVendors(prevVendors => {
      const updated = prevVendors?.map(vendor =>
        vendor?.vendor_id === vendorId
          ? { ...vendor, isactive: newStatus }
          : vendor
      );
      console.log('🔄 Optimistic update applied');
      return updated;
    });

    try {
      console.log('📡 Refreshing from server...');
      await fetchAllVendors();
      console.log('✅ Server refresh completed');
    } catch (error) {
      console.error('❌ Failed to refresh from server:', error);
      setVendors(prevVendors => {
        const reverted = prevVendors?.map(vendor =>
          vendor?.vendor_id === vendorId
            ? { ...vendor, isactive: !newStatus }
            : vendor
        );
        console.log('⏪ Reverted optimistic update due to error');
        return reverted;
      });
    }
  };

  const handleTabChange = (tab) => {
    console.log('🔵 Tab changed to:', tab);
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedVendors([]);
  };

  const handleStatusChange = async (vendorId, newStatus, justification) => {
    console.log('🔵 handleStatusChange called:', { vendorId, newStatus, justification });
    
    try {
      await updateVendorStatus(vendorId, newStatus, justification);
      console.log('✅ Vendor status updated in database');
      
      await fetchAllVendors();
      console.log('✅ Vendors refreshed from database');

    } catch (error) {
      console.error("❌ Failed to update vendor status:", error);
      alert("Error updating vendor status. Please try again.");
    }
  };

  const handleBulkSelect = (vendorId, isSelected) => {
    console.log('🔵 Bulk select:', { vendorId, isSelected });
    if (isSelected) {
      setSelectedVendors(prev => [...prev, vendorId]);
    } else {
      setSelectedVendors(prev => prev?.filter(id => id !== vendorId));
    }
  };

  const handleSelectAll = (isSelected) => {
    console.log('🔵 Select all:', { isSelected, count: paginatedVendors?.length });
    if (isSelected) {
      setSelectedVendors(paginatedVendors?.map(v => v?.vendor_id));
    } else {
      setSelectedVendors([]);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedVendors.length === 0) {
      alert('Please select vendors to approve');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to approve ${selectedVendors.length} vendor(s)?`
    );
    
    if (!confirmed) return;

    setIsLoading(true);
    try {
      console.log('🔵 Bulk approving vendors:', selectedVendors);

      const results = await Promise.allSettled(
        selectedVendors.map(vendorId =>
          updateVendorStatus(vendorId, 'approved', 'Bulk approved by admin')
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`✅ Bulk approve completed: ${successful} successful, ${failed} failed`);

      await fetchAllVendors();
      setSelectedVendors([]);

      if (failed > 0) {
        alert(`Approved ${successful} vendor(s). Failed to approve ${failed} vendor(s).`);
      } else {
        alert(`Successfully approved ${successful} vendor(s)`);
      }
    } catch (error) {
      console.error('❌ Error bulk approving vendors:', error);
      alert('Failed to approve vendors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedVendors.length === 0) {
      alert('Please select vendors to reject');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to reject ${selectedVendors.length} vendor(s)?`
    );
    
    if (!confirmed) return;

    setIsLoading(true);
    try {
      console.log('🔵 Bulk rejecting vendors:', selectedVendors);

      const results = await Promise.allSettled(
        selectedVendors.map(vendorId =>
          updateVendorStatus(vendorId, 'rejected', 'Bulk rejected by admin')
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`✅ Bulk reject completed: ${successful} successful, ${failed} failed`);

      await fetchAllVendors();
      setSelectedVendors([]);

      if (failed > 0) {
        alert(`Rejected ${successful} vendor(s). Failed to reject ${failed} vendor(s).`);
      } else {
        alert(`Successfully rejected ${successful} vendor(s)`);
      }
    } catch (error) {
      console.error('❌ Error bulk rejecting vendors:', error);
      alert('Failed to reject vendors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkActivate = async () => {
    if (selectedVendors.length === 0) {
      alert('Please select vendors to activate');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to activate ${selectedVendors.length} vendor(s)?`
    );
    
    if (!confirmed) return;

    setIsLoading(true);
    try {
      console.log('🔵 Bulk activating vendors:', selectedVendors);

      const results = await Promise.allSettled(
        selectedVendors.map(vendorId =>
          updateVendorActiveStatus(vendorId, true)
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`✅ Bulk activate completed: ${successful} successful, ${failed} failed`);

      await fetchAllVendors();
      setSelectedVendors([]);

      if (failed > 0) {
        alert(`Activated ${successful} vendor(s). Failed to activate ${failed} vendor(s).`);
      } else {
        alert(`Successfully activated ${successful} vendor(s)`);
      }
    } catch (error) {
      console.error('❌ Error bulk activating vendors:', error);
      alert('Failed to activate vendors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedVendors.length === 0) {
      alert('Please select vendors to deactivate');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${selectedVendors.length} vendor(s)?`
    );
    
    if (!confirmed) return;

    setIsLoading(true);
    try {
      console.log('🔵 Bulk deactivating vendors:', selectedVendors);

      const results = await Promise.allSettled(
        selectedVendors.map(vendorId =>
          updateVendorActiveStatus(vendorId, false)
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`✅ Bulk deactivate completed: ${successful} successful, ${failed} failed`);

      await fetchAllVendors();
      setSelectedVendors([]);

      if (failed > 0) {
        alert(`Deactivated ${successful} vendor(s). Failed to deactivate ${failed} vendor(s).`);
      } else {
        alert(`Successfully deactivated ${successful} vendor(s)`);
      }
    } catch (error) {
      console.error('❌ Error bulk deactivating vendors:', error);
      alert('Failed to deactivate vendors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVendors.length === 0) {
      alert('Please select vendors to delete');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Are you sure you want to DELETE ${selectedVendors.length} vendor(s)? This action cannot be undone!`
    );
    
    if (!confirmed) return;

    setIsLoading(true);
    try {
      console.log('🔵 Bulk deleting vendors:', selectedVendors);

      const results = await Promise.allSettled(
        selectedVendors.map(vendorId =>
          deleteRecord('vendorForm', vendorId)
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`✅ Bulk delete completed: ${successful} successful, ${failed} failed`);

      await fetchAllVendors();
      setSelectedVendors([]);

      if (failed > 0) {
        alert(`Deleted ${successful} vendor(s). Failed to delete ${failed} vendor(s).`);
      } else {
        alert(`Successfully deleted ${successful} vendor(s)`);
      }
    } catch (error) {
      console.error('❌ Error bulk deleting vendors:', error);
      alert('Failed to delete vendors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDateRange('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedVendors([]);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setSelectedVendors([]);
  };

  const handleSort = (newSortConfig) => {
    setSortConfig(newSortConfig);
    setCurrentPage(1);
  };

  const handleExport = () => {
    // Export data logic
    console.log('Exporting vendor data...');
  };

  useEffect(() => {
    fetchAllVendors();
  }, []);

  useEffect(() => {
    setSelectedVendors([]);
  }, [activeTab]);

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
                  Vendor Management Dashboard
                </h1>
                <p className="text-muted-foreground text-lg">
                  Manage vendor onboarding, approvals, and status across your marketplace
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
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  <Download size={18} />
                  Export
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

          {/* Tabs */}
          <VendorStatusTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={statusCounts}
          />

          {/* Search and Filters */}
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

          {/* Bulk Actions */}
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

          {/* Loading/Error/Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="text-blue-600" size={24} />
                  </div>
                </div>
                <p className="text-gray-600 font-medium">Loading vendors...</p>
              </div>
            </div>
          ) : error ? (
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
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
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

              <div className="mt-6">
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