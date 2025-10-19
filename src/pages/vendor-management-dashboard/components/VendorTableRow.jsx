import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import VendorStatusBadge from './VendorStatusBadge';
import VendorDetailsModal from '../../../components/ui/VendorDetailsModal';
import JustificationModal from '../../../components/ui/JustificationModal';
import { updateVendorActiveStatus } from '../../../services/posCrud';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '../../../components/ui/Checkbox';

const VendorTableRow = ({ vendor, onStatusChange, onBulkSelect, isSelected, onVendorActiveToggle }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [justificationModal, setJustificationModal] = useState({ isOpen: false, action: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleApprove = (e) => {
    e?.stopPropagation();
    if (isProcessing) return;
    setJustificationModal({ isOpen: true, action: 'approved' });
  };

  const handleReject = (e) => {
    e?.stopPropagation();
    if (isProcessing) return;
    setJustificationModal({ isOpen: true, action: 'rejected' });
  };

  const handleJustificationSubmit = async (data) => {
    const { justification, action } = data;
    if (!action || isProcessing) return;

    setIsProcessing(true);
    try {
      console.log('🔵 VendorTableRow: Calling parent onStatusChange');
      await onStatusChange(vendor?.vendor_id, action, justification);
      console.log('✅ VendorTableRow: Status change completed');
    } catch (error) {
      console.error('❌ Error in handleJustificationSubmit:', error);
      alert('Failed to update vendor status. Please try again.');
    } finally {
      setJustificationModal({ isOpen: false, action: null });
      setTimeout(() => setIsProcessing(false), 1000);
    }
  };

  const handleToggleActive = async (e, vendorData) => {
    e?.stopPropagation();
    if (isProcessing) return;
    
    const newStatus = !vendorData?.isactive;
    setIsProcessing(true);

    try {
      console.log('🔵 Toggling vendor active status:', { 
        vendorId: vendorData?.vendor_id, 
        vendorName: vendorData?.business_name,
        currentStatus: vendorData?.isactive,
        newStatus 
      });
      
      const response = await updateVendorActiveStatus(vendorData?.vendor_id, newStatus);
      console.log('✅ API Toggle response:', response);
      
      if (onVendorActiveToggle) {
        console.log('🔄 Calling parent onVendorActiveToggle...');
        await onVendorActiveToggle(vendorData?.vendor_id, newStatus);
        console.log('✅ Parent state updated');
      }
    } catch (error) {
      console.error('❌ Error toggling vendor status:', error);
      alert('Failed to update vendor status. Please try again.');
    } finally {
      setTimeout(() => setIsProcessing(false), 1000);
    }
  };

  const handleViewDetails = (e) => {
    e?.stopPropagation();
    setShowDetailsModal(true);
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onBulkSelect(vendor?.vendor_id, e.target.checked);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <tr className="border-b border-border hover:bg-muted/50 transition-colors">
        <td className="p-4 align-middle">
          <Checkbox
            checked={isSelected}
            onChange={handleCheckboxChange}
          />
        </td>

        <td className="p-4 align-middle">
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

        <td className="p-4 text-sm align-middle">
          <div>{vendor?.email}</div>
          <div className="text-muted-foreground">{vendor?.phone_number}</div>
        </td>

        <td className="p-4 text-sm text-muted-foreground align-middle">{vendor?.items_category}</td>

        <td className="p-4 text-sm text-muted-foreground align-middle">{formatDate(vendor?.created_at)}</td>

        <td className="p-4 align-middle">
          <div className="flex items-center space-x-2">
            <VendorStatusBadge status={vendor?.approval_status} />
            {vendor?.approval_status === 'approved' && (
              <VendorStatusBadge
                status={vendor?.isactive ? 'active' : 'inactive'}
                size="sm"
              />
            )}
          </div>
        </td>

        <td className="p-4 align-middle">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewDetails}
              iconName="Eye"
              title="View Details"
              type="button"
              disabled={isProcessing}
            />

            {vendor?.approval_status === 'pending' && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleApprove}
                  iconName="Check"
                  title="Approve Vendor"
                  type="button"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReject}
                  iconName="X"
                  title="Reject Vendor"
                  type="button"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Reject'}
                </Button>
              </>
            )}

            {vendor?.approval_status === 'approved' && (
              <Button
                variant={vendor?.isactive ? 'outline' : 'success'}
                size="sm"
                onClick={(e) => handleToggleActive(e, vendor)}
                iconName={vendor?.isactive ? 'Pause' : 'Play'}
                title={vendor?.isactive ? 'Deactivate Vendor' : 'Activate Vendor'}
                type="button"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : (vendor?.isactive ? 'Deactivate' : 'Activate')}
              </Button>
            )}
          </div>
        </td>
      </tr>

      <VendorDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        vendor={vendor}
      />

      <JustificationModal
        isOpen={justificationModal.isOpen}
        onClose={() => setJustificationModal({ isOpen: false, action: null })}
        onSubmit={handleJustificationSubmit}
        action={justificationModal.action}
        vendor={vendor}
      />
    </>
  );
};

