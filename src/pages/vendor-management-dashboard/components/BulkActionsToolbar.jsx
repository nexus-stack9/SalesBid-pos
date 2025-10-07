import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const BulkActionsToolbar = ({ selectedCount, onBulkApprove, onBulkReject, onBulkDelete, onClearSelection }) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const handleBulkAction = (action) => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const confirmBulkAction = () => {
    switch (confirmAction?.type) {
      case 'approve':
        onBulkApprove();
        break;
      case 'reject':
        onBulkReject();
        break;
      case 'delete':
        onBulkDelete();
        break;
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const cancelBulkAction = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="text-sm font-medium text-foreground">
              {selectedCount} vendor{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="success"
              size="sm"
              onClick={() => handleBulkAction({ type: 'approve', label: 'approve' })}
              iconName="Check"
            >
              Approve All
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction({ type: 'reject', label: 'reject' })}
              iconName="X"
            >
              Reject All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction({ type: 'delete', label: 'delete' })}
              iconName="Trash2"
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              iconName="X"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                confirmAction?.type === 'delete' ? 'bg-error/10' : 'bg-warning/10'
              }`}>
                <Icon 
                  name={confirmAction?.type === 'delete' ? 'AlertTriangle' : 'AlertCircle'} 
                  size={20} 
                  className={confirmAction?.type === 'delete' ? 'text-error' : 'text-warning'}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Confirm Bulk Action
                </h3>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <p className="text-sm text-foreground mb-6">
              Are you sure you want to {confirmAction?.label} {selectedCount} selected vendor{selectedCount !== 1 ? 's' : ''}?
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={cancelBulkAction}
              >
                Cancel
              </Button>
              <Button
                variant={confirmAction?.type === 'delete' ? 'destructive' : 'default'}
                onClick={confirmBulkAction}
              >
                {confirmAction?.type === 'approve' ? 'Approve' : 
                 confirmAction?.type === 'reject' ? 'Reject' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActionsToolbar;