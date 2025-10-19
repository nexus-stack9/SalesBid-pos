import React, { useEffect, useState } from 'react';
import { getAllmatrixByVendorId } from '../../../services/posCrud'; // Import the API function
import Icon from '../../../components/AppIcon'; // Assuming your Icon component is set up correctly

const StatsCards = ({ vendorId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getAllmatrixByVendorId(vendorId); // Fetch stats data from API
        console.log("data", data);
        setStats(data.data[0]); // Set the data in state
      } catch (error) {
        console.error("Error loading stats", error);
      }
      setLoading(false);
    };

    fetchStats(); // Call API when the component mounts or when vendorId changes
  }, [vendorId]);

  // Handle the case when the data is still loading or unavailable
  if (loading) {
    
  }

  // Handle the case if no data is available
  if (!stats) {
    return <div>No data available.</div>;
  }

  // Prepare cards data based on the fetched stats
  const cards = [
    {
      title: 'Total Products',
      value: stats?.total_products || '0',
      change: '+12%', // Adjust this based on your data
      changeType: 'positive',
      icon: 'Package',
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Active Auctions',
      value: stats?.live_auctions || '0',
      change: '+8%', // Adjust this based on your data
      changeType: 'positive',
      icon: 'Zap',
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Scheduled Auctions',
      value: stats?.scheduled_auctions || '0',
      change: '+15%', // Adjust this based on your data
      changeType: 'positive',
      icon: 'Calendar',
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats?.total_revenue?.toLocaleString() || '0'}`, // Ensure the total_revenue exists and is a number
      change: '+23%', // Adjust this based on your data
      changeType: 'positive',
      icon: 'IndianRupee',
      color: 'bg-accent/10 text-accent',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
              <Icon name={card.icon} size={24} />
            </div>
            <span className={`text-sm font-medium ${card.changeType === 'positive' ? 'text-success' : 'text-error'}`}>
              {card.change}
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground mb-1">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
