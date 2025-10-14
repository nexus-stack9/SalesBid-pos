import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActionsToolbar = ({ 
  selectedCount, 
  onBulkAction, 
  onClearSelection,
  onExport 
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);

  const bulkActions = [
    {
      id: 'activate',
      label: 'Activate Products',
      icon: 'CheckCircle',
      variant: 'success',
      description: 'Make selected products active and available for auction'
    },
    {
      id: 'deactivate',
      label: 'Deactivate Products',
      icon: 'XCircle',
      variant: 'secondary',
      description: 'Make selected products inactive and unavailable'
    },
    {
      id: 'start-auction',
      label: 'Start Auctions',
      icon: 'Play',
      variant: 'default',
      description: 'Start auctions for selected products immediately'
    },
    {
      id: 'schedule-auction',
      label: 'Schedule Auctions',
      icon: 'Calendar',
      variant: 'outline',
      description: 'Schedule auctions for selected products'
    },
    {
      id: 'end-auction',
      label: 'End Auctions',
      icon: 'Pause',
      variant: 'warning',
      description: 'End active auctions for selected products'
    },
    {
      id: 'delete',
      label: 'Delete Products',
      icon: 'Trash2',
      variant: 'destructive',
      description: 'Permanently delete selected products'
    }
  ];

  const handleBulkAction = (actionId) => {
    const action = bulkActions?.find(a => a?.id === actionId);
    if (action && (action?.variant === 'destructive' || action?.variant === 'warning')) {
      setConfirmationAction(action);
      setShowConfirmation(true);
    } else {
      onBulkAction(actionId);
    }
  };

  const confirmAction = () => {
    if (confirmationAction) {
      onBulkAction(confirmationAction?.id);
      setShowConfirmation(false);
      setConfirmationAction(null);
    }
  };

  const cancelAction = () => {
    setShowConfirmation(false);
    setConfirmationAction(null);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Selection Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="CheckSquare" size={20} className="text-primary" />
              <span className="font-medium text-foreground">
                {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
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

          {/* Bulk Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {bulkActions?.slice(0, 4)?.map((action) => (
              <Button
                key={action?.id}
                variant={action?.variant}
                size="sm"
                onClick={() => handleBulkAction(action?.id)}
                iconName={action?.icon}
                iconPosition="left"
                className="text-xs"
              >
                {action?.label}
              </Button>
            ))}
            
            {/* More Actions Dropdown */}
            <div className="relative group">
              <Button
                variant="outline"
                size="sm"
                iconName="MoreHorizontal"
                className="text-xs"
              >
                More
              </Button>
              <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-md shadow-dropdown z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  {bulkActions?.slice(4)?.map((action) => (
                    <button
                      key={action?.id}
                      onClick={() => handleBulkAction(action?.id)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2 ${
                        action?.variant === 'destructive' ? 'text-error' : 'text-foreground'
                      }`}
                    >
                      <Icon name={action?.icon} size={16} />
                      <span>{action?.label}</span>
                    </button>
                  ))}
                  <hr className="my-1 border-border" />
                  <button
                    onClick={onExport}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2 text-foreground"
                  >
                    <Icon name="Download" size={16} />
                    <span>Export Selected</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-primary/20">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-lg font-semibold text-success">12</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Live Auctions</p>
            <p className="text-lg font-semibold text-warning">5</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Scheduled</p>
            <p className="text-lg font-semibold text-primary">8</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-lg font-semibold text-foreground">₹24,580</p>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirmation && confirmationAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                confirmationAction?.variant === 'destructive' ?'bg-error/10 text-error' :'bg-warning/10 text-warning'
              }`}>
                <Icon name={confirmationAction?.icon} size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Confirm {confirmationAction?.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  This action affects {selectedCount} product{selectedCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {confirmationAction?.description}. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={cancelAction}
              >
                Cancel
              </Button>
              <Button
                variant={confirmationAction?.variant}
                onClick={confirmAction}
                iconName={confirmationAction?.icon}
                iconPosition="left"
              >
                {confirmationAction?.label}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActionsToolbar;