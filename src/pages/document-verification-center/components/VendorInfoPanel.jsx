import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const VendorInfoPanel = ({ vendor }) => {
  if (!vendor) return null;

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 50) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start space-x-4 mb-6">
        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={vendor?.logo}
            alt={`${vendor?.name} logo`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground mb-1">{vendor?.name}</h2>
          <p className="text-muted-foreground mb-2">{vendor?.businessType}</p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="MapPin" size={14} />
              <span>{vendor?.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={14} />
              <span>Registered {vendor?.registrationDate}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Verification Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-foreground">Verification Progress</h3>
          <span className="text-sm font-medium text-foreground">{vendor?.verificationProgress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(vendor?.verificationProgress)}`}
            style={{ width: `${vendor?.verificationProgress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {vendor?.documentsVerified} of {vendor?.totalDocuments} documents verified
        </p>
      </div>
      {/* Contact Information */}
      <div className="mb-6">
        <h3 className="font-medium text-foreground mb-3">Contact Information</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Icon name="Mail" size={16} className="text-muted-foreground" />
            <div>
              <p className="text-sm text-foreground">{vendor?.email}</p>
              <p className="text-xs text-muted-foreground">Primary Email</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Icon name="Phone" size={16} className="text-muted-foreground" />
            <div>
              <p className="text-sm text-foreground">{vendor?.phone}</p>
              <p className="text-xs text-muted-foreground">Business Phone</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Icon name="Globe" size={16} className="text-muted-foreground" />
            <div>
              <p className="text-sm text-foreground">{vendor?.website}</p>
              <p className="text-xs text-muted-foreground">Website</p>
            </div>
          </div>
        </div>
      </div>
      {/* Business Registration */}
      <div className="mb-6">
        <h3 className="font-medium text-foreground mb-3">Business Registration</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Registration Number:</span>
            <span className="text-foreground font-mono">{vendor?.registrationNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST Number:</span>
            <span className="text-foreground font-mono">{vendor?.gstNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">PAN Number:</span>
            <span className="text-foreground font-mono">{vendor?.panNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Incorporation Date:</span>
            <span className="text-foreground">{vendor?.incorporationDate}</span>
          </div>
        </div>
      </div>
      {/* Document Status Summary */}
      <div>
        <h3 className="font-medium text-foreground mb-3">Document Status</h3>
        <div className="space-y-2">
          {vendor?.documentStatus?.map((doc, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="FileText" size={14} className="text-muted-foreground" />
                <span className="text-sm text-foreground">{doc?.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                {doc?.status === 'approved' && (
                  <Icon name="CheckCircle" size={14} className="text-success" />
                )}
                {doc?.status === 'rejected' && (
                  <Icon name="XCircle" size={14} className="text-error" />
                )}
                {doc?.status === 'pending' && (
                  <Icon name="Clock" size={14} className="text-secondary" />
                )}
                {doc?.status === 'requires-resubmission' && (
                  <Icon name="AlertCircle" size={14} className="text-warning" />
                )}
                <span className={`text-xs capitalize px-2 py-1 rounded-full ${
                  doc?.status === 'approved' ? 'bg-success/10 text-success' :
                  doc?.status === 'rejected' ? 'bg-error/10 text-error' :
                  doc?.status === 'requires-resubmission'? 'bg-warning/10 text-warning' : 'bg-secondary/10 text-secondary'
                }`}>
                  {doc?.status?.replace('-', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorInfoPanel;