import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';


const OrderFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  totalOrders,
  filteredCount 
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const vendorOptions = [
    { value: 'all', label: 'All Vendors' },
    { value: 'tech-solutions-inc', label: 'Tech Solutions Inc' },
    { value: 'sports-gear-pro', label: 'Sports Gear Pro' },
    { value: 'beauty-world', label: 'Beauty World' },
    { value: 'home-essentials', label: 'Home Essentials' },
    { value: 'fashion-hub', label: 'Fashion Hub' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const hasActiveFilters = 
    filters?.search || 
    filters?.status !== 'all' || 
    filters?.vendor !== 'all' || 
    filters?.dateRange !== 'all' ||
    filters?.minValue ||
    filters?.maxValue;

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mb-6">
      {/* Search and Results */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="search"
              placeholder="Search orders, customers, items..."
              value={filters?.search || ''}
              onChange={(e) => onFilterChange('search', e?.target?.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
          <span className="text-sm text-muted-foreground">
            Showing {filteredCount} of {totalOrders} orders
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            iconName="Filter"
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>
      {/* Quick Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Status
          </label>
          <select
            value={filters?.status}
            onChange={(e) => onFilterChange('status', e?.target?.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {statusOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Vendor
          </label>
          <select
            value={filters?.vendor}
            onChange={(e) => onFilterChange('vendor', e?.target?.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {vendorOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Date Range
          </label>
          <select
            value={filters?.dateRange}
            onChange={(e) => onFilterChange('dateRange', e?.target?.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {dateRangeOptions?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              iconName="X"
              iconPosition="left"
              className="w-full"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-medium text-foreground mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Min Order Value"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={filters?.minValue || ''}
              onChange={(e) => onFilterChange('minValue', e?.target?.value)}
            />
            <Input
              label="Max Order Value"
              type="number"
              step="0.01"
              placeholder="1000.00"
              value={filters?.maxValue || ''}
              onChange={(e) => onFilterChange('maxValue', e?.target?.value)}
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Status
              </label>
              <select className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">All Payment Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending Payment</option>
                <option value="failed">Payment Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Shipping Status
              </label>
              <select className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">All Shipping Status</option>
                <option value="not-shipped">Not Shipped</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>
        </div>
      )}
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters?.search && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              <span>Search: "{filters?.search}"</span>
              <button
                onClick={() => onFilterChange('search', '')}
                className="hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          
          {filters?.status !== 'all' && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              <span>Status: {statusOptions?.find(s => s?.value === filters?.status)?.label}</span>
              <button
                onClick={() => onFilterChange('status', 'all')}
                className="hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          
          {filters?.vendor !== 'all' && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              <span>Vendor: {vendorOptions?.find(v => v?.value === filters?.vendor)?.label}</span>
              <button
                onClick={() => onFilterChange('vendor', 'all')}
                className="hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          
          {filters?.dateRange !== 'all' && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              <span>Date: {dateRangeOptions?.find(d => d?.value === filters?.dateRange)?.label}</span>
              <button
                onClick={() => onFilterChange('dateRange', 'all')}
                className="hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          
          {filters?.minValue && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              <span>Min: ${filters?.minValue}</span>
              <button
                onClick={() => onFilterChange('minValue', '')}
                className="hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          
          {filters?.maxValue && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              <span>Max: ${filters?.maxValue}</span>
              <button
                onClick={() => onFilterChange('maxValue', '')}
                className="hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderFilters;