import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Icon from '../AppIcon';

const JustificationModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  action = 'approve',
  vendor 
}) => {
  const [justification, setJustification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const actionConfig = {
    approve: {
      title: 'Approve Vendor',
      color: 'text-success',
      bgColor: 'bg-success/10',
      icon: 'CheckCircle',
      placeholder: 'Please provide justification for approving this vendor...',
      buttonText: 'Approve Vendor',
      buttonVariant: 'default'
    },
    reject: {
      title: 'Reject Vendor',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      icon: 'XCircle',
      placeholder: 'Please provide justification for rejecting this vendor...',
      buttonText: 'Reject Vendor',
      buttonVariant: 'destructive'
    }
  };

  const config = actionConfig?.[action];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!justification?.trim()) {
      setError('Justification is required');
      return;
    }

    if (justification?.trim()?.length < 10) {
      setError('Justification must be at least 10 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSubmit({
        vendorId: vendor?.vendor_id,
        action,
        justification: justification?.trim(),
        timestamp: new Date()?.toISOString(),
        reviewer: 'Current User' // In real app, get from auth context
      });
      
      handleClose();
    } catch (err) {
      setError('Failed to submit. Please try again.');
      console.error('Justification submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setJustification('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={config?.title}
      size="lg"
    >
      <div className="space-y-6">
        {/* Vendor Info */}
        <div className={`${config?.bgColor} rounded-lg p-4 border`}>
          <div className="flex items-start space-x-3">
            <div className={`${config?.color} mt-1`}>
              <Icon name={config?.icon} size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-2">
                {action === 'approve' ? 'Approving' : 'Rejecting'}: {vendor?.business_name}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="ml-2 text-foreground">{vendor?.vendor_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2 text-foreground">{vendor?.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2 text-foreground">{vendor?.items_category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Registration:</span>
                  <span className="ml-2 text-foreground">
                    {new Date(vendor?.created_at)?.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Justification Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Justification <span className="text-destructive">*</span>
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e?.target?.value)}
              placeholder={config?.placeholder}
              rows={6}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 10 characters. This justification will be recorded for audit purposes.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {/* Character Counter */}
          <div className="text-right">
            <span className={`text-xs ${
              justification?.length < 10 
                ? 'text-destructive' 
                : justification?.length > 500 
                ? 'text-warning' :'text-muted-foreground'
            }`}>
              {justification?.length} / 500 characters
            </span>
          </div>

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
              variant={config?.buttonVariant}
              disabled={isLoading || !justification?.trim() || justification?.trim()?.length < 10}
              iconName={isLoading ? "Loader2" : config?.icon}
              iconPosition="left"
            >
              Submit
              {isLoading ? 'Processing...' : config?.buttonText}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default JustificationModal;