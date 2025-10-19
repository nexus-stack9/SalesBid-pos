// OrderManagementSystem.jsx
import React, { useState, useMemo, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import OrderStats from './components/OrderStats';
import OrderFilters from './components/OrderFilters';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import OrderTable from './components/OrderTable';
import OrderDetailsModal from './components/OrderDetailsModal';
import { 
  getAllOrderMatrixByVendorId, 
  getAllOrderByVendorId,
  updateOrderStatus,
  bulkUpdateOrderStatus,
  exportOrders
} from '../../services/orderService';

const OrderManagementSystem = () => {
  // Get vendorId from auth context or props
  const vendorId = localStorage.getItem('vendorId') || 1; // Replace with actual auth

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'order_date', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    vendor: 'all',
    dateRange: 'all',
    minValue: '',
    maxValue: ''
  });

  // Fetch orders and stats on mount
  useEffect(() => {
    fetchOrdersAndStats();
  }, [vendorId]);

  const fetchOrdersAndStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersResponse, statsResponse] = await Promise.all([
        getAllOrderByVendorId(vendorId),
        getAllOrderMatrixByVendorId(vendorId)
      ]);

      // Transform orders data to match component structure
      const transformedOrders = transformOrdersData(ordersResponse);
      setOrders(transformedOrders);

      // Transform stats data
      const transformedStats = transformStatsData(statsResponse);
      setStats(transformedStats);

    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const transformOrdersData = (apiOrders) => {
    if (!Array.isArray(apiOrders)) return [];

    return apiOrders.map(order => ({
      id: order.order_id?.toString(),
      orderId: order.order_id,
      customer: {
        name: order.buyer_name || 'N/A',
        email: order.buyer_email || 'N/A',
        phone: order.buyer_phone || 'N/A'
      },
      product: {
        id: order.product_id,
        name: order.product_name || order.name || 'N/A',
        image: order.image_path || 'https://via.placeholder.com/400',
        quantity: order.quantity || 1
      },
      items: order.bids ? JSON.parse(order.bids).map(bid => ({
        name: order.product_name || order.name,
        image: order.image_path || 'https://via.placeholder.com/400',
        vendor: order.seller || order.seller_name || 'N/A',
        quantity: 1,
        price: order.amount || 0
      })) : [{
        name: order.product_name || order.name || 'Product',
        image: order.image_path || 'https://via.placeholder.com/400',
        vendor: order.seller || order.seller_name || 'N/A',
        quantity: order.quantity || 1,
        price: order.amount || 0
      }],
      subtotal: order.amount || 0,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: order.amount || 0,
      status: mapOrderStatus(order.order_status),
      date: new Date(order.order_date),
      paymentMethod: order.payment_method || 'N/A',
      paymentStatus: order.payment_status || 'pending',
      transactionId: order.transaction_id || 'N/A',
      trackingNumber: order.tracking_number || null,
      carrier: order.carrier || null,
      estimatedDelivery: order.estimated_delivery ? new Date(order.estimated_delivery) : null,
      shippingAddress: {
        street: order.shipping_address || 'N/A',
        city: order.city || 'N/A',
        state: order.state || 'N/A',
        zip: order.pincode || order.seller_pincode || 'N/A',
        country: 'India'
      },
      timeline: generateTimeline(order),
      // Additional fields from database
      productId: order.product_id,
      buyerId: order.buyer_id,
      sellerId: order.seller_id,
      winningBidId: order.winning_bid_id,
      category: order.category,
      seller: order.seller || order.seller_name
    }));
  };

  const mapOrderStatus = (dbStatus) => {
    const statusMap = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'processing': 'processing',
      'shipped': 'shipped',
      'completed': 'delivered',
      'cancelled': 'cancelled',
      'refunded': 'refunded'
    };
    return statusMap[dbStatus?.toLowerCase()] || 'pending';
  };

  const generateTimeline = (order) => {
    const timeline = [];
    const orderDate = new Date(order.order_date);

    timeline.push({
      action: 'Order placed',
      timestamp: orderDate,
      note: 'Order created successfully'
    });

    if (order.order_status === 'confirmed' || order.order_status === 'processing' || 
        order.order_status === 'shipped' || order.order_status === 'completed') {
      timeline.push({
        action: 'Order confirmed',
        timestamp: new Date(orderDate.getTime() + 30 * 60000), // 30 mins after
        note: 'Payment confirmed'
      });
    }

    if (order.order_status === 'processing' || order.order_status === 'shipped' || 
        order.order_status === 'completed') {
      timeline.push({
        action: 'Processing started',
        timestamp: new Date(orderDate.getTime() + 60 * 60000), // 1 hour after
        note: 'Order is being prepared'
      });
    }

    if (order.order_status === 'shipped' || order.order_status === 'completed') {
      timeline.push({
        action: 'Shipped',
        timestamp: new Date(orderDate.getTime() + 24 * 60 * 60000), // 1 day after
        note: order.tracking_number ? `Tracking: ${order.tracking_number}` : 'Package dispatched'
      });
    }

    if (order.order_status === 'completed') {
      timeline.push({
        action: 'Delivered',
        timestamp: new Date(orderDate.getTime() + 3 * 24 * 60 * 60000), // 3 days after
        note: 'Order delivered successfully'
      });
    }

    if (order.order_status === 'cancelled') {
      timeline.push({
        action: 'Order cancelled',
        timestamp: new Date(),
        note: order.cancel_reason || 'Order was cancelled'
      });
    }

    return timeline;
  };

  const transformStatsData = (apiStats) => {
    if (!apiStats || !Array.isArray(apiStats) || apiStats.length === 0) {
      return {
        total: 0,
        pending: 0,
        processing: 0,
        delivered: 0,
        revenue: 0,
        avgOrderValue: 0
      };
    }

    const statsData = apiStats[0];
    return {
      total: parseInt(statsData.total_orders) || 0,
      pending: parseInt(statsData.pending_orders) || 0,
      processing: parseInt(statsData.processing_orders) || 0,
      shipped: parseInt(statsData.shipped_orders) || 0,
      delivered: parseInt(statsData.completed_orders) || 0,
      cancelled: parseInt(statsData.cancelled_orders) || 0,
      revenue: parseFloat(statsData.total_order_value) || 0,
      avgOrderValue: parseFloat(statsData.avg_order_value) || 0,
      minOrderValue: parseFloat(statsData.min_order_value) || 0,
      maxOrderValue: parseFloat(statsData.max_order_value) || 0
    };
  };

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders?.filter(order => {
      // Search filter
      if (filters?.search) {
        const searchTerm = filters?.search?.toLowerCase();
        const matchesSearch = 
          order?.id?.toLowerCase()?.includes(searchTerm) ||
          order?.customer?.name?.toLowerCase()?.includes(searchTerm) ||
          order?.customer?.email?.toLowerCase()?.includes(searchTerm) ||
          order?.product?.name?.toLowerCase()?.includes(searchTerm) ||
          order?.items?.some(item => item?.name?.toLowerCase()?.includes(searchTerm));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters?.status !== 'all' && order?.status !== filters?.status) {
        return false;
      }

      // Vendor filter
      if (filters?.vendor !== 'all') {
        const hasVendor = order?.items?.some(item => 
          item?.vendor?.toLowerCase()?.includes(filters?.vendor?.replace('-', ' '))
        );
        if (!hasVendor) return false;
      }

      // Value range filter
      if (filters?.minValue && order?.total < parseFloat(filters?.minValue)) {
        return false;
      }
      if (filters?.maxValue && order?.total > parseFloat(filters?.maxValue)) {
        return false;
      }

      // Date range filter
      if (filters?.dateRange !== 'all') {
        const orderDate = new Date(order?.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filters?.dateRange) {
          case 'today':
            const startOfDay = new Date(today);
            if (orderDate < startOfDay) return false;
            break;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (orderDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (orderDate < monthAgo) return false;
            break;
          case 'quarter':
            const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
            if (orderDate < quarterAgo) return false;
            break;
          default:
            break;
        }
      }

      return true;
    });

    // Sort orders
    if (sortConfig?.key) {
      filtered?.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig?.key) {
          case 'id':
            aValue = a?.id;
            bValue = b?.id;
            break;
          case 'customer':
            aValue = a?.customer?.name;
            bValue = b?.customer?.name;
            break;
          case 'total':
            aValue = a?.total;
            bValue = b?.total;
            break;
          case 'date':
          case 'order_date':
            aValue = a?.date;
            bValue = b?.date;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig?.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig?.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [orders, filters, sortConfig]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      vendor: 'all',
      dateRange: 'all',
      minValue: '',
      maxValue: ''
    });
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleOrderSelect = (orderId, isSelected) => {
    setSelectedOrders(prev => 
      isSelected 
        ? [...prev, orderId]
        : prev?.filter(id => id !== orderId)
    );
  };

  const handleSelectAll = (isSelected) => {
    setSelectedOrders(isSelected ? filteredAndSortedOrders?.map(order => order?.id) : []);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // Map status back to database format
      const dbStatus = mapStatusToDb(newStatus);
      
      await updateOrderStatus(orderId, dbStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      // Refresh stats
      const statsResponse = await getAllOrderMatrixByVendorId(vendorId);
      const transformedStats = transformStatsData(statsResponse);
      setStats(transformedStats);

      console.log(`Order ${orderId} updated to status: ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const mapStatusToDb = (componentStatus) => {
    const statusMap = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'completed',
      'cancelled': 'cancelled',
      'refunded': 'refunded'
    };
    return statusMap[componentStatus] || 'pending';
  };

  const handleBulkStatusUpdate = async (orderIds, newStatus) => {
    try {
      const dbStatus = mapStatusToDb(newStatus);
      
      await bulkUpdateOrderStatus(orderIds, dbStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          orderIds.includes(order.id) 
            ? { ...order, status: newStatus }
            : order
        )
      );

      // Refresh stats
      const statsResponse = await getAllOrderMatrixByVendorId(vendorId);
      const transformedStats = transformStatsData(statsResponse);
      setStats(transformedStats);

      setSelectedOrders([]);
      console.log(`Bulk updated ${orderIds?.length} orders to status: ${newStatus}`);
    } catch (error) {
      console.error('Error bulk updating orders:', error);
      alert('Failed to update orders. Please try again.');
    }
  };

  const handleBulkExport = async (orderIds, format) => {
    try {
      const blob = await exportOrders(orderIds, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_export_${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSelectedOrders([]);
      console.log(`Exported ${orderIds?.length} orders as ${format}`);
    } catch (error) {
      console.error('Error exporting orders:', error);
      alert('Failed to export orders. Please try again.');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  const handleExportAll = async () => {
    try {
      const allOrderIds = orders.map(order => order.id);
      await handleBulkExport(allOrderIds, 'csv');
    } catch (error) {
      console.error('Error exporting all orders:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Icon name="Loader" size={48} className="animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Icon name="AlertTriangle" size={48} className="text-error mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">Error Loading Orders</p>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchOrdersAndStats}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Order Management System</h1>
              <p className="text-muted-foreground mt-2">
                Track, modify, and process orders across all vendors and product categories
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                onClick={handleExportAll}
              >
                Export All
              </Button>
              <Button
                variant="outline"
                iconName="RefreshCw"
                iconPosition="left"
                onClick={fetchOrdersAndStats}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          {stats && <OrderStats stats={stats} />}

          {/* Filters */}
          <OrderFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            totalOrders={orders?.length}
            filteredCount={filteredAndSortedOrders?.length}
          />

          {/* Bulk Actions */}
          <BulkActionsToolbar
            selectedOrders={selectedOrders}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            onBulkExport={handleBulkExport}
            onClearSelection={() => setSelectedOrders([])}
          />

          {/* Orders Table */}
          <OrderTable
            orders={filteredAndSortedOrders}
            selectedOrders={selectedOrders}
            onOrderSelect={handleOrderSelect}
            onSelectAll={handleSelectAll}
            onStatusUpdate={handleStatusUpdate}
            onViewDetails={handleViewDetails}
            sortConfig={sortConfig}
            onSort={handleSort}
          />

          {/* Pagination */}
          {filteredAndSortedOrders?.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing 1 to {Math.min(10, filteredAndSortedOrders?.length)} of {filteredAndSortedOrders?.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <Icon name="ChevronLeft" size={16} />
                </Button>
                <Button variant="default" size="sm">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">
                  <Icon name="ChevronRight" size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default OrderManagementSystem;