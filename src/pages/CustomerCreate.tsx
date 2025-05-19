
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import EntityForm from '@/components/shared/EntityForm';

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

// Mock API call - in a real app, this would call your backend API
const createCustomer = async (customerData: CustomerFormData) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Creating customer:', customerData);
  return { id: Math.random().toString(36).substr(2, 9), ...customerData };
};

const CustomerCreate = () => {
  const navigate = useNavigate();
  
  const { mutate, isPending } = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      toast.success('Customer created successfully');
      navigate('/customers');
    },
    onError: () => {
      toast.error('Failed to create customer');
    },
  });

  const handleSubmit = (data: CustomerFormData) => {
    mutate(data);
  };

  // Default values for the form
  const defaultValues: CustomerFormData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    notes: '',
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

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Add New Customer</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Enter the details for the new customer.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EntityForm
              schema={customerSchema}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              fields={fields.slice(0, 4)}
              submitLabel="Create Customer"
              isLoading={isPending}
            />
            <EntityForm
              schema={customerSchema}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              fields={fields.slice(4, 9)}
              submitLabel="Create Customer"
              isLoading={isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerCreate;
