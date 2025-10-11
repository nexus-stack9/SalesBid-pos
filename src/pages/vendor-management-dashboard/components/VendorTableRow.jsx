import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import VendorStatusBadge from './VendorStatusBadge';
import VendorDetailsModal from '../../../components/ui/VendorDetailsModal';
import JustificationModal from '../../../components/ui/JustificationModal';
import { updateVendorStatus } from '../../../services/posCrud';
import { useNavigate } from 'react-router-dom';

const VendorTableRow = ({ vendor, onStatusChange, onBulkSelect, isSelected }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [justificationModal, setJustificationModal] = useState({ isOpen: false, action: null });
  const navigate = useNavigate();

  const handleApprove = () => {
    setJustificationModal({ isOpen: true, action: 'approve' });
  };

  const handleReject = () => {
    setJustificationModal({ isOpen: true, action: 'reject' });
  };

  const handleJustificationSubmit = async (data) => {
    let actionText = "";
    if(data?.action === 'approve') {
      actionText = "approved";
    } else {
      actionText = "rejected";
    }
    console.log('Justification submitted:', data);
    
    try {
      const response = await updateVendorStatus(vendor?.vendor_id, actionText);
      console.log('Status update response:', response);
      onStatusChange(vendor?.vendor_id, data?.action);
    } catch (error) {
      console.error('Error updating vendor status:', error);
    }
  };

  const handleToggleActive = async (vendorData) => {
    console.log('Toggling vendor:', vendorData);
    const newStatus = vendorData?.isActive ? 'inactive' : 'active';
    
    try {
      const response = await updateVendorStatus(vendorData?.vendor_id, newStatus);
      console.log('Toggle response:', response);
      onStatusChange(vendorData?.vendor_id, newStatus);
    } catch (error) {
      console.error('Error toggling vendor status:', error);
    }
  };

  const handleViewDetails = () => {
    setShowDetailsModal(true);
  };

  const handleViewDocuments = () => {
    navigate('/document-verification-center', { state: { vendorId: vendor?.vendor_id } });
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      {/* Desktop Row */}
      <tr className="hidden lg:table-row border-b border-border hover:bg-muted/50 transition-colors">
        <td className="p-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onBulkSelect(vendor?.vendor_id, e?.target?.checked)}
            className="rounded border-border"
          />
        </td>
        <td className="p-4">
          <div className="flex items-center space-x-3">
            <Image
              src={vendor?.profile_picture}
              alt={vendor?.business_name}
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div>
              <div className="font-medium text-foreground">{vendor?.business_name}</div>
              <div className="text-sm text-muted-foreground">{vendor?.vendor_name}</div>
            </div>
          </div>
        </td>
        <td className="p-4">
          <div className="text-sm">
            <div className="text-foreground">{vendor?.email}</div>
            <div className="text-muted-foreground">{vendor?.phone_number}</div>
          </div>
        </td>
        <td className="p-4 text-sm text-muted-foreground">
          {vendor?.items_category}
        </td>
        <td className="p-4 text-sm text-muted-foreground">
          {formatDate(vendor?.created_at)}
        </td>
        <td className="p-4">
          <div className="flex items-center space-x-2">
            <VendorStatusBadge status={vendor?.approval_status} />
            {vendor?.approval_status === 'approved' && (
              <VendorStatusBadge status={vendor?.isActive ? 'active' : 'inactive'} size="sm" />
            )}
          </div>
        </td>
        <td className="p-4">
          <div className="flex items-center space-x-2">
            {/* View Details Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewDetails}
              iconName="Eye"
              title="View Details"
            />
            
            {vendor?.approval_status === 'pending' && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleApprove}
                  iconName="Check"
                  title="Approve Vendor"
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReject}
                  iconName="X"
                  title="Reject Vendor"
                >
                  Reject
                </Button>
              </>
            )}
            {vendor?.approval_status === 'approved' && (
              <Button
                variant={vendor?.isActive ? "outline" : "success"}
                size="sm"
                onClick={() => handleToggleActive(vendor)}
                iconName={vendor?.isActive ? "Pause" : "Play"}
                title={vendor?.isActive ? 'Deactivate Vendor' : 'Activate Vendor'}
              >
                {vendor?.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            )}
          </div>
        </td>
      </tr>

      {/* Mobile Card */}
      <div className="lg:hidden bg-card border border-border rounded-lg p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onBulkSelect(vendor?.vendor_id, e?.target?.checked)}
              className="rounded border-border"
            />
            <Image
              src={vendor?.profile_picture}
              alt={vendor?.business_name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <div className="font-medium text-foreground">{vendor?.business_name}</div>
              <div className="text-sm text-muted-foreground">{vendor?.vendor_name}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <VendorStatusBadge status={vendor?.approval_status} />
            {vendor?.approval_status === 'approved' && (
              <VendorStatusBadge status={vendor?.isActive ? 'active' : 'inactive'} size="sm" />
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDate(vendor?.created_at)}
          </span>
        </div>

        {isExpanded && (
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="text-foreground">{vendor?.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone: </span>
                <span className="text-foreground">{vendor?.phone_number}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Category: </span>
                <span className="text-foreground">{vendor?.items_category}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* View Details Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                iconName="Eye"
                fullWidth
              >
                View Details
              </Button>
              
              {vendor?.approval_status === 'pending' && (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleApprove}
                    iconName="Check"
                    fullWidth
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleReject}
                    iconName="X"
                    fullWidth
                  >
                    Reject
                  </Button>
                </>
              )}
              {vendor?.approval_status === 'approved' && (
                <Button
                  variant={vendor?.isActive ? "outline" : "success"}
                  size="sm"
                  onClick={() => handleToggleActive(vendor)}
                  iconName={vendor?.isActive ? "Pause" : "Play"}
                  fullWidth
                >
                  {vendor?.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <VendorDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        vendor={vendor}
        onStatusChange={(vendorId, action) => {
          if (action === 'approve' || action === 'reject') {
            setJustificationModal({ isOpen: true, action });
          } else {
            onStatusChange(vendorId, action);
          }
          setShowDetailsModal(false);
        }}
      />
      
      <JustificationModal
        isOpen={justificationModal?.isOpen}
        onClose={() => setJustificationModal({ isOpen: false, action: null })}
        onSubmit={handleJustificationSubmit}
        action={justificationModal?.action}
        vendor={vendor}
      />
    </>
  );
};

export default VendorTableRow;