export const VendorMobileCard = ({ vendor, onStatusChange, onBulkSelect, isSelected, onVendorActiveToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [justificationModal, setJustificationModal] = useState({ isOpen: false, action: null });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = (e) => {
    e?.stopPropagation();
    if (isProcessing) return;
    setJustificationModal({ isOpen: true, action: 'approved' });
  };

  const handleReject = (e) => {
    e?.stopPropagation();
    if (isProcessing) return;
    setJustificationModal({ isOpen: true, action: 'rejected' });
  };

  const handleJustificationSubmit = async (data) => {
    const { justification, action } = data;
    if (!action || isProcessing) return;

    setIsProcessing(true);
    try {
      await onStatusChange(vendor?.vendor_id, action, justification);
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Failed to update vendor status. Please try again.');
    } finally {
      setJustificationModal({ isOpen: false, action: null });
      setTimeout(() => setIsProcessing(false), 1000);
    }
  };

  const handleToggleActive = async (e, vendorData) => {
    e?.stopPropagation();
    if (isProcessing) return;
    
    const newStatus = !vendorData?.isactive;
    setIsProcessing(true);

    try {
      const response = await updateVendorActiveStatus(vendorData?.vendor_id, newStatus);
      if (onVendorActiveToggle) {
        await onVendorActiveToggle(vendorData?.vendor_id, newStatus);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Failed to update vendor status. Please try again.');
    } finally {
      setTimeout(() => setIsProcessing(false), 1000);
    }
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onBulkSelect(vendor?.vendor_id, e.target.checked);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-4 mb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Checkbox checked={isSelected} onChange={handleCheckboxChange} />
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
            iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            type="button"
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <VendorStatusBadge status={vendor?.approval_status} />
            {vendor?.approval_status === 'approved' && (
              <VendorStatusBadge
                status={vendor?.isactive ? 'active' : 'inactive'}
                size="sm"
              />
            )}
          </div>
          <span className="text-sm text-muted-foreground">{formatDate(vendor?.created_at)}</span>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailsModal(true)}
                iconName="Eye"
                fullWidth
                type="button"
                disabled={isProcessing}
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
                    type="button"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleReject}
                    iconName="X"
                    fullWidth
                    type="button"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Reject'}
                  </Button>
                </>
              )}

              {vendor?.approval_status === 'approved' && (
                <Button
                  variant={vendor?.isactive ? 'outline' : 'success'}
                  size="sm"
                  onClick={(e) => handleToggleActive(e, vendor)}
                  iconName={vendor?.isactive ? 'Pause' : 'Play'}
                  fullWidth
                  type="button"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : (vendor?.isactive ? 'Deactivate' : 'Activate')}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <VendorDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        vendor={vendor}
      />

      <JustificationModal
        isOpen={justificationModal.isOpen}
        onClose={() => setJustificationModal({ isOpen: false, action: null })}
        onSubmit={handleJustificationSubmit}
        action={justificationModal.action}
        vendor={vendor}
      />
    </>
  );
};

export default VendorTableRow;