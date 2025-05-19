
import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EntityForm from '@/components/shared/EntityForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Schema for customer data validation
const customerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(5, { message: "Phone number is required." }),
  address: z.string().min(5, { message: "Address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().min(2, { message: "State is required." }),
  postalCode: z.string().min(3, { message: "Postal code is required." }),
  country: z.string().min(2, { message: "Country is required." }),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

// Mock API calls - in a real app, these would call your backend API
const fetchCustomer = async (id: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Sample data - in a real app, this would be fetched from the server
  return {
    id,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States',
    notes: 'VIP Customer',
    status: 'active',
    orders: 5,
    dateJoined: '2023-01-15',
  };
};

const updateCustomer = async (data: CustomerFormData & { id: string }) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Updating customer:', data);
  return data;
};

const CustomerEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => fetchCustomer(id || ''),
    enabled: !!id,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateCustomer,
    onSuccess: () => {
      toast.success('Customer updated successfully');
      navigate('/customers');
    },
    onError: () => {
      toast.error('Failed to update customer');
    },
  });

  const handleSubmit = (data: CustomerFormData) => {
    mutate({ ...data, id: id || '' });
  };

  // Form fields definition
  const fields = [
    { 
      name: 'name', 
      label: 'Full Name', 
      type: 'text' as const, 
      placeholder: 'John Doe' 
    },
    { 
      name: 'email', 
      label: 'Email Address', 
      type: 'email' as const, 
      placeholder: 'john@example.com' 
    },
    { 
      name: 'phone', 
      label: 'Phone Number', 
      type: 'text' as const, 
      placeholder: '555-1234' 
    },
    { 
      name: 'address', 
      label: 'Address', 
      type: 'text' as const, 
      placeholder: '123 Main St' 
    },
    { 
      name: 'city', 
      label: 'City', 
      type: 'text' as const, 
      placeholder: 'New York' 
    },
    { 
      name: 'state', 
      label: 'State/Province', 
      type: 'text' as const, 
      placeholder: 'NY' 
    },
    { 
      name: 'postalCode', 
      label: 'Postal Code', 
      type: 'text' as const, 
      placeholder: '10001' 
    },
    { 
      name: 'country', 
      label: 'Country', 
      type: 'text' as const, 
      placeholder: 'United States' 
    },
    { 
      name: 'notes', 
      label: 'Notes', 
      type: 'textarea' as const, 
      placeholder: 'Additional information about the customer' 
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
                {Array(4).fill(0).map((_, i) => (
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

  if (!customer) {
    return <div className="p-6">Customer not found.</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate('/customers')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> 
        Back to Customers
      </Button>
      
      <h1 className="text-2xl font-bold">Edit Customer</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Edit the customer details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <EntityForm
            schema={customerSchema}
            defaultValues={customer}
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

export default CustomerEdit;
