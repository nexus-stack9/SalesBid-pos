import React, { useState, useMemo } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import OrderStats from './components/OrderStats';
import OrderFilters from './components/OrderFilters';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import OrderTable from './components/OrderTable';
import OrderDetailsModal from './components/OrderDetailsModal';

const OrderManagementSystem = () => {
  // Mock data for orders
  const mockOrders = [
    {
      id: "ORD-2025-001",
      customer: {
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1 (555) 123-4567"
      },
      items: [
        {
          name: "Wireless Bluetooth Headphones",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
          vendor: "Tech Solutions Inc",
          quantity: 1,
          price: 89.99
        },
        {
          name: "Phone Case",
          image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400",
          vendor: "Tech Solutions Inc",
          quantity: 2,
          price: 24.99
        }
      ],
      subtotal: 139.97,
      shipping: 9.99,
      tax: 11.20,
      discount: 0,
      total: 161.16,
      status: "processing",
      date: new Date('2025-01-10'),
      paymentMethod: "Credit Card",
      paymentStatus: "paid",
      transactionId: "TXN-789012345",
      trackingNumber: "1Z999AA1234567890",
      carrier: "UPS",
      estimatedDelivery: new Date('2025-01-15'),
      shippingAddress: {
        street: "123 Main Street, Apt 4B",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "United States"
      },
      timeline: [
        {
          action: "Order placed",
          timestamp: new Date('2025-01-10T10:30:00'),
          note: "Payment confirmed"
        },
        {
          action: "Order confirmed",
          timestamp: new Date('2025-01-10T11:15:00'),
          note: "Inventory allocated"
        },
        {
          action: "Processing started",
          timestamp: new Date('2025-01-11T09:00:00'),
          note: "Items being prepared for shipment"
        }
      ]
    },
    {
      id: "ORD-2025-002",
      customer: {
        name: "Michael Chen",
        email: "michael.chen@email.com",
        phone: "+1 (555) 234-5678"
      },
      items: [
        {
          name: "Running Shoes",
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
          vendor: "Sports Gear Pro",
          quantity: 1,
          price: 129.99
        }
      ],
      subtotal: 129.99,
      shipping: 0,
      tax: 10.40,
      discount: 15.00,
      total: 125.39,
      status: "delivered",
      date: new Date('2025-01-08'),
      paymentMethod: "PayPal",
      paymentStatus: "paid",
      transactionId: "TXN-456789012",
      trackingNumber: "1Z999BB9876543210",
      carrier: "FedEx",
      estimatedDelivery: new Date('2025-01-12'),
      shippingAddress: {
        street: "456 Oak Avenue",
        city: "Los Angeles",
        state: "CA",
        zip: "90210",
        country: "United States"
      },
      timeline: [
        {
          action: "Order placed",
          timestamp: new Date('2025-01-08T14:20:00'),
          note: "Express shipping selected"
        },
        {
          action: "Order confirmed",
          timestamp: new Date('2025-01-08T14:45:00')
        },
        {
          action: "Shipped",
          timestamp: new Date('2025-01-09T08:30:00'),
          note: "Package dispatched via FedEx"
        },
        {
          action: "Delivered",
          timestamp: new Date('2025-01-11T16:45:00'),
          note: "Delivered to front door"
        }
      ]
    },
    {
      id: "ORD-2025-003",
      customer: {
        name: "Emily Rodriguez",
        email: "emily.rodriguez@email.com",
        phone: "+1 (555) 345-6789"
      },
      items: [
        {
          name: "Organic Face Cream",
          image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
          vendor: "Beauty World",
          quantity: 3,
          price: 45.00
        },
        {
          name: "Vitamin C Serum",
          image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
          vendor: "Beauty World",
          quantity: 1,
          price: 32.99
        }
      ],
      subtotal: 167.99,
      shipping: 5.99,
      tax: 13.44,
      discount: 20.00,
      total: 167.42,
      status: "pending",
      date: new Date('2025-01-12'),
      paymentMethod: "Credit Card",
      paymentStatus: "pending",
      transactionId: "TXN-123456789",
      shippingAddress: {
        street: "789 Pine Street",
        city: "Chicago",
        state: "IL",
        zip: "60601",
        country: "United States"
      },
      timeline: [
        {
          action: "Order placed",
          timestamp: new Date('2025-01-12T09:15:00'),
          note: "Awaiting payment confirmation"
        }
      ]
    },
    {
      id: "ORD-2025-004",
      customer: {
        name: "David Thompson",
        email: "david.thompson@email.com",
        phone: "+1 (555) 456-7890"
      },
      items: [
        {
          name: "Coffee Maker",
          image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
          vendor: "Home Essentials",
          quantity: 1,
          price: 199.99
        },
        {
          name: "Coffee Beans",
          image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
          vendor: "Home Essentials",
          quantity: 2,
          price: 18.99
        }
      ],
      subtotal: 237.97,
      shipping: 12.99,
      tax: 19.04,
      discount: 0,
      total: 270.00,
      status: "shipped",
      date: new Date('2025-01-09'),
      paymentMethod: "Debit Card",
      paymentStatus: "paid",
      transactionId: "TXN-987654321",
      trackingNumber: "1Z999CC1122334455",
      carrier: "USPS",
      estimatedDelivery: new Date('2025-01-14'),
      shippingAddress: {
        street: "321 Elm Drive",
        city: "Houston",
        state: "TX",
        zip: "77001",
        country: "United States"
      },
      timeline: [
        {
          action: "Order placed",
          timestamp: new Date('2025-01-09T11:30:00')
        },
        {
          action: "Order confirmed",
          timestamp: new Date('2025-01-09T12:00:00')
        },
        {
          action: "Processing started",
          timestamp: new Date('2025-01-10T08:00:00')
        },
        {
          action: "Shipped",
          timestamp: new Date('2025-01-11T14:30:00'),
          note: "Package shipped via USPS Priority Mail"
        }
      ]
    },
    {
      id: "ORD-2025-005",
      customer: {
        name: "Lisa Wang",
        email: "lisa.wang@email.com",
        phone: "+1 (555) 567-8901"
      },
      items: [
        {
          name: "Summer Dress",
          image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400",
          vendor: "Fashion Hub",
          quantity: 2,
          price: 79.99
        }
      ],
      subtotal: 159.98,
      shipping: 7.99,
      tax: 12.80,
      discount: 25.00,
      total: 155.77,
      status: "cancelled",
      date: new Date('2025-01-11'),
      paymentMethod: "Credit Card",
      paymentStatus: "refunded",
      transactionId: "TXN-555666777",
      shippingAddress: {
        street: "654 Maple Lane",
        city: "Seattle",
        state: "WA",
        zip: "98101",
        country: "United States"
      },
      timeline: [
        {
          action: "Order placed",
          timestamp: new Date('2025-01-11T13:45:00')
        },
        {
          action: "Order confirmed",
          timestamp: new Date('2025-01-11T14:00:00')
        },
        {
          action: "Order cancelled",
          timestamp: new Date('2025-01-11T16:30:00'),
          note: "Cancelled by customer - item out of stock"
        },
        {
          action: "Refund processed",
          timestamp: new Date('2025-01-11T17:00:00'),
          note: "Full refund issued to original payment method"
        }
      ]
    }
  ];

  const [orders] = useState(mockOrders);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    vendor: 'all',
    dateRange: 'all',
    minValue: '',
    maxValue: ''
  });

  // Mock stats
  const stats = {
    total: 1247,
    pending: 24,
    processing: 18,
    delivered: 156,
    revenue: 89750,
    avgOrderValue: 187.50
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

  const handleStatusUpdate = (orderId, newStatus) => {
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
    // In a real app, this would make an API call
  };

  const handleBulkStatusUpdate = (orderIds, newStatus) => {
    console.log(`Bulk updating ${orderIds?.length} orders to status: ${newStatus}`);
    setSelectedOrders([]);
  };

  const handleBulkExport = (orderIds, format) => {
    console.log(`Exporting ${orderIds?.length} orders as ${format}`);
    setSelectedOrders([]);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

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
              >
                Export All
              </Button>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
              >
                Create Order
              </Button>
            </div>
          </div>

          {/* Stats */}
          <OrderStats stats={stats} />

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