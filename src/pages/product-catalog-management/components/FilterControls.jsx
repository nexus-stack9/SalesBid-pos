import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const FilterControls = ({ onFilterChange, onSearch, onAddProduct }) => {
  const [filters, setFilters] = useState({
    category: '',
    vendor: '',
    auctionStatus: '',
    dateRange: '',
    priceRange: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'books', label: 'Books' },
    { value: 'automotive', label: 'Automotive' }
  ];

  const vendors = [
    { value: '', label: 'All Vendors' },
    { value: 'techmart', label: 'TechMart Solutions' },
    { value: 'fashionhub', label: 'Fashion Hub' },
    { value: 'homeessentials', label: 'Home Essentials' },
    { value: 'sportsworld', label: 'Sports World' },
    { value: 'bookstore', label: 'Digital Bookstore' }
  ];

  const auctionStatuses = [
    { value: '', label: 'All Statuses' },
    { value: 'live', label: 'Live' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'ended', label: 'Ended' },
    { value: 'draft', label: 'Draft' }
  ];

  const dateRanges = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const priceRanges = [
    { value: '', label: 'All Prices' },
    { value: '0-50', label: '₹0 - ₹50' },
    { value: '50-100', label: '₹50 - ₹100' },
    { value: '100-500', label: '₹100 - ₹500' },
    { value: '500-1000', label: '₹500 - ₹1,000' },
    { value: '1000+', label: '₹1,000+' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    onSearch(searchQuery);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      vendor: '',
      auctionStatus: '',
      dateRange: '',
      priceRange: ''
    };
    setFilters(clearedFilters);
    setSearchQuery('');
    onFilterChange(clearedFilters);
    onSearch('');
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '') || searchQuery !== '';

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mb-6">
      {/* Search and Add Product */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6">
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="search"
              placeholder="Search products, SKUs, vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="pl-10"
            />
          </div>
        </form>
        
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            iconName="Filter"
            iconPosition="left"
            size="sm"
            className="w-full sm:w-auto"
          >
            {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            variant="default"
            onClick={onAddProduct}
            iconName="Plus"
            iconPosition="left"
            size="sm"
            className="w-full sm:w-auto"
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Category</label>
          <select
            value={filters?.category}
            onChange={(e) => handleFilterChange('category', e?.target?.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {categories?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Vendor</label>
          <select
            value={filters?.vendor}
            onChange={(e) => handleFilterChange('vendor', e?.target?.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {vendors?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Auction Status</label>
          <select
            value={filters?.auctionStatus}
            onChange={(e) => handleFilterChange('auctionStatus', e?.target?.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {auctionStatuses?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
          <select
            value={filters?.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e?.target?.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {dateRanges?.map(option => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Price Range</label>
          <select
            value={filters?.priceRange}
            onChange={(e) => handleFilterChange('priceRange', e?.target?.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {priceRanges?.map(option => (
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
              onClick={clearFilters}
              iconName="X"
              iconPosition="left"
              className="w-full"
              size="sm"
            >
              Clear All
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
              label="Min Price"
              type="number"
              placeholder="0"
              className="w-full"
            />
            <Input
              label="Max Price"
              type="number"
              placeholder="1000"
              className="w-full"
            />
            <Input
              label="Start Date"
              type="date"
              className="w-full"
            />
            <Input
              label="End Date"
              type="date"
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {Object.entries(filters)?.map(([key, value]) => {
            if (!value) return null;
            const label = key?.charAt(0)?.toUpperCase() + key?.slice(1);
            return (
              <span
                key={key}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
              >
                <span>{label}: {value}</span>
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="hover:text-primary/80"
                >
                  <Icon name="X" size={12} />
                </button>
              </span>
            );
          })}
          {searchQuery && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              <span>Search: {searchQuery}</span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  onSearch('');
                }}
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

export default FilterControls;