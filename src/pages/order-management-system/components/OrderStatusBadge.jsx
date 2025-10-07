import React from 'react';

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'bg-warning/10 text-warning border-warning/20'
    },
    confirmed: {
      label: 'Confirmed',
      className: 'bg-accent/10 text-accent border-accent/20'
    },
    processing: {
      label: 'Processing',
      className: 'bg-primary/10 text-primary border-primary/20'
    },
    shipped: {
      label: 'Shipped',
      className: 'bg-secondary/10 text-secondary border-secondary/20'
    },
    delivered: {
      label: 'Delivered',
      className: 'bg-success/10 text-success border-success/20'
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-error/10 text-error border-error/20'
    },
    refunded: {
      label: 'Refunded',
      className: 'bg-muted/10 text-muted-foreground border-muted/20'
    }
  };

  const config = statusConfig?.[status] || statusConfig?.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config?.className}`}>
      {config?.label}
    </span>
  );
};

export default OrderStatusBadge;