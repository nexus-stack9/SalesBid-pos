import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

import Button from '../../../components/ui/Button';


const VendorSearchFilters = ({ 
  searchQuery, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange, 
  selectedDateRange, 
  onDateRangeChange,
  onClearFilters,
  resultsCount 
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion & apparel', label: 'Fashion & Apparel' },
    { value: 'home & garden', label: 'Home & Garden' },
    { value: 'sports & outdoors', label: 'Sports & Outdoors' },
    { value: 'books & media', label: 'Books & Media' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'health & beauty', label: 'Health & Beauty' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedDateRange !== 'all';

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mb-6">
      {/* Search Bar and Results Count */}
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
              placeholder="Search by company, contact person, or email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
          <span className="text-sm text-muted-foreground">
            {resultsCount} vendor{resultsCount !== 1 ? 's' : ''} found
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
        </div> */}
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e?.target?.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {categories?.map(category => (
              <option key={category?.value} value={category?.value}>
                {category?.label}
              </option>
            ))}
          </select>
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Registration Date
          </label>
          <select
            value={selectedDateRange}
            onChange={(e) => onDateRangeChange(e?.target?.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {dateRanges?.map(range => (
              <option key={range?.value} value={range?.value}>
                {range?.label}
              </option>
            ))}
          </select>
        </div> */}

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
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Verification Level
              </label>
              <select className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">All Levels</option>
                <option value="basic">Basic</option>
                <option value="verified">Verified</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <Input
              label="Min Products"
              type="number"
              placeholder="0"
              className="w-full"
            />

            <Input
              label="Max Products"
              type="number" 
              placeholder="100"
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {searchQuery && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              <span>Search: "{searchQuery}"</span>
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              <span>Category: {categories?.find(c => c?.value === selectedCategory)?.label}</span>
              <button
                onClick={() => onCategoryChange('all')}
                className="hover:text-primary/80"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
          
          {selectedDateRange !== 'all' && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              <span>Date: {dateRanges?.find(d => d?.value === selectedDateRange)?.label}</span>
              <button
                onClick={() => onDateRangeChange('all')}
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

export default VendorSearchFilters;