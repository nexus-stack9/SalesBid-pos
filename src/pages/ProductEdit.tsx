
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: "active" | "inactive";
  description: string;
}

// Mock data - in a real application, this would be fetched from an API
const mockProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    price: 999,
    category: "Smartphones",
    stock: 120,
    status: "active",
    description: "Latest iPhone model with advanced features"
  },
  {
    id: 2,
    name: "MacBook Pro M3",
    price: 1999,
    category: "Laptops",
    stock: 45,
    status: "active",
    description: "Powerful laptop with M3 chip"
  },
  {
    id: 3,
    name: "AirPods Pro",
    price: 249,
    category: "Accessories",
    stock: 200,
    status: "active",
    description: "Wireless earbuds with noise cancellation"
  },
  {
    id: 4,
    name: "iPad Pro",
    price: 799,
    category: "Tablets",
    stock: 75,
    status: "active",
    description: "High-performance tablet for professionals"
  },
  {
    id: 5,
    name: "Apple Watch Series 9",
    price: 399,
    category: "Wearables",
    stock: 90,
    status: "active",
    description: "Latest smartwatch with health features"
  }
];

const categories = [
  "Smartphones", 
  "Laptops", 
  "Accessories", 
  "Tablets", 
  "Wearables"
];

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Simulating API fetch - in a real app, this would be an API call
    const fetchProduct = () => {
      setIsLoading(true);
      try {
        const foundProduct = mockProducts.find(p => p.id === Number(id));
        if (foundProduct) {
          setProduct(foundProduct);
          setFormData({ ...foundProduct });
        } else {
          toast.error("Product not found");
          navigate('/products');
        }
      } catch (error) {
        toast.error("Failed to load product");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleChange = (field: keyof Product, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulating API update - in a real app, this would be an API call
    try {
      // In a real app, you'd make an API request to update the product
      toast.success("Product updated successfully");
      setIsDirty(false);
      navigate('/products');
    } catch (error) {
      toast.error("Failed to update product");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !product) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

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

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || 0}
                onChange={(e) => handleChange('price', Number(e.target.value))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
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
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock || 0}
                onChange={(e) => handleChange('stock', Number(e.target.value))}
                placeholder="0"
                min="0"
              />
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Product description"
                rows={3}
              />
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

export default ProductEdit;
