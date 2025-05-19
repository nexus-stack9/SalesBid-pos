
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [formData, setFormData] = useState<Partial<Vendor>>({
    name: '',
    email: '',
    contact: '',
    category: '',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof Vendor, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Vendor created successfully");
      navigate('/vendors');
      setIsLoading(false);
    }, 500);
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
          <CardTitle>Add New Vendor</CardTitle>
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
                <Label htmlFor="contact">Contact</Label>
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

              <div className="space-y-2">
                <Label htmlFor="joinDate">Join Date</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate || ''}
                  onChange={(e) => handleChange('joinDate', e.target.value)}
                  required
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
              disabled={isLoading || !formData.name || !formData.email}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Creating...' : 'Create Vendor'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default VendorCreate;
