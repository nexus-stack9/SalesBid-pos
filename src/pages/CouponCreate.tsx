
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EntityForm from '@/components/shared/EntityForm';

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

// Mock API call - in a real app, this would call your backend API
const createCoupon = async (couponData: CouponFormData) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Creating coupon:', couponData);
  return { id: Math.random().toString(36).substr(2, 9), ...couponData, status: 'active', usageCount: 0 };
};

const CouponCreate = () => {
  const navigate = useNavigate();
  
  const { mutate, isPending } = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      toast.success('Coupon created successfully');
      navigate('/coupons');
    },
    onError: () => {
      toast.error('Failed to create coupon');
    },
  });

  const handleSubmit = (data: CouponFormData) => {
    mutate(data);
  };

  // Default values for the form
  const defaultValues: CouponFormData = {
    code: '',
    discount: '',
    type: 'percentage',
    validUntil: '',
    usageLimit: '100',
    description: '',
    minPurchase: '',
    maxDiscount: '',
    products: '',
    categories: '',
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

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Add New Coupon</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Coupon Information</CardTitle>
          <CardDescription>Enter the details for the new coupon.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EntityForm
              schema={couponSchema}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              fields={fields.slice(0, 5)}
              submitLabel="Create Coupon"
              isLoading={isPending}
            />
            <EntityForm
              schema={couponSchema}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              fields={fields.slice(5, 10)}
              submitLabel="Create Coupon"
              isLoading={isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CouponCreate;
