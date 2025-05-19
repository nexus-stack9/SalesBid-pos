
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EntityForm from '@/components/shared/EntityForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Schema for coupon data validation
const couponSchema = z.object({
  code: z.string().min(3, { message: "Code must be at least 3 characters." }),
  discount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Discount must be a positive number."
  }),
  type: z.string().min(1, { message: "Type is required." }),
  validUntil: z.string().min(1, { message: "Valid until date is required." }),
  usageLimit: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Usage limit must be a non-negative number."
  }),
  description: z.string().optional(),
  minPurchase: z.string().refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Minimum purchase must be a non-negative number."
  }).optional(),
  maxDiscount: z.string().refine((val) => val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Maximum discount must be a non-negative number."
  }).optional(),
  products: z.string().optional(),
  categories: z.string().optional(),
});

type CouponFormData = z.infer<typeof couponSchema>;

// Mock API calls - in a real app, these would call your backend API
const fetchCoupon = async (id: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Sample data - in a real app, this would be fetched from the server
  return {
    id,
    code: 'SUMMER25',
    discount: '25',
    type: 'percentage',
    validUntil: '2023-08-31',
    usageLimit: '100',
    description: 'Summer sale discount',
    minPurchase: '50',
    maxDiscount: '100',
    products: '1,2,3',
    categories: '5,6',
    status: 'active',
    usageCount: 45,
  };
};

const updateCoupon = async (data: CouponFormData & { id: string }) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Updating coupon:', data);
  return data;
};

const CouponEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: coupon, isLoading } = useQuery({
    queryKey: ['coupon', id],
    queryFn: () => fetchCoupon(id || ''),
    enabled: !!id,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateCoupon,
    onSuccess: () => {
      toast.success('Coupon updated successfully');
      navigate('/coupons');
    },
    onError: () => {
      toast.error('Failed to update coupon');
    },
  });

  const handleSubmit = (data: CouponFormData) => {
    mutate({ ...data, id: id || '' });
  };

  // Form fields definition
  const fields = [
    { 
      name: 'code', 
      label: 'Coupon Code', 
      type: 'text' as const, 
      placeholder: 'e.g. SUMMER25' 
    },
    { 
      name: 'discount', 
      label: 'Discount Amount', 
      type: 'number' as const, 
      placeholder: '25' 
    },
    { 
      name: 'type', 
      label: 'Discount Type', 
      type: 'select' as const, 
      placeholder: 'Select type',
      options: [
        { label: 'Percentage', value: 'percentage' },
        { label: 'Fixed', value: 'fixed' }
      ]
    },
    { 
      name: 'validUntil', 
      label: 'Valid Until', 
      type: 'date' as const 
    },
    { 
      name: 'usageLimit', 
      label: 'Usage Limit', 
      type: 'number' as const, 
      placeholder: '100' 
    },
    { 
      name: 'minPurchase', 
      label: 'Minimum Purchase', 
      type: 'number' as const, 
      placeholder: 'Optional' 
    },
    { 
      name: 'maxDiscount', 
      label: 'Maximum Discount', 
      type: 'number' as const, 
      placeholder: 'Optional' 
    },
    { 
      name: 'products', 
      label: 'Products (comma separated IDs)', 
      type: 'text' as const, 
      placeholder: 'e.g. 1,2,3 (leave empty for all)' 
    },
    { 
      name: 'categories', 
      label: 'Categories (comma separated IDs)', 
      type: 'text' as const, 
      placeholder: 'e.g. 1,2,3 (leave empty for all)' 
    },
    { 
      name: 'description', 
      label: 'Description', 
      type: 'textarea' as const, 
      placeholder: 'Additional information about the coupon' 
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!coupon) {
    return <div className="p-6">Coupon not found.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate('/coupons')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> 
        Back to Coupons
      </Button>
      
      <h1 className="text-2xl font-bold">Edit Coupon</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Coupon Information</CardTitle>
          <CardDescription>Edit the coupon details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <EntityForm
            schema={couponSchema}
            defaultValues={coupon}
            onSubmit={handleSubmit}
            fields={fields}
            submitLabel="Save Changes"
            isLoading={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponEdit;
