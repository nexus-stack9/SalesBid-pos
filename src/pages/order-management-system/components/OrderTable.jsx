// components/OrderTable.jsx
import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import OrderStatusBadge from './OrderStatusBadge';
import Select from '../../../components/ui/Select';

const OrderTable = ({ 
  orders, 
  selectedOrders, 
  onOrderSelect, 
  onSelectAll, 
  onStatusUpdate, 
  onViewDetails,
  sortConfig,
  onSort 
}) => {
  const [editingStatus, setEditingStatus] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    })?.format(amount);
  };

  const handleStatusEdit = (orderId, currentStatus) => {
    setEditingStatus({ orderId, currentStatus });
  };

  const handleStatusSave = (orderId, newStatus) => {
    onStatusUpdate(orderId, newStatus);
    setEditingStatus(null);
  };

  const handleStatusCancel = () => {
    setEditingStatus(null);
  };

  const getSortIcon = (column) => {
    if (sortConfig?.key !== column) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-primary" />
      : <Icon name="ArrowDown" size={14} className="text-primary" />;
  };

  const handleActionClick = (orderId, action) => {
    switch (action) {
      case 'view':
        const order = orders?.find(o => o?.id === orderId);
        onViewDetails(order);
        break;
      case 'edit':
        console.log('Edit order:', orderId);
        break;
      case 'duplicate':
        console.log('Duplicate order:', orderId);
        break;
      case 'archive':
        console.log('Archive order:', orderId);
        break;
      case 'delete':
        console.log('Delete order:', orderId);
        break;
      case 'print':
        console.log('Print order:', orderId);
        break;
      case 'export':
        console.log('Export order:', orderId);
        break;
      default:
        break;
    }
    setDropdownOpen(null);
  };

  const ActionDropdown = ({ orderId }) => (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDropdownOpen(dropdownOpen === orderId ? null : orderId)}
        iconName="MoreHorizontal"
      />
      {dropdownOpen === orderId && (
        <div className="absolute right-0 top-8 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => handleActionClick(orderId, 'view')}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Icon name="Eye" size={14} />
              <span>View Details</span>
            </button>
            <button
              onClick={() => handleActionClick(orderId, 'edit')}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Icon name="Edit" size={14} />
              <span>Edit Order</span>
            </button>
            <button
              onClick={() => handleActionClick(orderId, 'duplicate')}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Icon name="Copy" size={14} />
              <span>Duplicate</span>
            </button>
            <div className="border-t border-border my-1"></div>
            <button
              onClick={() => handleActionClick(orderId, 'print')}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Icon name="Printer" size={14} />
              <span>Print Order</span>
            </button>
            <button
              onClick={() => handleActionClick(orderId, 'export')}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Icon name="Download" size={14} />
              <span>Export</span>
            </button>
            <div className="border-t border-border my-1"></div>
            <button
              onClick={() => handleActionClick(orderId, 'archive')}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Icon name="Archive" size={14} />
              <span>Archive</span>
            </button>
            <button
              onClick={() => handleActionClick(orderId, 'delete')}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-destructive hover:bg-muted"
            >
              <Icon name="Trash2" size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const allSelected = orders?.length > 0 && selectedOrders?.length === orders?.length;
  const someSelected = selectedOrders?.length > 0 && selectedOrders?.length < orders?.length;

  return (
    <>
      {/* Click outside handler */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setDropdownOpen(null)}
        />
      )}
      
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="w-12 p-4">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={(e) => onSelectAll(e?.target?.checked)}
                  />
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => onSort('id')}
                    className="flex items-center gap-2 font-medium text-foreground hover:text-primary"
                  >
                    Order ID
                    {getSortIcon('id')}
                  </button>
                </th>
                <th className="text-left p-4">
                  <button
                    onClick={() => onSort('customer')}
                    className="flex items-center gap-2 font-medium text-foreground hover:text-primary"
                  >
                    Customer
                    {getSortIcon('customer')}
                  </button>
                </th>
                <th className="text-left p-4">Items</th>
                <th className="text-left p-4">
                  <button
                    onClick={() => onSort('total')}
                    className="flex items-center gap-2 font-medium text-foreground hover:text-primary"
                  >
                    Total
                    {getSortIcon('total')}
                  </button>
                </th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">
                  <button
                    onClick={() => onSort('date')}
                    className="flex items-center gap-2 font-medium text-foreground hover:text-primary"
                  >
                    Date
                    {getSortIcon('date')}
                  </button>
                </th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => (
                <tr key={order?.id} className="border-b border-border hover:bg-muted/20">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedOrders?.includes(order?.id)}
                      onChange={(e) => onOrderSelect(order?.id, e?.target?.checked)}
                    />
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm text-foreground">#{order?.id}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <Icon name="User" size={16} color="white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{order?.customer?.name}</p>
                        <p className="text-sm text-muted-foreground">{order?.customer?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {order?.items?.slice(0, 3)?.map((item, index) => (
                          <Image
                            key={index}
                            src={item?.image}
                            alt={item?.name}
                            className="w-8 h-8 rounded-full border-2 border-card object-cover"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {order?.items?.length} item{order?.items?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-foreground">{formatCurrency(order?.total)}</span>
                  </td>
                  <td className="p-4">
                    {editingStatus?.orderId === order?.id ? (
                      <div className="flex items-center gap-2">
                        <Select
                          options={statusOptions}
                          value={editingStatus?.currentStatus}
                          onChange={(value) => setEditingStatus({ ...editingStatus, currentStatus: value })}
                          className="w-32"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusSave(order?.id, editingStatus?.currentStatus)}
                        >
                          <Icon name="Check" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleStatusCancel}
                        >
                          <Icon name="X" size={14} />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStatusEdit(order?.id, order?.status)}
                        className="hover:bg-muted/50 rounded p-1"
                      >
                        <OrderStatusBadge status={order?.status} />
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{formatDate(order?.date)}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end">
                      <ActionDropdown orderId={order?.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden">
          {orders?.map((order) => (
            <div key={order?.id} className="p-4 border-b border-border last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedOrders?.includes(order?.id)}
                    onChange={(e) => onOrderSelect(order?.id, e?.target?.checked)}
                  />
                  <div>
                    <p className="font-mono text-sm text-foreground">#{order?.id}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order?.date)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <OrderStatusBadge status={order?.status} />
                  <ActionDropdown orderId={order?.id} />
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <Icon name="User" size={16} color="white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order?.customer?.name}</p>
                    <p className="text-sm text-muted-foreground">{order?.customer?.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {order?.items?.slice(0, 3)?.map((item, index) => (
                      <Image
                        key={index}
                        src={item?.image}
                        alt={item?.name}
                        className="w-6 h-6 rounded-full border-2 border-card object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {order?.items?.length} item{order?.items?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="font-medium text-foreground">{formatCurrency(order?.total)}</span>
              </div>
            </div>
          ))}
        </div>

        {orders?.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Package" size={24} className="text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">No orders found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderTable;