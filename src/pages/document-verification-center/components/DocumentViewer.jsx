import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const DocumentViewer = ({ document, isOpen, onClose, onApprove, onReject, onRequestResubmission }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [comment, setComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [actionType, setActionType] = useState(null);

  if (!isOpen || !document) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  const handleAction = (type) => {
    setActionType(type);
    setShowCommentForm(true);
  };

  const handleSubmitAction = () => {
    if (!comment?.trim()) return;

    const actionData = {
      ...document,
      comment: comment?.trim(),
      reviewedAt: new Date()?.toLocaleString(),
      reviewedBy: 'Admin User'
    };

    switch (actionType) {
      case 'approve':
        onApprove(actionData);
        break;
      case 'reject':
        onReject(actionData);
        break;
      case 'resubmit':
        onRequestResubmission(actionData);
        break;
    }

    setComment('');
    setShowCommentForm(false);
    setActionType(null);
    onClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-success';
      case 'rejected':
        return 'text-error';
      case 'requires-resubmission':
        return 'text-warning';
      default:
        return 'text-secondary';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{document?.type}</h2>
            <p className="text-sm text-muted-foreground">{document?.vendorName}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium capitalize ${getStatusColor(document?.status)}`}>
              {document?.status?.replace('-', ' ')}
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Image Viewer */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <Icon name="ZoomOut" size={16} />
                </Button>
                <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <Icon name="ZoomIn" size={16} />
                </Button>
                <div className="w-px h-6 bg-border mx-2" />
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <Icon name="RotateCw" size={16} />
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <Icon name="RotateCcw" size={16} />
                  Reset
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {document?.fileSize} • Uploaded {document?.uploadedAt}
              </div>
            </div>

            {/* Image Container */}
            <div className="flex-1 overflow-auto bg-muted p-4">
              <div className="flex items-center justify-center min-h-full">
                <div
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <Image
                    src={document?.imageUrl}
                    alt={`${document?.type} - ${document?.vendorName}`}
                    className="max-w-none shadow-lg rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-border flex flex-col">
            {/* Document Info */}
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-foreground mb-3">Document Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="text-foreground">{document?.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor:</span>
                  <span className="text-foreground">{document?.vendorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`capitalize ${getStatusColor(document?.status)}`}>
                    {document?.status?.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Size:</span>
                  <span className="text-foreground">{document?.fileSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span className="text-foreground">{document?.uploadedAt}</span>
                </div>
              </div>
            </div>

            {/* Comments History */}
            <div className="p-4 border-b border-border flex-1 overflow-auto">
              <h3 className="font-medium text-foreground mb-3">Comments History</h3>
              {document?.comments && document?.comments?.length > 0 ? (
                <div className="space-y-3">
                  {document?.comments?.map((comment, index) => (
                    <div key={index} className="bg-muted rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{comment?.author}</span>
                        <span className="text-xs text-muted-foreground">{comment?.date}</span>
                      </div>
                      <p className="text-sm text-foreground">{comment?.text}</p>
                      {comment?.action && (
                        <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${getStatusColor(comment?.action)} bg-current/10`}>
                          {comment?.action?.replace('-', ' ')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              )}
            </div>

            {/* Action Buttons */}
            {document?.status === 'pending' && !showCommentForm && (
              <div className="p-4 space-y-2">
                <Button
                  variant="success"
                  fullWidth
                  onClick={() => handleAction('approve')}
                >
                  <Icon name="Check" size={16} />
                  Approve Document
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => handleAction('resubmit')}
                >
                  <Icon name="RefreshCw" size={16} />
                  Request Resubmission
                </Button>
                <Button
                  variant="destructive"
                  fullWidth
                  onClick={() => handleAction('rejected')}
                >
                  <Icon name="X" size={16} />
                  Reject Document
                </Button>
              </div>
            )}

            {/* Comment Form */}
            {showCommentForm && (
              <div className="p-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-3">
                  Add Comment ({actionType === 'approved' ? 'Approval' : actionType === 'rejected' ? 'Rejection' : 'Resubmission'})
                </h4>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e?.target?.value)}
                  placeholder="Enter your comment..."
                  className="w-full h-24 px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  required
                />
                <div className="flex space-x-2 mt-3">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSubmitAction}
                    disabled={!comment?.trim()}
                    className="flex-1"
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCommentForm(false);
                      setActionType(null);
                      setComment('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;