import React from 'react';
import Modal from './Modal';
import Button from './Button';
import Icon from '../AppIcon';
import Image from '../AppImage';

const ProductViewModal = ({ isOpen, onClose, product }) => {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details">
      <div className="space-y-6">
        {/* Product Image and Basic Info */}
        <div className="flex items-start space-x-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={product?.image_path}
              alt={product?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground mb-2">{product?.name}</h3>
            <p className="text-sm text-muted-foreground mb-1">SKU: {product?.sku}</p>
            <p className="text-sm text-muted-foreground">Category: {product?.category}</p>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Vendor</label>
            <p className="text-sm text-foreground">{product?.seller}</p>
            <p className="text-xs text-muted-foreground">{product?.sellerEmail}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Starting Price</label>
            <p className="text-lg font-semibold text-foreground">₹{product?.starting_price}</p>
            {product?.bid_amount && (
              <p className="text-sm text-success">Current Bid: ₹{product?.bid_amount}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              product?.isActive
                ? 'bg-success/10 text-success' :'bg-secondary/10 text-secondary'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                product?.isActive ? 'bg-success' : 'bg-secondary'
              }`} />
              <span>{product?.isActive ? 'Active' : 'Inactive'}</span>
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Auction Status</label>
            <p className="text-sm text-foreground capitalize">{product?.auctionStatus || 'Not Set'}</p>
          </div>
        </div>

        {/* Auction Dates */}
        {(product?.auction_start || product?.auction_end) && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Auction Schedule</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="text-sm text-foreground">
                  {product?.auction_start ? new Date(product.auction_start).toLocaleDateString() : 'Not Set'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">End Date</p>
                <p className="text-sm text-foreground">
                  {product?.auction_end ? new Date(product.auction_end).toLocaleDateString() : 'Not Set'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Product Description */}
        {product?.description && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
            <p className="text-sm text-foreground bg-muted p-3 rounded-lg">{product?.description}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductViewModal;
