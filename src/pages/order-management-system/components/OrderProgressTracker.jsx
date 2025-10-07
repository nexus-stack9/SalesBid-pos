import React from 'react';
import Icon from '../../../components/AppIcon';

const OrderProgressTracker = ({ currentStatus, orderId, onStatusUpdate }) => {
  const progressSteps = [
    { key: 'pending', label: 'Pending', icon: 'Clock' },
    { key: 'confirmed', label: 'Confirmed', icon: 'CheckCircle' },
    { key: 'processing', label: 'Processing', icon: 'Package' },
    { key: 'shipped', label: 'Shipped', icon: 'Truck' },
    { key: 'delivered', label: 'Delivered', icon: 'Home' }
  ];

  const getCurrentStepIndex = () => {
    return progressSteps?.findIndex(step => step?.key === currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  const handleStepClick = (stepKey, stepIndex) => {
    if (stepIndex <= currentStepIndex + 1 && onStatusUpdate) {
      onStatusUpdate(orderId, stepKey);
    }
  };

  return (
    <div className="flex items-center justify-between w-full max-w-md">
      {progressSteps?.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isClickable = index <= currentStepIndex + 1;
        
        return (
          <React.Fragment key={step?.key}>
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleStepClick(step?.key, index)}
                disabled={!isClickable || !onStatusUpdate}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isCompleted
                    ? 'bg-success text-success-foreground'
                    : isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : isClickable
                    ? 'bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer'
                    : 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                }`}
              >
                <Icon 
                  name={isCompleted ? 'Check' : step?.icon} 
                  size={16} 
                />
              </button>
              <span className={`text-xs mt-1 text-center ${
                isCurrent 
                  ? 'text-primary font-medium' 
                  : isCompleted 
                  ? 'text-success' :'text-muted-foreground'
              }`}>
                {step?.label}
              </span>
            </div>
            {index < progressSteps?.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                index < currentStepIndex 
                  ? 'bg-success' :'bg-muted'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default OrderProgressTracker;