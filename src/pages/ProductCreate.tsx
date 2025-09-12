
import { useState, useRef, KeyboardEvent } from 'react';
import { insertRecord, uploadMultipleFiles, uploadFile, updateRecord } from '@/services/crudService';
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
  starting_price: string | number;
  category: string;
  category_id?: number;
  auction_start: string;
  auction_end: string;
  product_status: "draft" | "active" | "sold" | "expired";
  retail_value: string;
  location: string;
  shipping: string;
  quantity: number;
  images: File[];
  video: File[]; // single video file
  seller_id?: number;
  vendor_id?: number;
  trending: boolean;
  tags: string[];
  created_by?: string;
  image_path?: string;
  video_path?: string;
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
    starting_price: '',
    category: '',
    auction_start: new Date().toISOString().slice(0, 16),
    auction_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    product_status: 'draft',
    retail_value: '',
    location: '',
    shipping: '',
    quantity: 1,
    images: [],
    video: [],
    trending: false,
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof Product, value: string | number | boolean | File[]) => {
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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFormData(prev => ({ ...prev, video: files }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  const addTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags?.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Step 1: Prepare product data (without images)
    const submissionData = {
      ...formData,
      starting_price: Number(formData.starting_price) || 0,
      product_name: formData.product_name || '',
      product_description: formData.product_description || '',
      category: formData.category || '',
      auction_start: formData.auction_start || new Date().toISOString(),
      auction_end:
        formData.auction_end ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      product_status: formData.product_status || 'draft',
      quantity: Number(formData.quantity) || 1,
      trending: formData.trending || false,
      tags: formData.tags || [],
      images: undefined, // ⚠️ don't send files here
    };

    const cleanData = Object.fromEntries(
      Object.entries(submissionData).filter(
        ([_, v]) => v !== undefined && v !== ''
      )
    );

    // Step 2: Create product (no images yet)
    const result = await insertRecord('productForm', cleanData);

    if (!result.success || !result.id) {
      toast.error(result.error || 'Failed to create product');
      return;
    }
          const filePathPrefix = "https://pub-a9806e1f673d447a94314a6d53e85114.r2.dev";

    const productId = result.id; // backend should return new ID
    const vendorId = formData.vendor_id || 1; // TODO: set from auth/user context
    const uploadPath = `${filePathPrefix}/${vendorId}/Products/${productId}`;

    // Step 3: Upload images if any
    let imagesPath: string[] = [];
        let videoPath: string[] = [];
    if (formData.images && formData.images.length > 0) {
      imagesPath = formData.images.map((file) => `${uploadPath}/${file.name}`);
      const uploadRes = await uploadMultipleFiles(formData.images, uploadPath);
      videoPath =  formData.video.map((file) => `${uploadPath}/${file.name}`);
      const uploadRes1 = await uploadMultipleFiles(formData.video, uploadPath);
      if (!uploadRes.success) {
        toast.error('Product created but image upload failed!');
      }
    }

    // Step 4: Upload video if provided
    // if (formData.video) {
    //   videoPath = `${uploadPath}/video-${Date.now()}-${formData.video.name}`;
    //   const uploadVideoRes = await uploadFile(formData.video, uploadPath);
    //   if (!uploadVideoRes.success) {
    //     toast.error('Product created but video upload failed!');
    //   }
    // }

    // Step 5: Update product with media paths
    toast.success('Product created successfully!');
    await updateRecord('productForm', {
      id: productId,
      image_path: imagesPath.join(','),
      video_path: videoPath.join(',')
    });
    navigate('/products');
  } catch (error) {
    console.error('Error creating product:', error);
    toast.error('An error occurred while creating the product');
  } finally {
    setIsLoading(false);
  }
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
                  value={formData.starting_price}
                  onChange={(e) => handleChange('starting_price', e.target.value)}
                  onFocus={(e) => e.target.select()}
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
                <Label htmlFor="retail_value">Retail Value</Label>
                <Input
                  id="retail_value"
                  value={formData.retail_value || ''}
                  onChange={(e) => handleChange('retail_value', e.target.value)}
                  placeholder="Enter retail value"
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

              <div className="space-y-2">
                <Label htmlFor="shipping">Shipping</Label>
                <Input
                  id="shipping"
                  value={formData.shipping || ''}
                  onChange={(e) => handleChange('shipping', e.target.value)}
                  placeholder="Enter shipping details"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trending">Trending</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="trending"
                    checked={formData.trending || false}
                    onChange={(e) => handleChange('trending', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="trending" className="text-sm font-medium text-gray-700">
                    Mark as trending
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                  {formData.tags?.map((tag) => (
                    <span 
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-200 text-blue-800 hover:bg-blue-300 focus:outline-none"
                      >
                        <span className="sr-only">Remove tag</span>
                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                          <path fillRule="evenodd" d="M4 3.293l2.146-2.147a.5.5 0 01.708.708L4.707 4l2.147 2.146a.5.5 0 01-.708.708L4 4.707l-2.146 2.147a.5.5 0 01-.708-.708L3.293 4 1.146 1.854a.5.5 0 01.708-.708L4 3.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="Type and press Enter to add tags"
                    className="flex-1 min-w-[200px] border-0 focus:ring-0 focus:outline-none text-sm"
                  />
                </div>
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

              <div className="space-y-2 md:col-span-2">
                <Label>Product Video</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <Input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="mb-2"
                  />
                  {/* {formData.video && (
                    <video
                      src={URL.createObjectURL(formData.video[0])}
                      controls
                      className="w-full max-h-64 rounded-md"
                    />
                  )} */}
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
