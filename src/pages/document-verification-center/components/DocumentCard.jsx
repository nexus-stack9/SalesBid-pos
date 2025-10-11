import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const DocumentCard = ({ document, onView, onApprove, onReject, onRequestResubmission }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-success-foreground';
      case 'rejected':
        return 'bg-error text-error-foreground';
      case 'requires-resubmission':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return 'CheckCircle';
      case 'rejected':
        return 'XCircle';
      case 'requires-resubmission':
        return 'AlertCircle';
      default:
        return 'Clock';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-foreground">{document?.type}</h3>
          <p className="text-sm text-muted-foreground">{document?.vendorName}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(document?.status)}`}>
          <Icon name={getStatusIcon(document?.status)} size={12} />
          <span className="capitalize">{document?.status?.replace('-', ' ')}</span>
        </div>
      </div>
      <div className="relative mb-4">
        <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden cursor-pointer" onClick={() => onView(document)}>
          <Image
            src={document?.imageUrl}
            alt={`${document?.type} - ${document?.vendorName}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(document)}
          className="absolute top-2 right-2 bg-background/80 hover:bg-background"
        >
          <Icon name="Eye" size={16} />
        </Button>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground mb-4">
        <div className="flex justify-between">
          <span>Uploaded:</span>
          <span>{document?.uploadedAt}</span>
        </div>
        <div className="flex justify-between">
          <span>File Size:</span>
          <span>{document?.fileSize}</span>
        </div>
        {document?.lastReviewed && (
          <div className="flex justify-between">
            <span>Last Reviewed:</span>
            <span>{document?.lastReviewed}</span>
          </div>
        )}
      </div>
      {document?.status === 'pending' && (
        <div className="flex space-x-2">
          <Button
            variant="success"
            size="sm"
            onClick={() => onApprove(document)}
            className="flex-1"
          >
            <Icon name="Check" size={16} />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRequestResubmission(document)}
            className="flex-1"
          >
            <Icon name="RefreshCw" size={16} />
            Resubmit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onReject(document)}
            className="flex-1"
          >
            <Icon name="X" size={16} />
            Reject
          </Button>
        </div>
      )}
      {document?.comments && document?.comments?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Latest Comment:</p>
          <p className="text-sm text-foreground">{document?.comments?.[document?.comments?.length - 1]?.text}</p>
        </div>
      )}
    </div>
  );
};

export default DocumentCard;