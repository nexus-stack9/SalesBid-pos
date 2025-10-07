import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'SSL Encrypted',
      description: '256-bit encryption'
    },
    {
      icon: 'Lock',
      title: 'Secure Login',
      description: 'Multi-factor authentication'
    },
    {
      icon: 'CheckCircle',
      title: 'Verified Platform',
      description: 'SOC 2 compliant'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <div className="text-center mb-8">
        <h2 className="text-lg font-medium text-foreground mb-2">Enterprise Security</h2>
        <p className="text-sm text-muted-foreground">Your data is protected with industry-leading security measures</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {securityFeatures?.map((feature, index) => (
          <div key={index} className="flex items-center justify-center space-x-3 p-4 bg-card border border-border rounded-lg">
            <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name={feature?.icon} size={20} className="text-success" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-sm font-medium text-foreground">{feature?.title}</h3>
              <p className="text-xs text-muted-foreground">{feature?.description}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Trust Indicators */}
      <div className="flex items-center justify-center space-x-8 mt-8 pt-6 border-t border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Award" size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">ISO 27001 Certified</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Globe" size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">GDPR Compliant</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Users" size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">10,000+ Trusted Users</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityBadges;