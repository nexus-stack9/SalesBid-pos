import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import OrderStatusBadge from './OrderStatusBadge';
import OrderProgressTracker from './OrderProgressTracker';

const OrderDetailsModal = ({ order, isOpen, onClose, onStatusUpdate }) => {
  if (!isOpen || !order) return null;

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Order Details</h2>
            <p className="text-sm text-muted-foreground">Order #{order?.id}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Information */}
            <div className="space-y-6">
              {/* Status and Progress */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-foreground">Order Status</h3>
                  <OrderStatusBadge status={order?.status} />
                </div>
                <OrderProgressTracker 
                  currentStatus={order?.status}
                  orderId={order?.id}
                  onStatusUpdate={onStatusUpdate}
                />
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-foreground">{order?.customer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-foreground">{order?.customer?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="text-foreground">{order?.customer?.phone}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Shipping Address</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{order?.shippingAddress?.street}</p>
                  <p>{order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.zip}</p>
                  <p>{order?.shippingAddress?.country}</p>
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Order Timeline</h3>
                <div className="space-y-3">
                  {order?.timeline?.map((event, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{event?.action}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(event?.timestamp)}</p>
                        {event?.note && (
                          <p className="text-xs text-muted-foreground mt-1">{event?.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Items and Summary */}
            <div className="space-y-6">
              {/* Order Items */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Order Items</h3>
                <div className="space-y-3">
                  {order?.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Image
                        src={item?.image}
                        alt={item?.name}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item?.name}</p>
                        <p className="text-xs text-muted-foreground">Vendor: {item?.vendor}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item?.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">${item?.price?.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">${(item?.price * item?.quantity)?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium text-foreground mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="text-foreground">${order?.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className="text-foreground">${order?.shipping?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="text-foreground">${order?.tax?.toFixed(2)}</span>
                  </div>
                  {order?.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="text-success">-${order?.discount?.toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="border-border" />
                  <div className="flex justify-between font-medium">
                    <span className="text-foreground">Total:</span>
                    <span className="text-foreground">${order?.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="font-medium text-foreground mb-3">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="text-foreground">{order?.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="text-foreground font-mono">{order?.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <span className={`font-medium ${
                      order?.paymentStatus === 'paid' ? 'text-success' : 
                      order?.paymentStatus === 'pending' ? 'text-warning' : 'text-error'
                    }`}>
                      {order?.paymentStatus?.charAt(0)?.toUpperCase() + order?.paymentStatus?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tracking Information */}
              {order?.trackingNumber && (
                <div>
                  <h3 className="font-medium text-foreground mb-3">Tracking Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tracking Number:</span>
                      <span className="text-foreground font-mono">{order?.trackingNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carrier:</span>
                      <span className="text-foreground">{order?.carrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Delivery:</span>
                      <span className="text-foreground">{formatDate(order?.estimatedDelivery)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="default"
            iconName="Download"
            iconPosition="left"
          >
            Download Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;