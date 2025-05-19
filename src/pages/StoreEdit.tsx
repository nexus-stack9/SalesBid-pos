
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import EntityForm from '@/components/shared/EntityForm';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

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

// Mock API calls - in a real app, these would call your backend API
const fetchStore = async (id: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Sample data - in a real app, this would be fetched from the server
  return {
    id,
    name: "Downtown Main",
    address: "123 Main St, New York, NY",
    manager: "John Smith",
    employees: "45",
    type: "flagship",
    status: "active"
  };
};

const updateStore = async (data: StoreFormData & { id: string }) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Updating store:', data);
  return data;
};

const StoreEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: store, isLoading } = useQuery({
    queryKey: ['store', id],
    queryFn: () => fetchStore(id || ''),
    enabled: !!id,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateStore,
    onSuccess: () => {
      toast.success('Store updated successfully');
      navigate('/stores');
    },
    onError: () => {
      toast.error('Failed to update store');
    },
  });

  const handleSubmit = (data: StoreFormData) => {
    mutate({ ...data, id: id || '' });
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
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
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

  if (!store) {
    return <div className="p-6">Store not found.</div>;
  }

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

      <h1 className="text-2xl font-bold">Edit Store</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Edit the store details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <EntityForm
            schema={storeSchema}
            defaultValues={store}
            onSubmit={handleSubmit}
            fields={fields}
            submitLabel="Save Changes"
            isLoading={isPending}
            layout="two-columns"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreEdit;
