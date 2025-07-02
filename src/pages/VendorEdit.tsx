
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { getRecordById, updateRecord } from '@/services/crudService';



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

const VendorEdit = () => {
  const { id: urlId } = useParams<{ id: string }>();
  console.log('URL Params ID:', urlId);
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<Partial<Vendor>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  
  // Ensure we have a valid ID
  const vendorId = urlId ? parseInt(urlId, 10) : null;

  useEffect(() => {
    const fetchVendor = async () => {
      if (!vendorId || isNaN(vendorId)) {
        console.error('Invalid vendor ID:', urlId);
        toast.error("Invalid vendor ID");
        navigate('/vendors');
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching vendor with ID:', vendorId);
        const response = await getRecordById('vendorForm', vendorId);
        console.log('API Response:', response);
        
        if (response.success && response.data) {
          const vendorData = response.data;
          console.log('Vendor Data:', vendorData);
          
          // Map the API response fields to the form fields
          const mappedVendor: Vendor = {
            id: vendorData['Vendor ID'] || vendorId,
            name: vendorData['Vendor Name'] || '',
            email: vendorData['Vendor Email'] || '',
            contact: vendorData['Vendor Phone'] || '',
            address: vendorData['Vendor Address'] || '',
            category: vendorData['Category'] || '',
            status: vendorData['Status'] === 1 ? 'active' : 'inactive' as const
          };
          
          console.log('Mapped Vendor:', mappedVendor);
          
          setVendor(mappedVendor);
          setFormData(mappedVendor);
        } else {
          throw new Error(response.message || 'Failed to load vendor data');
        }
      } catch (error) {
        console.error('Error fetching vendor:', error);
        toast.error('Failed to load vendor data');
        navigate('/vendors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendor();
  }, [vendorId, urlId, navigate]);

  const handleChange = (field: keyof Vendor, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendorId) {
      console.error('No valid vendor ID found');
      toast.error("Vendor ID is missing");
      return;
    }

    console.log('Submitting form with vendor ID:', vendorId);
    setIsLoading(true);

    try {
      const payload = {
        id: vendorId,
        name: formData.name || '',
        email: formData.email || '',
        contact: formData.contact || '',
        address: formData.address || '',
        status: formData.status === 'active' ? 1 : 0,
        category: formData.category || ''
      };
      
      console.log('Final payload before update:', payload);

      console.log('Sending update payload:', payload);
      const response = await updateRecord('vendorForm', payload);

      if (response.success) {
        toast.success("Vendor updated successfully");
        setIsDirty(false);
        navigate('/vendors');
      } else {
        throw new Error(response.message || 'Failed to update vendor');
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update vendor');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !vendor) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <p>Loading vendor details...</p>
        </div>
      </div>
    );
  }

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
          <CardTitle>Edit Vendor</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Vendor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="vendor@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={formData.contact || ''}
                  onChange={(e) => handleChange('contact', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
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
            </div>
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
              disabled={!isDirty || isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default VendorEdit;
