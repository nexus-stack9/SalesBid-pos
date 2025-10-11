import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import VendorStatusTabs from './components/VendorStatusTabs';
import VendorSearchFilters from './components/VendorSearchFilters';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import VendorTable from './components/VendorTable';
import VendorPagination from './components/VendorPagination';
import { getAllVendors } from '../../services/posCrud';

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


  // Filter and sort vendors
  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendors?.filter(vendor => {
      // Status filter
      if (vendor?.approval_status !== activeTab) return false;


      // Search filter
      if (searchQuery) {
        const query = searchQuery?.toLowerCase();
        if (!vendor?.business_name?.toLowerCase()?.includes(query) &&
            !vendor?.vendor_name?.toLowerCase()?.includes(query) &&
            !vendor?.email?.toLowerCase()?.includes(query)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && vendor?.items_category?.toLowerCase() !== selectedCategory) {
        return false;
      }

      // Date range filter (simplified for demo)
      if (selectedDateRange !== 'all') {
        const vendorDate = new Date(vendor.registrationDate);
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

    // Sort vendors
    filtered?.sort((a, b) => {
      let aValue = a?.[sortConfig?.field];
      let bValue = b?.[sortConfig?.field];

      if (sortConfig?.field === 'created_date_time') {
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
      pending: vendors?.filter(v => v?.approval_status === 'pending')?.length,
      approved: vendors?.filter(v => v?.stapproval_statusatus === 'approved')?.length,
      rejected: vendors?.filter(v => v?.stapproval_statusatus === 'rejected')?.length
    };
  }, [vendors]);

  // Event handlers
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedVendors([]);
  };

  const handleStatusChange = (vendorId, newStatus) => {
    setVendors(prevVendors =>
      prevVendors?.map(vendor => {
        if (vendor?.vendor_id === vendorId) {
          if (newStatus === 'active' || newStatus === 'inactive') {
            return { ...vendor, isActive: newStatus === 'active' };
          } else {
            return { ...vendor, status: newStatus };
          }
        }
        return vendor;
      })
    );
  };

  const handleBulkSelect = (vendorId, isSelected) => {
    if (isSelected) {
      setSelectedVendors(prev => [...prev, vendorId]);
    } else {
      setSelectedVendors(prev => prev?.filter(id => id !== vendorId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedVendors(paginatedVendors?.map(v => v?.vendor_id));

    } else {
      setSelectedVendors([]);
    }
  };

  const handleBulkApprove = () => {
    setVendors(prevVendors =>
      prevVendors?.map(vendor =>
        selectedVendors?.includes(vendor?.vendor_id)
          ? { ...vendor, status: 'approved', isActive: true }
          : vendor
      )
    );
    setSelectedVendors([]);
  };

  const handleBulkReject = () => {
    setVendors(prevVendors =>
      prevVendors?.map(vendor =>
        selectedVendors?.includes(vendor?.vendor_id)
          ? { ...vendor, status: 'rejected', isActive: false }
          : vendor
      )
    );
    setSelectedVendors([]);
  };

  const handleBulkDelete = () => {
    setVendors(prevVendors =>
      prevVendors?.filter(vendor => !selectedVendors?.includes(vendor?.vendor_id))
    );
    setSelectedVendors([]);
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

  const fetchAllVendors = async () => { 
      try {
        const response = await getAllVendors();
        console.log("Fetched vendors:", response?.data);
        setVendors(response?.data);
      } catch (err) {
        if (err.response?.status === 204) {
        } else {
          setError("Failed to load products");
        }
      } finally {
      }
    };

  // Clear selection when tab changes
  useEffect(() => {
    fetchAllVendors();
    setSelectedVendors([]);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Vendor Management Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage vendor onboarding, approvals, and status across your marketplace
            </p>
          </div>

          <VendorStatusTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={statusCounts}
          />

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

          <BulkActionsToolbar
            selectedCount={selectedVendors?.length}
            onBulkApprove={handleBulkApprove}
            onBulkReject={handleBulkReject}
            onBulkDelete={handleBulkDelete}
            onClearSelection={() => setSelectedVendors([])}
          />

          <VendorTable
            vendors={paginatedVendors}
            onStatusChange={handleStatusChange}
            onBulkSelect={handleBulkSelect}
            selectedVendors={selectedVendors}
            onSelectAll={handleSelectAll}
            sortConfig={sortConfig}
            onSort={handleSort}
          />

          <VendorPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAndSortedVendors?.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </main>
    </div>
  );
};

export default VendorManagementDashboard;