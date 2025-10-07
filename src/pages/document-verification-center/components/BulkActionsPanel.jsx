import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const BulkActionsPanel = ({ 
  selectedDocuments, 
  onSelectAll, 
  onDeselectAll, 
  onBulkApprove, 
  onBulkReject, 
  onBulkRequestResubmission,
  totalDocuments,
  pendingDocuments 
}) => {
  const [showBulkCommentForm, setShowBulkCommentForm] = useState(false);
  const [bulkComment, setBulkComment] = useState('');
  const [bulkActionType, setBulkActionType] = useState(null);

  const handleBulkAction = (actionType) => {
    setBulkActionType(actionType);
    setShowBulkCommentForm(true);
  };

  const handleSubmitBulkAction = () => {
    if (!bulkComment?.trim() || selectedDocuments?.length === 0) return;

    const actionData = {
      documentIds: selectedDocuments,
      comment: bulkComment?.trim(),
      reviewedAt: new Date()?.toLocaleString(),
      reviewedBy: 'Admin User'
    };

    switch (bulkActionType) {
      case 'approve':
        onBulkApprove(actionData);
        break;
      case 'reject':
        onBulkReject(actionData);
        break;
      case 'resubmit':
        onBulkRequestResubmission(actionData);
        break;
    }

    setBulkComment('');
    setShowBulkCommentForm(false);
    setBulkActionType(null);
  };

  const cancelBulkAction = () => {
    setShowBulkCommentForm(false);
    setBulkActionType(null);
    setBulkComment('');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="font-medium text-foreground">Bulk Actions</h3>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedDocuments?.length === pendingDocuments}
              onChange={(e) => e?.target?.checked ? onSelectAll() : onDeselectAll()}
              indeterminate={selectedDocuments?.length > 0 && selectedDocuments?.length < pendingDocuments}
            />
            <span className="text-sm text-muted-foreground">
              {selectedDocuments?.length} of {pendingDocuments} pending documents selected
            </span>
          </div>
        </div>
        
        {selectedDocuments?.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="success"
              size="sm"
              onClick={() => handleBulkAction('approve')}
              disabled={showBulkCommentForm}
            >
              <Icon name="Check" size={16} />
              Approve ({selectedDocuments?.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('resubmit')}
              disabled={showBulkCommentForm}
            >
              <Icon name="RefreshCw" size={16} />
              Request Resubmission
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction('reject')}
              disabled={showBulkCommentForm}
            >
              <Icon name="X" size={16} />
              Reject ({selectedDocuments?.length})
            </Button>
          </div>
        )}
      </div>
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-semibold text-foreground">{totalDocuments}</div>
          <div className="text-sm text-muted-foreground">Total Documents</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-secondary">{pendingDocuments}</div>
          <div className="text-sm text-muted-foreground">Pending Review</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-success">
            {totalDocuments - pendingDocuments - Math.floor(totalDocuments * 0.1)}
          </div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-error">{Math.floor(totalDocuments * 0.1)}</div>
          <div className="text-sm text-muted-foreground">Rejected</div>
        </div>
      </div>
      {/* Bulk Comment Form */}
      {showBulkCommentForm && (
        <div className="border-t border-border pt-4">
          <h4 className="font-medium text-foreground mb-3">
            Bulk {bulkActionType === 'approve' ? 'Approval' : bulkActionType === 'reject' ? 'Rejection' : 'Resubmission'} Comment
          </h4>
          <textarea
            value={bulkComment}
            onChange={(e) => setBulkComment(e?.target?.value)}
            placeholder={`Enter comment for bulk ${bulkActionType}...`}
            className="w-full h-24 px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-3"
            required
          />
          <div className="flex space-x-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleSubmitBulkAction}
              disabled={!bulkComment?.trim()}
            >
              <Icon name="Send" size={16} />
              Submit Bulk Action
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={cancelBulkAction}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActionsPanel;