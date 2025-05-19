
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  
  // Sample data - in a real app this would come from an API
  const ordersData = [
    { id: '1001', customer: 'John Smith', date: '2023-08-15', amount: '$156.99', status: 'Delivered', type: 'online' },
    { id: '1002', customer: 'Sarah Johnson', date: '2023-08-16', amount: '$89.45', status: 'Processing', type: 'online' },
    { id: '1003', customer: 'Michael Brown', date: '2023-08-17', amount: '$245.30', status: 'Delivered', type: 'offline' },
    { id: '1004', customer: 'Emily Davis', date: '2023-08-18', amount: '$127.80', status: 'Shipped', type: 'online' },
    { id: '1005', customer: 'David Wilson', date: '2023-08-19', amount: '$78.50', status: 'Delivered', type: 'offline' },
    { id: '1006', customer: 'Lisa Taylor', date: '2023-08-20', amount: '$310.25', status: 'Processing', type: 'online' },
    { id: '1007', customer: 'James Anderson', date: '2023-08-21', amount: '$95.75', status: 'Shipped', type: 'online' },
    { id: '1008', customer: 'Jennifer Thomas', date: '2023-08-22', amount: '$198.60', status: 'Delivered', type: 'offline' },
    { id: '1009', customer: 'Robert Jackson', date: '2023-08-23', amount: '$167.40', status: 'Processing', type: 'online' },
    { id: '1010', customer: 'Elizabeth White', date: '2023-08-24', amount: '$135.90', status: 'Delivered', type: 'offline' },
  ];

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      toast.success(`Order ${id} deleted successfully`);
      // In a real application, you would call an API to delete the order
    }
  };
  
  // Filter the orders based on search query and type filter
  const filteredOrders = ordersData.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = 
      orderTypeFilter === 'all' || 
      order.type === orderTypeFilter;
      
    return matchesSearch && matchesType;
  });
  
  const columns = [
    {
      id: 'id',
      header: 'Order ID',
      cell: (row) => row.id,
      filterType: 'text' as const
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: (row) => row.customer,
      filterType: 'text' as const
    },
    {
      id: 'date',
      header: 'Date',
      cell: (row) => row.date,
      filterType: 'text' as const
    },
    {
      id: 'amount',
      header: 'Amount',
      cell: (row) => row.amount,
      filterType: 'text' as const
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge variant={
          row.status === 'Delivered' ? 'success' : 
          row.status === 'Shipped' ? 'secondary' : 'default'
        }>
          {row.status}
        </Badge>
      ),
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Delivered', value: 'Delivered' },
        { label: 'Shipped', value: 'Shipped' },
        { label: 'Processing', value: 'Processing' },
      ]
    },
    {
      id: 'type',
      header: 'Type',
      cell: (row) => (
        <Badge variant={row.type === 'online' ? 'outline' : 'secondary'}>
          {row.type === 'online' ? 'Online' : 'In-store'}
        </Badge>
      ),
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Online', value: 'online' },
        { label: 'In-store', value: 'offline' },
      ]
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/orders/${row.id}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      )
    },
  ];
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Orders</h2>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-purple-600 hover:to-blue-600 shadow-md hover:shadow-lg transition-all duration-200">
          <Link to="/orders/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Order
          </Link>
        </Button>
      </div>
      
      <DataTable columns={columns} data={filteredOrders} searchKey="customer" />
    </div>
  );
};

export default Orders;
