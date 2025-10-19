import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';

const ProductEditModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = null
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    vendor_id: '',
    starting_price: '',
    retail_value: '',
    auction_start: '',
    auction_end: '',
    location: '',
    shipping: '',
    quantity: '',
    condition: '',
    tags: '',
    buy_option: 0,
    sale_price: '',
    weight: '',
    height: '',
    length: '',
    breadth: '',
    trending: false,
    isactive: true,
    status: 'active',
    auctionstatus: 'draft'
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    { value: 1, label: 'Electronics' },
    { value: 2, label: 'Fashion' },
    { value: 3, label: 'Home & Garden' },
    { value: 4, label: 'Sports & Outdoors' },
    { value: 5, label: 'Books' },
    { value: 6, label: 'Automotive' }
  ];

  const vendors = [
    { value: 1, label: 'TechMart Solutions' },
    { value: 2, label: 'Fashion Hub' },
    { value: 3, label: 'Home Essentials' },
    { value: 4, label: 'Sports World' },
    { value: 5, label: 'Digital Bookstore' }
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'very_good', label: 'Very Good' },
    { value: 'good', label: 'Good' },
    { value: 'acceptable', label: 'Acceptable' }
  ];

  const shippingOptions = [
    { value: 'free', label: 'Free Shipping' },
    { value: 'standard', label: 'Standard Shipping' },
    { value: 'express', label: 'Express Shipping' },
    { value: 'pickup', label: 'Local Pickup Only' }
  ];

  // Initialize form data when in edit mode
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        category_id: initialData.category_id || '',
        vendor_id: initialData.vendor_id || '',
        starting_price: initialData.starting_price || '',
        retail_value: initialData.retail_value || '',
        auction_start: initialData.auction_start || '',
        auction_end: initialData.auction_end || '',
        location: initialData.location || '',
        shipping: initialData.shipping || '',
        quantity: initialData.quantity || '',
        condition: initialData.condition || '',
        tags: initialData.tags || '',
        buy_option: initialData.buy_option || 0,
        sale_price: initialData.sale_price || '',
        weight: initialData.weight || '',
        height: initialData.height || '',
        length: initialData.length || '',
        breadth: initialData.breadth || '',
        trending: initialData.trending || false,
        isactive: initialData.isactive !== undefined ? initialData.isactive : true,
        status: initialData.status || 'active',
        auctionstatus: initialData.auctionstatus || 'draft'
      });

      // Set existing images if available
      if (initialData.image_path) {
        setExistingImages([initialData.image_path]);
      }
    }
  }, [initialData, isOpen]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.starting_price || formData.starting_price <= 0) newErrors.starting_price = 'Valid starting price is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.vendor_id) newErrors.vendor_id = 'Vendor is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      category_id: '',
      vendor_id: '',
      starting_price: '',
      retail_value: '',
      auction_start: '',
      auction_end: '',
      location: '',
      shipping: '',
      quantity: '',
      condition: '',
      tags: '',
      buy_option: 0,
      sale_price: '',
      weight: '',
      height: '',
      length: '',
      breadth: '',
      trending: false,
      isactive: true,
      status: 'active',
      auctionstatus: 'draft'
    });
    setImages([]);
    setExistingImages([]);
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Product">
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Product description..."
            />
          </div>
          <div>
            <Input
              label="Starting Price"
              type="number"
              value={formData.starting_price}
              onChange={(e) => handleInputChange('starting_price', e.target.value)}
              error={errors.starting_price}
              required
            />
          </div>
          <div>
            <Input
              label="Retail Value"
              type="number"
              value={formData.retail_value}
              onChange={(e) => handleInputChange('retail_value', e.target.value)}
            />
          </div>
        </div>

        {/* Category and Vendor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Category *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => handleInputChange('category_id', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-sm text-error mt-1">{errors.category_id}</p>}
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Vendor *
            </label>
            <select
              value={formData.vendor_id}
              onChange={(e) => handleInputChange('vendor_id', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Vendor</option>
              {vendors.map(vendor => (
                <option key={vendor.value} value={vendor.value}>{vendor.label}</option>
              ))}
            </select>
            {errors.vendor_id && <p className="text-sm text-error mt-1">{errors.vendor_id}</p>}
          </div> */}
        </div>

        {/* Auction Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Auction Start Date"
              type="datetime-local"
              value={formData.auction_start}
              onChange={(e) => handleInputChange('auction_start', e.target.value)}
            />
          </div>
          <div>
            <Input
              label="Auction End Date"
              type="datetime-local"
              value={formData.auction_end}
              onChange={(e) => handleInputChange('auction_end', e.target.value)}
            />
          </div>
        </div>

        {/* Status and Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Condition
            </label>
            <select
              value={formData.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Condition</option>
              {conditions.map(cond => (
                <option key={cond.value} value={cond.value}>{cond.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Shipping
            </label>
            <select
              value={formData.shipping}
              onChange={(e) => handleInputChange('shipping', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Shipping</option>
              {shippingOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isSaving}
            iconName={isSaving ? "Loader" : "Save"}
            iconPosition="left"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductEditModal;
