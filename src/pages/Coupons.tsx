
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/shared/DataTable';
import { toast } from 'sonner';

// Mock data - in a real app, this would come from an API
const fetchCoupons = async () => {
  // Simulate API call
  return [
    { id: '1', code: 'SUMMER25', discount: 25, type: 'percentage', validUntil: '2023-08-31', status: 'active', usageLimit: 100, usageCount: 45 },
    { id: '2', code: 'WELCOME10', discount: 10, type: 'percentage', validUntil: '2023-12-31', status: 'active', usageLimit: 500, usageCount: 123 },
    { id: '3', code: 'FREESHIP', discount: 15, type: 'fixed', validUntil: '2023-07-15', status: 'expired', usageLimit: 200, usageCount: 200 },
    { id: '4', code: 'FLASH50', discount: 50, type: 'percentage', validUntil: '2023-06-30', status: 'expired', usageLimit: 50, usageCount: 48 },
    { id: '5', code: 'HOLIDAY20', discount: 20, type: 'percentage', validUntil: '2023-12-25', status: 'active', usageLimit: 300, usageCount: 0 },
  ];
};

const deleteCoupon = async (id: string) => {
  // Simulate API call
  console.log(`Deleting coupon with ID: ${id}`);
  return true;
};

const Coupons = () => {
  const { data: coupons = [], isLoading, refetch } = useQuery({
    queryKey: ['coupons'],
    queryFn: fetchCoupons,
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id);
        toast.success('Coupon deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete coupon');
        console.error(error);
      }
    }
  };

  const columns = [
    {
      id: 'code',
      header: 'Code',
      cell: (coupon: any) => <div className="font-medium">{coupon.code}</div>,
      filterType: 'text' as const,
    },
    {
      id: 'discount',
      header: 'Discount',
      cell: (coupon: any) => <div>{coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`}</div>,
      filterType: 'number' as const,
    },
    {
      id: 'type',
      header: 'Type',
      cell: (coupon: any) => <div className="capitalize">{coupon.type}</div>,
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Percentage', value: 'percentage' },
        { label: 'Fixed', value: 'fixed' },
      ],
    },
    {
      id: 'validUntil',
      header: 'Valid Until',
      cell: (coupon: any) => <div>{coupon.validUntil}</div>,
      filterType: 'date' as const,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (coupon: any) => (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          coupon.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {coupon.status}
        </div>
      ),
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Expired', value: 'expired' },
      ],
    },
    {
      id: 'usage',
      header: 'Usage',
      cell: (coupon: any) => <div>{coupon.usageCount} / {coupon.usageLimit}</div>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (coupon: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/coupons/${coupon.id}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
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
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-purple-600 hover:to-blue-600 shadow-md hover:shadow-lg transition-all duration-200">
          <Link to="/coupons/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Coupon
          </Link>
        </Button>
      </div>

      <DataTable 
        data={coupons} 
        columns={columns} 
        searchKey="code"
      />
    </div>
  );
};

export default Coupons;
