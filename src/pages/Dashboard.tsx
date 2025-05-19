
import { useState } from 'react';
import { Users, ShoppingBag, Store, DollarSign, Calendar, ShoppingCart } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesOverviewChart from '@/components/dashboard/SalesOverviewChart';
import TopSellingProductsChart from '@/components/dashboard/TopSellingProductsChart';
import RevenueTrendsChart from '@/components/dashboard/RevenueTrendsChart';
import OrdersTypeChart from '@/components/dashboard/OrdersTypeChart';
import CustomerActivityChart from '@/components/dashboard/CustomerActivityChart';

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Tabs defaultValue="monthly" className="w-[400px]" onValueChange={setTimeframe}>
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard 
          title="Total Revenue" 
          value="$45,231.89" 
          icon={DollarSign} 
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard 
          title="Products" 
          value="2,834" 
          icon={ShoppingBag} 
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard 
          title="Orders" 
          value="1,253" 
          icon={ShoppingCart} 
          trend={{ value: 14.3, isPositive: true }}
        />
        <StatCard 
          title="Employees" 
          value="573" 
          icon={Users} 
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard 
          title="Stores" 
          value="45" 
          icon={Store} 
          trend={{ value: 0.5, isPositive: false }}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Monthly sales and revenue overview
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <PerformanceChart timeframe={timeframe} />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <RecentActivity />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersTypeChart timeframe={timeframe} />
        <CustomerActivityChart timeframe={timeframe} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesOverviewChart timeframe={timeframe} />
        <RevenueTrendsChart timeframe={timeframe} />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <TopSellingProductsChart timeframe={timeframe} />
      </div>
    </div>
  );
};

export default Dashboard;
