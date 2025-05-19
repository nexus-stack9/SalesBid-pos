
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import EntityForm from '@/components/shared/EntityForm';

// Schema for store data validation
const storeSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  address: z.string().min(5, { message: "Address is required." }),
  manager: z.string().min(2, { message: "Manager name is required." }),
  employees: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Number of employees must be a non-negative number."
  }),
  type: z.string().min(1, { message: "Store type is required." }),
  status: z.string().min(1, { message: "Status is required." }),
});

type StoreFormData = z.infer<typeof storeSchema>;

const StoreCreate = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: StoreFormData) => {
    // Simulate API call
    setTimeout(() => {
      toast.success("Store created successfully");
      navigate('/stores');
    }, 500);
    console.log('Creating store:', data);
  };

  // Default values for the form
  const defaultValues: StoreFormData = {
    name: '',
    address: '',
    manager: '',
    employees: '0',
    type: 'standard',
    status: 'active'
  };

  // Form fields definition
  const fields = [
    { 
      name: 'name', 
      label: 'Store Name', 
      type: 'text' as const, 
      placeholder: 'Store name' 
    },
    { 
      name: 'address', 
      label: 'Address', 
      type: 'text' as const, 
      placeholder: 'Store address' 
    },
    { 
      name: 'manager', 
      label: 'Manager', 
      type: 'text' as const, 
      placeholder: 'Store manager' 
    },
    { 
      name: 'employees', 
      label: 'Number of Employees', 
      type: 'number' as const, 
      placeholder: '0' 
    },
    { 
      name: 'type', 
      label: 'Store Type', 
      type: 'select' as const, 
      placeholder: 'Select type',
      options: [
        { label: 'Flagship', value: 'flagship' },
        { label: 'Mall', value: 'mall' },
        { label: 'Outlet', value: 'outlet' },
        { label: 'Standard', value: 'standard' }
      ]
    },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select' as const,
      placeholder: 'Select status', 
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ]
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate('/stores')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> 
        Back to Stores
      </Button>

      <h1 className="text-2xl font-bold">Add New Store</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Enter the details for the new store.</CardDescription>
        </CardHeader>
        <CardContent>
          <EntityForm
            schema={storeSchema}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            fields={fields}
            submitLabel="Create Store"
            layout="two-columns"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreCreate;
