import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const BulkActionsToolbar = ({ 
  selectedOrders, 
  onBulkStatusUpdate, 
  onBulkExport, 
  onClearSelection 
}) => {
  const [bulkStatus, setBulkStatus] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const statusOptions = [
    { value: '', label: 'Select Status' },
    { value: 'confirmed', label: 'Confirm Orders' },
    { value: 'processing', label: 'Start Processing' },
    { value: 'shipped', label: 'Mark as Shipped' },
    { value: 'delivered', label: 'Mark as Delivered' },
    { value: 'cancelled', label: 'Cancel Orders' }
  ];

  const exportOptions = [
    { value: 'csv', label: 'Export as CSV' },
    { value: 'excel', label: 'Export as Excel' },
    { value: 'pdf', label: 'Export as PDF' }
  ];

  const handleBulkStatusUpdate = () => {
    if (!bulkStatus) return;
    
    setPendingAction({
      type: 'status_update',
      status: bulkStatus,
      count: selectedOrders?.length
    });
    setShowConfirmDialog(true);
  };

  const handleBulkExport = (format) => {
    setPendingAction({
      type: 'export',
      format: format,
      count: selectedOrders?.length
    });
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (pendingAction?.type === 'status_update') {
      onBulkStatusUpdate(selectedOrders, pendingAction?.status);
      setBulkStatus('');
    } else if (pendingAction?.type === 'export') {
      onBulkExport(selectedOrders, pendingAction?.format);
    }
    
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const cancelAction = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  if (selectedOrders?.length === 0) return null;

  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Icon name="CheckSquare" size={20} className="text-primary" />
              <span className="font-medium text-primary">
                {selectedOrders?.length} order{selectedOrders?.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              iconName="X"
              iconPosition="left"
            >
              Clear Selection
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Bulk Status Update */}
            <div className="flex items-center gap-2">
              <Select
                options={statusOptions}
                value={bulkStatus}
                onChange={setBulkStatus}
                placeholder="Update status"
                className="w-40"
              />
              <Button
                variant="default"
                size="sm"
                onClick={handleBulkStatusUpdate}
                disabled={!bulkStatus}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Update
              </Button>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-2">
              {exportOptions?.map((option) => (
                <Button
                  key={option?.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkExport(option?.value)}
                  iconName="Download"
                  iconPosition="left"
                >
                  {option?.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Confirm Bulk Action</h3>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              {pendingAction?.type === 'status_update' ? (
                <p className="text-sm text-foreground">
                  Are you sure you want to update the status of {pendingAction?.count} order{pendingAction?.count !== 1 ? 's' : ''} to{' '}
                  <span className="font-medium">
                    {statusOptions?.find(opt => opt?.value === pendingAction?.status)?.label}
                  </span>?
                </p>
              ) : (
                <p className="text-sm text-foreground">
                  Are you sure you want to export {pendingAction?.count} order{pendingAction?.count !== 1 ? 's' : ''} as{' '}
                  <span className="font-medium">{pendingAction?.format?.toUpperCase()}</span>?
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={cancelAction}>
                Cancel
              </Button>
              <Button 
                variant={pendingAction?.type === 'status_update' ? 'default' : 'default'}
                onClick={confirmAction}
              >
                {pendingAction?.type === 'status_update' ? 'Update Status' : 'Export Orders'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActionsToolbar;