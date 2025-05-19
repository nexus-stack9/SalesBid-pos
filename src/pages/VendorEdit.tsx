
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

// Mock data - in a real application, this would be fetched from an API
const mockVendors: Vendor[] = [
  {
    id: 1,
    name: "Acme Supplies",
    email: "info@acmesupplies.com",
    contact: "+1 (555) 123-4567",
    category: "Office Supplies",
    status: "active",
    joinDate: "2021-03-12"
  },
  {
    id: 2,
    name: "Tech Innovations",
    email: "contact@techinnovations.com",
    contact: "+1 (555) 987-6543",
    category: "Electronics",
    status: "active",
    joinDate: "2022-01-05"
  },
  {
    id: 3,
    name: "Global Logistics",
    email: "support@globallogistics.com",
    contact: "+1 (555) 456-7890",
    category: "Shipping",
    status: "inactive",
    joinDate: "2020-11-18"
  },
  {
    id: 4,
    name: "Green Solutions",
    email: "info@greensolutions.com",
    contact: "+1 (555) 234-5678",
    category: "Eco-friendly Products",
    status: "active",
    joinDate: "2022-06-23"
  },
  {
    id: 5,
    name: "Premium Foods",
    email: "orders@premiumfoods.com",
    contact: "+1 (555) 789-0123",
    category: "Food & Beverage",
    status: "active",
    joinDate: "2021-09-30"
  }
];

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
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<Partial<Vendor>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Simulating API fetch - in a real app, this would be an API call
    const fetchVendor = () => {
      setIsLoading(true);
      try {
        const foundVendor = mockVendors.find(v => v.id === Number(id));
        if (foundVendor) {
          setVendor(foundVendor);
          setFormData({ ...foundVendor });
        } else {
          toast.error("Vendor not found");
          navigate('/vendors');
        }
      } catch (error) {
        toast.error("Failed to load vendor");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendor();
  }, [id, navigate]);

  const handleChange = (field: keyof Vendor, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulating API update - in a real app, this would be an API call
    try {
      // In a real app, you'd make an API request to update the vendor
      toast.success("Vendor updated successfully");
      setIsDirty(false);
      navigate('/vendors');
    } catch (error) {
      toast.error("Failed to update vendor");
      console.error(error);
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

              <div className="space-y-2">
                <Label htmlFor="joinDate">Join Date</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate || ''}
                  onChange={(e) => handleChange('joinDate', e.target.value)}
                />
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
