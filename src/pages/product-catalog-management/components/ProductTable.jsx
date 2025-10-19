import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import ImageGalleryModal from '../../../components/ui/ImageGalleryModal';
import ScheduleAuctionModal from '../../../components/ui/ScheduleAuctionModal';
import ProductViewModal from '../../../components/ui/ProductViewModal';
import GoLiveModal from '../../../components/ui/GoLiveModal';

const ProductTable = ({ 
  products, 
  onStatusToggle, 
  onAuctionToggle, 
  onEditProduct, 
  onBulkAction,
  selectedProducts,
  onSelectProduct,
  onSelectAll,
  onCellValueUpdate,
  onAuctionSchedule,
  currentPageProducts
}) => {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [imageGalleryModal, setImageGalleryModal] = useState({ isOpen: false, product: null });
  const [scheduleModal, setScheduleModal] = useState({ isOpen: false, product: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, product: null });
  const [goLiveModal, setGoLiveModal] = useState({ isOpen: false, product: null });
  const [imageErrors, setImageErrors] = useState({});

  // Placeholder image for fallback
  const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

  // Get the first image URL from comma-separated string for main display
  const getMainImageUrl = (product) => {
    if (!product?.image_path) {
      console.log('No image_path found for product:', product?.name);
      return null;
    }

    // Clean and parse the image path
    const imagePath = product.image_path.trim();
    
    // Handle comma-separated paths
    if (imagePath.includes(',')) {
      const imageUrls = imagePath.split(',').map(url => url.trim()).filter(url => url);
      console.log(`Product "${product?.name}" has ${imageUrls.length} images:`, imageUrls);
      return imageUrls[0] || null;
    }

    console.log(`Product "${product?.name}" image URL:`, imagePath);
    return imagePath;
  };

  // Parse product images from comma-separated image_path string
  const getProductImages = (product) => {
    if (!product?.image_path) {
      console.log('No image_path found for product:', product?.name);
      return [];
    }

    // Clean and parse the image path
    const imagePath = product.image_path.trim();
    
    // Split the comma-separated string into individual image URLs
    const imageUrls = imagePath
      .split(',')
      .map(url => url.trim())
      .filter(url => url); // Remove empty strings

    console.log(`Product "${product?.name}" has ${imageUrls.length} images:`, imageUrls);

    // Return array of image objects for the gallery
    return imageUrls.map((url, index) => ({
      url: url,
      alt: `${product?.name} - Image ${index + 1}`
    }));
  };

  // Handle image load error
  const handleImageError = (productId) => {
    console.error(`Failed to load image for product ID: ${productId}`);
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  // Handle image load success
  const handleImageLoad = (productId) => {
    console.log(`Successfully loaded image for product ID: ${productId}`);
    setImageErrors(prev => ({ ...prev, [productId]: false }));
  };

  const handleCellEdit = (productId, field, currentValue) => {
    setEditingCell(`${productId}-${field}`);
    setEditValue(currentValue);
  };

  const handleCellSave = async (productId, field) => {
    try {
      const updateData = {
        [field]: editValue
      };

      if (field === 'startDate' || field === 'auction_start') {
        updateData.auction_start = editValue;
      } else if (field === 'endDate' || field === 'auction_end') {
        updateData.auction_end = editValue;
      }

      console.log(`Saving ${field} for product ${productId}:`, updateData);
      onCellValueUpdate(productId, field, editValue);

      setEditingCell(null);
      setEditValue('');
      console.log('Cell value saved successfully');
    } catch (error) {
      console.error('Error saving cell value:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleViewImages = (product) => {
    const images = getProductImages(product);
    console.log('Opening gallery with images:', images);
    setImageGalleryModal({ isOpen: true, product });
  };

  const handleViewProduct = (product) => {
    setViewModal({ isOpen: true, product });
  };

  const handleScheduleAuction = (product) => {
    setScheduleModal({ isOpen: true, product });
  };

  const handleGoLive = (product) => {
    setGoLiveModal({ isOpen: true, product });
  };

  const handleAuctionScheduled = async (auctionData) => {
    console.log('Auction scheduled:', auctionData);
    if (onAuctionSchedule) {
      await onAuctionSchedule(auctionData);
    }
    setScheduleModal({ isOpen: false, product: null });
  };

  const handleLiveStreamStart = (liveData) => {
    console.log('Live stream started:', liveData);
    // Update product status to live
    // Make API call to start live stream
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAuctionStatusBadge = (status) => {
    const statusConfig = {
      'live': { color: 'bg-success text-success-foreground', icon: 'Zap' },
      'scheduled': { color: 'bg-warning text-warning-foreground', icon: 'Clock' },
      'ended': { color: 'bg-secondary text-secondary-foreground', icon: 'CheckCircle' },
      'draft': { color: 'bg-muted text-muted-foreground', icon: 'Edit' }
    };

    const config = statusConfig?.[status] || statusConfig?.draft;

    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        <span className="capitalize">{status || 'draft'}</span>
      </span>
    );
  };

  // Check if product can go live (active and has auction scheduled)
  const canGoLive = (product) => {
    return product?.isactive && product?.auction_start && product?.auction_end;
  };

  // Checkbox selection logic - use current page products for select all
  const isAllSelected = products?.length > 0 &&
    products?.every(product => selectedProducts?.includes(product?.product_id));
  const isIndeterminate = products?.length > 0 &&
    products?.some(product => selectedProducts?.includes(product?.product_id)) &&
    !isAllSelected;

  // Product Image Component with error handling
  const ProductImage = ({ product, size = 'small' }) => {
    const imageUrl = getMainImageUrl(product);
    const hasError = imageErrors[product?.product_id];
    
    const sizeClasses = {
      small: 'w-12 h-12',
      medium: 'w-16 h-16'
    };

    // Debug logging
    React.useEffect(() => {
      console.log(`ProductImage render for "${product?.name}":`, {
        imageUrl,
        hasError,
        image_path: product?.image_path
      });
    }, [imageUrl, hasError, product]);

    return (
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden bg-muted flex-shrink-0`}>
        {imageUrl && !hasError ? (
          <img
            src={imageUrl}
            alt={product?.name || 'Product'}
            className="w-full h-full object-cover"
            onError={() => handleImageError(product?.product_id)}
            onLoad={() => handleImageLoad(product?.product_id)}
            loading="lazy"
          />
        ) : (
          <img
            src={PLACEHOLDER_IMAGE}
            alt="No image available"
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="w-12 p-4">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => onSelectAll(e?.target?.checked)}
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Images</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Vendor</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Auction Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Auction Dates</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products?.map((product, index) => (
                <tr key={`${product?.product_id}-${index}`} className="hover:bg-muted/50">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedProducts?.includes(product?.product_id)}
                      onChange={(e) => {
                        console.log('Product checkbox changed:', {
                          productId: product?.product_id,
                          productName: product?.name,
                          checked: e.target.checked,
                          isSelected: selectedProducts?.includes(product?.product_id)
                        });
                        onSelectProduct(product?.product_id, e?.target?.checked);
                      }}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <ProductImage product={product} size="small" />
                      <div>
                        <p className="font-medium text-foreground">{product?.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {product?.product_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewImages(product)}
                      iconName="Images"
                      iconPosition="left"
                    >
                      View ({getProductImages(product)?.length})
                    </Button>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">{product?.seller || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{product?.sellerEmail || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-foreground">{product?.category || 'N/A'}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">₹{product?.starting_price || 0}</p>
                      {product?.bid_amount && (
                        <p className="text-sm text-success">Current: ₹{product?.bid_amount}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getAuctionStatusBadge(product?.auctionstatus)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleScheduleAuction(product)}
                        className="p-1"
                        title="Schedule Auction"
                      >
                        <Icon name="Calendar" size={14} />
                      </Button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Start:</span>
                        {editingCell === `${product?.product_id}-startDate` ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="date"
                              value={editValue}
                              onChange={(e) => setEditValue(e?.target?.value)}
                              className="text-xs border border-border rounded px-1 py-0.5"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCellSave(product?.product_id, 'startDate')}
                              className="p-0.5"
                            >
                              <Icon name="Check" size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCellCancel}
                              className="p-0.5"
                            >
                              <Icon name="X" size={12} />
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCellEdit(product?.product_id, 'startDate', product?.auction_start)}
                            className="text-xs text-foreground hover:text-primary"
                          >
                            {formatDate(product?.auction_start)}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">End:</span>
                        {editingCell === `${product?.product_id}-endDate` ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="date"
                              value={editValue}
                              onChange={(e) => setEditValue(e?.target?.value)}
                              className="text-xs border border-border rounded px-1 py-0.5"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCellSave(product?.product_id, 'endDate')}
                              className="p-0.5"
                            >
                              <Icon name="Check" size={12} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCellCancel}
                              className="p-0.5"
                            >
                              <Icon name="X" size={12} />
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCellEdit(product?.product_id, 'endDate', product?.auction_end)}
                            className="text-xs text-foreground hover:text-primary"
                          >
                            {formatDate(product?.auction_end)}
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => onStatusToggle(product?.product_id)}
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        product?.isactive
                          ? 'bg-success/10 text-success' :'bg-secondary/10 text-secondary'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        product?.isactive ? 'bg-success' : 'bg-secondary'
                      }`} />
                      <span>{product?.isactive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditProduct(product?.product_id)}
                        title="Edit Product"
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProduct(product)}
                        title="View Product Details"
                      >
                        <Icon name="Eye" size={16} />
                      </Button>
                      <Button
                        variant={canGoLive(product) ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleGoLive(product)}
                        disabled={!canGoLive(product)}
                        title={canGoLive(product) ? "Go Live with Video Stream" : "Product must be active with scheduled auction"}
                        className={canGoLive(product) ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                      >
                        <Icon name="Video" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4 p-4">
          {products?.map((product, index) => (
            <div key={`${product?.product_id}-${index}`} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-3">
                <Checkbox
                  checked={selectedProducts?.includes(product?.product_id)}
                  onChange={(e) => {
                    console.log('Product mobile checkbox changed:', {
                      productId: product?.product_id,
                      productName: product?.name,
                      checked: e.target.checked,
                      isSelected: selectedProducts?.includes(product?.product_id)
                    });
                    onSelectProduct(product?.product_id, e?.target?.checked);
                  }}
                />
                <ProductImage product={product} size="medium" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{product?.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {product?.product_id}</p>
                  <p className="text-sm text-muted-foreground">{product?.seller || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{product?.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Starting Price</p>
                  <p className="text-sm font-medium">₹{product?.starting_price || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Images</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewImages(product)}
                    iconName="Images"
                    iconPosition="left"
                  >
                    View ({getProductImages(product)?.length})
                  </Button>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Auction</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScheduleAuction(product)}
                    iconName="Calendar"
                    iconPosition="left"
                  >
                    Schedule
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getAuctionStatusBadge(product?.auctionstatus)}
                </div>
                <button
                  onClick={() => onStatusToggle(product?.product_id)}
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    product?.isactive
                      ? 'bg-success/10 text-success' :'bg-secondary/10 text-secondary'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    product?.isactive ? 'bg-success' : 'bg-secondary'
                  }`} />
                  <span>{product?.isactive ? 'Active' : 'Inactive'}</span>
                </button>
              </div>

              <div className="space-y-2 mb-3">
                <div className="text-xs text-muted-foreground">
                  <p>Start: {formatDate(product?.auction_start)}</p>
                  <p>End: {formatDate(product?.auction_end)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditProduct(product?.product_id)}
                    title="Edit Product"
                  >
                    <Icon name="Edit" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewProduct(product)}
                    title="View Product Details"
                  >
                    <Icon name="Eye" size={16} />
                  </Button>
                </div>
                <Button
                  variant={canGoLive(product) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGoLive(product)}
                  disabled={!canGoLive(product)}
                  iconName="Video"
                  iconPosition="left"
                  className={canGoLive(product) ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                >
                  Go Live
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={imageGalleryModal?.isOpen}
        onClose={() => setImageGalleryModal({ isOpen: false, product: null })}
        images={imageGalleryModal?.product ? getProductImages(imageGalleryModal?.product) : []}
        title={`${imageGalleryModal?.product?.name || 'Product'} - Images`}
      />

      {/* Schedule Auction Modal */}
      <ScheduleAuctionModal
        isOpen={scheduleModal?.isOpen}
        onClose={() => setScheduleModal({ isOpen: false, product: null })}
        product={scheduleModal?.product}
        onSchedule={handleAuctionScheduled}
      />

      {/* Product View Modal */}
      <ProductViewModal
        isOpen={viewModal?.isOpen}
        onClose={() => setViewModal({ isOpen: false, product: null })}
        product={viewModal?.product}
      />

      {/* Go Live Modal */}
      <GoLiveModal
        isOpen={goLiveModal?.isOpen}
        onClose={() => setGoLiveModal({ isOpen: false, product: null })}
        product={goLiveModal?.product}
        onGoLive={handleLiveStreamStart}
      />
    </>
  );
};

export default ProductTable;