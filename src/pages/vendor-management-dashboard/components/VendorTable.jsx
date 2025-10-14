import React from 'react';
import VendorTableRow, { VendorMobileCard } from './VendorTableRow';
import Icon from '../../../components/AppIcon';

const VendorTable = ({ 
  vendors, 
  onStatusChange, 
  onBulkSelect, 
  selectedVendors, 
  onSelectAll,
  sortConfig,
  onSort 
}) => {
  const isAllSelected = vendors?.length > 0 && selectedVendors?.length === vendors?.length;
  const isIndeterminate = selectedVendors?.length > 0 && selectedVendors?.length < vendors?.length;

  const handleSort = (field) => {
    const direction = sortConfig?.field === field && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    onSort({ field, direction });
  };

  const getSortIcon = (field) => {
    if (sortConfig?.field !== field) return 'ArrowUpDown';
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  if (vendors?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No vendors found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or filters to find vendors.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                  className="rounded border-border"
                />
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('companyName')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Company</span>
                  <Icon name={getSortIcon('companyName')} size={16} />
                </button>
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('email')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Contact</span>
                  <Icon name={getSortIcon('email')} size={16} />
                </button>
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Category</span>
                  <Icon name={getSortIcon('category')} size={16} />
                </button>
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('registrationDate')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Registered</span>
                  <Icon name={getSortIcon('registrationDate')} size={16} />
                </button>
              </th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Status</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors?.map((vendor) => (
              <VendorTableRow
                key={vendor?.id}
                vendor={vendor}
                onStatusChange={onStatusChange}
                onBulkSelect={onBulkSelect}
                isSelected={selectedVendors?.includes(vendor?.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden p-4 space-y-4">
        {vendors?.map((vendor) => (
          <VendorMobileCard
            key={vendor?.id}
            vendor={vendor}
            onStatusChange={onStatusChange}
            onBulkSelect={onBulkSelect}
            isSelected={selectedVendors?.includes(vendor?.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default VendorTable;