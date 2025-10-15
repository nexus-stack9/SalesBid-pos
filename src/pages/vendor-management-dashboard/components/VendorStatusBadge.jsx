import React from 'react';

const VendorStatusBadge = ({ status, isActive, size = 'default' }) => {
  const getStatusConfig = (status, isActive) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          bg: 'bg-warning/10',
          text: 'text-warning',
          border: 'border-warning/20',
          label: 'Pending'
        };
      case 'approved':
        return {
          bg: 'bg-success/10',
          text: 'text-success',
          border: 'border-success/20',
          label: 'Approved'
        };
      case 'rejected':
        return {
          bg: 'bg-error/10',
          text: 'text-error',
          border: 'border-error/20',
          label: 'Rejected'
        };
      case 'active':
        return {
          bg: 'bg-success/10',
          text: 'text-success',
          border: 'border-success/20',
          label: isActive !== false ? 'Active' : 'Inactive'
        };
      case 'inactive':
        return {
          bg: 'bg-muted',
          text: 'text-muted-foreground',
          border: 'border-border',
          label: 'Inactive'
        };
      default:
        return {
          bg: 'bg-muted',
          text: 'text-muted-foreground',
          border: 'border-border',
          label: status || 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status, isActive);
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config?.bg} ${config?.text} ${config?.border} ${sizeClasses}`}>
      {config?.label}
    </span>
  );
};

export default VendorStatusBadge;