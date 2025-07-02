
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Vendor } from '@/types/vendor';
import { getRecordById, insertRecord, updateRecord } from '@/services/crudService';

const categories = [
  "Office Supplies",
  "Electronics",
  "Shipping",
  "Eco-friendly Products",
  "Food & Beverage",
  "Furniture",
  "Marketing Services",
  "IT Services"
];

const VendorCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState<Partial<Vendor>>({
    name: '',
    email: '',
    contact: '',
    category: '',
    status: 'active',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);

  // Fetch vendor data in edit mode
  useEffect(() => {
    const fetchVendor = async () => {
      console.log('fetchVendor called, isEditMode:', isEditMode, 'id:', id);
      if (!isEditMode) {
        console.log('Not in edit mode, skipping fetch');
        setIsFetching(false);
        return;
      }
      
      try {
        const response = await getRecordById('vendorForm', id);
        if (response.success && response.data) {
          const vendorData = response.data;
          setFormData({
            id: vendorData['Vendor ID'],
            name: vendorData['Vendor Name'],
            email: vendorData['Vendor Email'],
            contact: vendorData['Vendor Phone'],
            address: vendorData['Vendor Address'],
            category: vendorData['Category'],
            status: vendorData['Status'] === 1 ? 'active' : 'inactive',
          });
        } else {
          throw new Error(response.message || 'Failed to load vendor data');
        }
      } catch (error) {
        console.error('Error fetching vendor:', error);
        toast.error('Failed to load vendor data');
        navigate('/vendors');
      } finally {
        setIsFetching(false);
      }
    };

    fetchVendor();
  }, [id, isEditMode, navigate]);

  const handleChange = (field: keyof Vendor, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const vendorData = {
        'Vendor Name': formData.name,
        'Vendor Email': formData.email,
        'Vendor Phone': formData.contact,
        'Vendor Address': formData.address,
        'Category': formData.category,
        'Status': formData.status === 'active' ? 1 : 0,
      };

      let response;
      if (isEditMode && formData.id) {
        // For edit, use updateRecord with ID in the root
        response = await updateRecord('vendorForm', {
          ...vendorData,
          id: formData.id  // Make sure ID is in the root for updateRecord
        });
      } else {
        // For create, use insertRecord with created_at
        response = await insertRecord('vendorForm', {
          ...vendorData,
          created_at: new Date().toISOString(),
        });
      }

      if (response.success) {
        toast.success(`Vendor ${isEditMode ? 'updated' : 'created'} successfully`);
        navigate('/vendors');
      } else {
        throw new Error(response.message || `Failed to ${isEditMode ? 'update' : 'create'} vendor`);
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create vendor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate('/vendors')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> 
        Back to Vendors
      </Button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditMode ? 'Update Vendor' : 'Create New Vendor'}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            {isFetching ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Vendor name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Phone number</Label>
                <Input
                  id="contact"
                  value={formData.contact || ''}
                  onChange={(e) => handleChange('contact', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value as "active" | "inactive")}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <textarea
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Enter vendor's full address"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                  required
                />
              </div>
            </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => navigate('/vendors')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.name || !formData.email}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Vendor' : 'Create Vendor')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default VendorCreate;
