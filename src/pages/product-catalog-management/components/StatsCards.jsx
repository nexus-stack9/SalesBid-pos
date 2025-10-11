import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts,
      change: '+12%',
      changeType: 'positive',
      icon: 'Package',
      color: 'bg-primary/10 text-primary'
    },
    {
      title: 'Active Auctions',
      value: stats?.activeAuctions,
      change: '+8%',
      changeType: 'positive',
      icon: 'Zap',
      color: 'bg-success/10 text-success'
    },
    {
      title: 'Scheduled Auctions',
      value: stats?.scheduledAuctions,
      change: '+15%',
      changeType: 'positive',
      icon: 'Calendar',
      color: 'bg-warning/10 text-warning'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats?.totalRevenue?.toLocaleString()}`,
      change: '+23%',      
      changeType: 'positive',
      icon: 'DollarSign',
      color: 'bg-accent/10 text-accent'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards?.map((card, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card?.color}`}>
              <Icon name={card?.icon} size={24} />
            </div>
            <span className={`text-sm font-medium ${
              card?.changeType === 'positive' ? 'text-success' : 'text-error'
            }`}>
              {card?.change}
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground mb-1">{card?.value}</p>
            <p className="text-sm text-muted-foreground">{card?.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;