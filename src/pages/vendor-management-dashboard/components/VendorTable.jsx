import React from 'react';
import VendorTableRow, { VendorMobileCard } from './VendorTableRow';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const VendorTable = ({ 
  vendors, 
  onStatusChange, 
  onBulkSelect, 
  selectedVendors, 
  onSelectAll,
  sortConfig,
  onSort,
  onVendorActiveToggle
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
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                />
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('business_name')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Company</span>
                  <Icon name={getSortIcon('business_name')} size={16} />
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
                  onClick={() => handleSort('items_category')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Category</span>
                  <Icon name={getSortIcon('items_category')} size={16} />
                </button>
              </th>
              <th className="p-4 text-left">
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>Registered</span>
                  <Icon name={getSortIcon('created_at')} size={16} />
                </button>
              </th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Status</th>
              <th className="p-4 text-left text-sm font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors?.map((vendor) => (
              <VendorTableRow
                key={vendor?.vendor_id || vendor?.id}
                vendor={vendor}
                onStatusChange={onStatusChange}
                onBulkSelect={onBulkSelect}
                isSelected={selectedVendors?.includes(vendor?.vendor_id || vendor?.id)}
                onVendorActiveToggle={onVendorActiveToggle}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden p-4 space-y-4">
        {vendors?.map((vendor) => (
          <VendorMobileCard
            key={vendor?.vendor_id || vendor?.id}
            vendor={vendor}
            onStatusChange={onStatusChange}
            onBulkSelect={onBulkSelect}
            isSelected={selectedVendors?.includes(vendor?.vendor_id || vendor?.id)}
            onVendorActiveToggle={onVendorActiveToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default VendorTable;