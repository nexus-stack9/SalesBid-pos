import React from 'react';
import Button from '../../../components/ui/Button';

const VendorStatusTabs = ({ activeTab, onTabChange, counts }) => {
  const tabs = [
    { id: 'pending', label: 'Pending', count: counts?.pending, variant: 'warning' },
    { id: 'approved', label: 'Approved', count: counts?.approved, variant: 'success' },
    { id: 'rejected', label: 'Rejected', count: counts?.rejected, variant: 'destructive' }
  ];

  return (
    <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6">
      {tabs?.map((tab) => (
        <Button
          key={tab?.id}
          variant={activeTab === tab?.id ? 'default' : 'ghost'}
          onClick={() => onTabChange(tab?.id)}
          className="flex-1 relative"
        >
          {tab?.label}
          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
            activeTab === tab?.id 
              ? 'bg-white/20 text-white' 
              : tab?.variant === 'warning' ?'bg-warning/10 text-warning' 
                : tab?.variant === 'success' ?'bg-success/10 text-success' :'bg-error/10 text-error'
          }`}>
            {tab?.count}
          </span>
        </Button>
      ))}
    </div>
  );
};

export default VendorStatusTabs;