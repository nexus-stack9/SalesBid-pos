
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface Product {
  id?: number;
  product_name: string;
  product_description: string;
  starting_price: number;
  category: string;
  auction_start: string;
  auction_end: string;
  product_status: "draft" | "active" | "sold" | "expired";
  retail_value: number;
  location: string;
  shipping: string;
  quantity: number;
  images: File[];
}

const categories = [
  "Electronics", 
  "Fashion", 
  "Home & Garden", 
  "Collectibles", 
  "Vehicles",
  "Sports",
  "Toys",
  "Business & Industrial"
];

const ProductCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Product>>({
    product_name: '',
    product_description: '',
    starting_price: 0,
    category: '',
    auction_start: new Date().toISOString().slice(0, 16),
    auction_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    product_status: 'draft',
    retail_value: 0,
    location: '',
    shipping: '',
    quantity: 1,
    images: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof Product, value: string | number | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...files]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Product created successfully");
      navigate('/products');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="container mx-auto py-10">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate('/products')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> 
        Back to Products
      </Button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name</Label>
                <Input
                  id="product_name"
                  value={formData.product_name || ''}
                  onChange={(e) => handleChange('product_name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="starting_price">Starting Price ($)</Label>
                <Input
                  id="starting_price"
                  type="number"
                  value={formData.starting_price || 0}
                  onChange={(e) => handleChange('starting_price', Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
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
                    <SelectValue placeholder="Select a category" />
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
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || 1}
                  onChange={(e) => handleChange('quantity', Number(e.target.value))}
                  placeholder="1"
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_status">Product Status</Label>
                <Select
                  value={formData.product_status}
                  onValueChange={(value) => handleChange('product_status', value as "draft" | "active" | "sold" | "expired")}
                  required
                >
                  <SelectTrigger id="product_status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping">Shipping</Label>
                <Input
                  id="shipping"
                  value={formData.shipping || ''}
                  onChange={(e) => handleChange('shipping', e.target.value)}
                  placeholder="Enter shipping details"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="product_description">Product Description</Label>
                <Textarea
                  id="product_description"
                  value={formData.product_description || ''}
                  onChange={(e) => handleChange('product_description', e.target.value)}
                  placeholder="Enter detailed product description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auction_start">Auction Start</Label>
                <Input
                  id="auction_start"
                  type="datetime-local"
                  value={formData.auction_start}
                  onChange={(e) => handleChange('auction_start', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auction_end">Auction End</Label>
                <Input
                  id="auction_end"
                  type="datetime-local"
                  value={formData.auction_end}
                  onChange={(e) => handleChange('auction_end', e.target.value)}
                  min={formData.auction_start}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retail_value">Retail Value ($)</Label>
                <Input
                  id="retail_value"
                  type="number"
                  value={formData.retail_value || 0}
                  onChange={(e) => handleChange('retail_value', Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Enter location"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Images</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mb-4"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.images?.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => navigate('/products')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.product_name || !formData.category}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Creating...' : 'Create Product'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProductCreate;
