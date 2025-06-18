
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Download, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { fetchProducts, type Product } from '@/services/crudService';
import { format } from 'date-fns';
import LiveStreamModal from '@/components/shared/LiveStreamModal';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // State for live stream modal
  const [liveStreamModalOpen, setLiveStreamModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const { data } = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products. Please try again later.');
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleLiveStream = (product: Product) => {
    setSelectedProduct(product);
    setLiveStreamModalOpen(true);
  };

  const columns = [
    {
      id: 'Product ID',
      header: 'ID',
      cell: (row: Product) => <div className="font-medium">{row['Product ID']}</div>,
      filterType: 'text' as const
    },
    {
      id: 'Product Name',
      header: 'Name',
      cell: (row: Product) => <div className="font-medium">{row['Product Name']}</div>,
      filterType: 'text' as const
    },
    {
      id: 'Starting Price',
      header: 'Price',
      cell: (row: Product) => <div>${parseFloat(row['Starting Price']).toFixed(2)}</div>,
      filterType: 'number' as const
    },
    {
      id: 'Category ID',
      header: 'Category',
      cell: (row: Product) => `Category ${row['Category ID']}`,
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Category 1', value: '1' },
        { label: 'Category 2', value: '2' },
      ]
    },
    {
      id: 'Quantity',
      header: 'Stock',
      cell: (row: Product) => row.Quantity,
      filterType: 'number' as const
    },
    {
      id: 'Product Status',
      header: 'Status',
      cell: (row: Product) => (
        <Badge variant={row['Product Status'] === 'active' ? 'default' : 'secondary'}>
          {row['Product Status']}
        </Badge>
      ),
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ]
    },
    {
      id: 'Location',
      header: 'Location',
      cell: (row: Product) => row.Location,
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Hyderabad', value: 'Hyderabad' },
        { label: 'Other', value: 'Other' },
      ]
    },
    {
      id: 'Auction Start',
      header: 'Auction Start',
      cell: (row: Product) => format(new Date(row['Auction Start']), 'PPpp'),
      filterType: 'date' as const
    },
    {
      id: 'Auction End',
      header: 'Auction End',
      cell: (row: Product) => format(new Date(row['Auction End']), 'PPpp'),
      filterType: 'date' as const
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row: Product) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row['Product ID'])}
            aria-label="Edit product"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row['Product ID'])}
            aria-label="Delete product"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleLiveStream(row)}
            aria-label="Live stream product"
          >
            <Video className="h-4 w-4 text-blue-500" />
          </Button>
        </div>
      ),
      filterType: undefined
    }
  ];

  const handleEdit = (id: number) => {
    // Navigate to edit page with product ID
    navigate(`/products/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this product?')) {
      // Filter out the product to delete
      const updatedProducts = products.filter(product => product['Product ID'] !== id);
      setProducts(updatedProducts);
      toast.success('Product deleted successfully');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Price', 'Category', 'Stock', 'Status', 'Location'];
    const csvContent = [
      headers.join(','),
      ...products.map(product => [
        product['Product ID'],
        `"${product['Product Name']}"`,
        product['Starting Price'],
        product['Category ID'],
        product.Quantity,
        product['Product Status'],
        `"${product.Location}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Products list exported successfully!');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Product Catalog</h2>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={exportToCSV}
            className="hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button 
            onClick={() => navigate('/products/create')}
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-purple-600 hover:to-blue-600 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>
      
      <DataTable
        data={products.map(p => ({
          ...p,
          id: p['Product ID'], // Ensure there's an id field for the DataTable
          name: p['Product Name'] // Add name field for search
        }))}
        columns={columns}
        searchKey="name"
      />

      {/* Live Stream Modal */}
      {selectedProduct && (
        <LiveStreamModal
          isOpen={liveStreamModalOpen}
          onClose={() => setLiveStreamModalOpen(false)}
          productId={selectedProduct['Product ID']}
          productName={selectedProduct['Product Name']}
        />
      )}
    </div>
  );
};

export default Products;
