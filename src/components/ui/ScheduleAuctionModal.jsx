import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';


const ScheduleAuctionModal = ({ 
  isOpen, 
  onClose, 
  onSchedule, 
  product,
  initialData = null 
}) => {
  const [formData, setFormData] = useState({
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    startTime: initialData?.startTime || '09:00',
    endTime: initialData?.endTime || '17:00',
    minBid: initialData?.minBid || product?.startingPrice || '',
    description: initialData?.description || ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData?.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData?.startDate && formData?.endDate) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (startDateTime >= endDateTime) {
        newErrors.endDate = 'End date must be after start date';
      }
      
      if (startDateTime < new Date()) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }
    
    if (!formData?.minBid || formData?.minBid <= 0) {
      newErrors.minBid = 'Minimum bid must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const auctionData = {
        productId: product?.id,
        startDateTime: new Date(`${formData.startDate}T${formData.startTime}`),
        endDateTime: new Date(`${formData.endDate}T${formData.endTime}`),
        minBid: parseFloat(formData?.minBid),
        description: formData?.description
      };
      
      await onSchedule(auctionData);
      onClose();
    } catch (error) {
      console.error('Error scheduling auction:', error);
      setErrors({ submit: 'Failed to schedule auction. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      startDate: '',
      endDate: '',
      startTime: '09:00',
      endTime: '17:00',
      minBid: product?.startingPrice || '',
      description: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={`Schedule Auction - ${product?.name}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Info */}
        <div className="bg-muted/20 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-2">Product Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2 text-foreground">{product?.name}</span>
            </div>
            {/* <div>
              <span className="text-muted-foreground">SKU:</span>
              <span className="ml-2 text-foreground">{product?.sku}</span>
            </div> */}
            <div>
              <span className="text-muted-foreground">Starting Price:</span>
              <span className="ml-2 text-foreground">${product?.startingPrice}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Category:</span>
              <span className="ml-2 text-foreground">{product?.category}</span>
            </div>
          </div>
        </div>

        {/* Auction Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Start Date"
              type="date"
              value={formData?.startDate}
              onChange={(e) => handleInputChange('startDate', e?.target?.value)}
              error={errors?.startDate}
              required
            />
          </div>
          <div>
            <Input
              label="Start Time"
              type="time"
              value={formData?.startTime}
              onChange={(e) => handleInputChange('startTime', e?.target?.value)}
              required
            />
          </div>
          <div>
            <Input
              label="End Date"
              type="date"
              value={formData?.endDate}
              onChange={(e) => handleInputChange('endDate', e?.target?.value)}
              error={errors?.endDate}
              required
            />
          </div>
          <div>
            <Input
              label="End Time"
              type="time"
              value={formData?.endTime}
              onChange={(e) => handleInputChange('endTime', e?.target?.value)}
              required
            />
          </div>
        </div>

        {/* Minimum Bid */}
        <div>
          <Input
            label="Minimum Bid Amount"
            type="number"
            step="0.01"
            min="0"
            value={formData?.minBid}
            onChange={(e) => handleInputChange('minBid', e?.target?.value)}
            error={errors?.minBid}
            placeholder="Enter minimum bid amount"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Auction Description
          </label>
          <textarea
            value={formData?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            placeholder="Add any special terms, conditions, or notes for this auction..."
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Error Display */}
        {errors?.submit && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive">{errors?.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            iconName={isLoading ? "Loader2" : "Calendar"}
            iconPosition="left"
          >
            {isLoading ? 'Scheduling...' : 'Schedule Auction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleAuctionModal;