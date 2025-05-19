
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/shared/DataTable';
import { toast } from 'sonner';

// Mock data - in a real app, this would come from an API
const fetchCustomers = async () => {
  // Simulate API call
  return [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '555-1234', status: 'active', orders: 5, dateJoined: '2023-01-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '555-5678', status: 'active', orders: 3, dateJoined: '2023-02-20' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '555-9012', status: 'inactive', orders: 1, dateJoined: '2023-03-10' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', phone: '555-3456', status: 'active', orders: 8, dateJoined: '2022-11-05' },
    { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', phone: '555-7890', status: 'active', orders: 2, dateJoined: '2023-04-25' },
  ];
};

const deleteCustomer = async (id: string) => {
  // Simulate API call
  console.log(`Deleting customer with ID: ${id}`);
  return true;
};

const Customers = () => {
  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
        toast.success('Customer deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete customer');
        console.error(error);
      }
    }
  };

  const columns = [
    {
      id: 'name',
      header: 'Name',
      cell: (customer: any) => <div>{customer.name}</div>,
      filterType: 'text' as const,
    },
    {
      id: 'email',
      header: 'Email',
      cell: (customer: any) => <div>{customer.email}</div>,
      filterType: 'text' as const,
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: (customer: any) => <div>{customer.phone}</div>,
      filterType: 'text' as const,
    },
    {
      id: 'orders',
      header: 'Orders',
      cell: (customer: any) => <div>{customer.orders}</div>,
      filterType: 'number' as const,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (customer: any) => (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {customer.status}
        </div>
      ),
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      id: 'dateJoined',
      header: 'Date Joined',
      cell: (customer: any) => <div>{customer.dateJoined}</div>,
      filterType: 'date' as const,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (customer: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/customers/${customer.id}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id)}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-purple-600 hover:to-blue-600 shadow-md hover:shadow-lg transition-all duration-200">
          <Link to="/customers/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </div>

      <DataTable 
        data={customers} 
        columns={columns} 
        searchKey="name"
      />
    </div>
  );
};

export default Customers;
