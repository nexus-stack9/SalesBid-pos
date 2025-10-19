import React from 'react';
import Button from '../../../components/ui/Button';

const BulkActionsToolbar = ({ 
  selectedCount, 
  activeTab,
  onBulkApprove, 
  onBulkReject,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete, 
  onClearSelection 
}) => {
  // Don't show toolbar if no vendors selected
  if (!selectedCount || selectedCount === 0) return null;

  console.log('BulkActionsToolbar:', { selectedCount, activeTab });

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Selection Info */}
        <div className="flex items-center space-x-3">
          <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-semibold">
            {selectedCount}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {selectedCount} vendor{selectedCount !== 1 ? 's' : ''} selected
            </p>
            <p className="text-sm text-muted-foreground">
              Choose a bulk action to apply to selected vendors
            </p>
          </div>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PENDING TAB - Approve & Reject */}
          {activeTab === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={onBulkApprove}
                iconName="Check"
                iconPosition="left"
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onBulkReject}
                iconName="X"
                iconPosition="left"
              >
                Reject
              </Button>
            </>
          )}

          {/* APPROVED TAB - Activate & Deactivate */}
          {activeTab === 'approved' && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={onBulkActivate}
                iconName="Play"
                iconPosition="left"
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkDeactivate}
                iconName="Pause"
                iconPosition="left"
              >
                Deactivate
              </Button>
            </>
          )}

          {/* REJECTED TAB - Delete Only */}
          {activeTab === 'rejected' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
              iconName="Trash2"
              iconPosition="left"
            >
              Delete
            </Button>
          )}

          {/* Clear Selection - Available on all tabs */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            iconName="X"
            iconPosition="left"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;