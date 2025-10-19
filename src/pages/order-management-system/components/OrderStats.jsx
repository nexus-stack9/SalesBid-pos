// components/OrderStats.jsx
import React from 'react';
import Icon from '../../../components/AppIcon';

const OrderStats = ({ stats }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.total?.toLocaleString('en-IN'),
      change: '+12.5%',
      changeType: 'positive',
      icon: 'ShoppingCart',
      color: 'primary'
    },
    {
      title: 'Pending Orders',
      value: stats?.pending?.toLocaleString('en-IN'),
      change: '+8.2%',
      changeType: 'positive',
      icon: 'Clock',
      color: 'warning'
    },
    {
      title: 'Processing',
      value: stats?.processing?.toLocaleString('en-IN'),
      change: '-3.1%',
      changeType: 'negative',
      icon: 'Package',
      color: 'accent'
    },
    {
      title: 'Delivered',
      value: stats?.delivered?.toLocaleString('en-IN'),
      change: '+15.3%',
      changeType: 'positive',
      icon: 'CheckCircle',
      color: 'success'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.revenue),
      change: '+18.7%',
      changeType: 'positive',
      icon: 'DollarSign',
      color: 'primary'
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(stats?.avgOrderValue),
      change: '+5.4%',
      changeType: 'positive',
      icon: 'TrendingUp',
      color: 'accent'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary/10 text-primary',
      warning: 'bg-warning/10 text-warning',
      accent: 'bg-accent/10 text-accent',
      success: 'bg-success/10 text-success'
    };
    return colorMap?.[color] || colorMap?.primary;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
      {statCards?.map((stat, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(stat?.color)}`}>
              <Icon name={stat?.icon} size={20} />
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              stat?.changeType === 'positive' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
            }`}>
              {stat?.change}
            </div>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-foreground mb-1">{stat?.value}</p>
            <p className="text-sm text-muted-foreground">{stat?.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderStats;