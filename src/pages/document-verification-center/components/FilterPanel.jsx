import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  documentTypes, 
  vendors 
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'requires-resubmission', label: 'Requires Resubmission' }
  ];

  const documentTypeOptions = [
    { value: 'all', label: 'All Document Types' },
    ...documentTypes?.map(type => ({ value: type, label: type }))
  ];

  const vendorOptions = [
    { value: 'all', label: 'All Vendors' },
    ...vendors?.map(vendor => ({ value: vendor?.id, label: vendor?.name }))
  ];

  const sortOptions = [
    { value: 'uploadedAt-desc', label: 'Newest First' },
    { value: 'uploadedAt-asc', label: 'Oldest First' },
    { value: 'vendorName-asc', label: 'Vendor A-Z' },
    { value: 'vendorName-desc', label: 'Vendor Z-A' },
    { value: 'type-asc', label: 'Document Type A-Z' }
  ];

  const hasActiveFilters = filters?.status !== 'all' || 
                          filters?.documentType !== 'all' || 
                          filters?.vendor !== 'all' || 
                          filters?.search?.trim() !== '';

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground flex items-center space-x-2">
          <Icon name="Filter" size={18} />
          <span>Filters & Search</span>
        </h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
          >
            <Icon name="X" size={16} />
            Clear Filters
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            type="search"
            placeholder="Search by vendor name, document type..."
            value={filters?.search}
            onChange={(e) => onFilterChange('search', e?.target?.value)}
            className="w-full"
          />
        </div>

        {/* Status Filter */}
        <Select
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
          placeholder="Filter by status"
        />

        {/* Document Type Filter */}
        <Select
          options={documentTypeOptions}
          value={filters?.documentType}
          onChange={(value) => onFilterChange('documentType', value)}
          placeholder="Filter by type"
        />

        {/* Sort */}
        <Select
          options={sortOptions}
          value={filters?.sort}
          onChange={(value) => onFilterChange('sort', value)}
          placeholder="Sort by"
        />
      </div>
      {/* Vendor Filter - Full Width */}
      <div className="mt-4">
        <Select
          options={vendorOptions}
          value={filters?.vendor}
          onChange={(value) => onFilterChange('vendor', value)}
          placeholder="Filter by vendor"
          searchable
        />
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {filters?.status !== 'all' && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  Status: {statusOptions?.find(opt => opt?.value === filters?.status)?.label}
                </span>
              )}
              {filters?.documentType !== 'all' && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  Type: {filters?.documentType}
                </span>
              )}
              {filters?.vendor !== 'all' && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  Vendor: {vendors?.find(v => v?.id === filters?.vendor)?.name}
                </span>
              )}
              {filters?.search?.trim() && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  Search: "{filters?.search}"
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;