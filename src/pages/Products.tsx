
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Define type for Product
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: "active" | "inactive";
  description: string;
}

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

const Products = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const navigate = useNavigate();

  const columns = [
    {
      id: 'name',
      header: 'Name',
      cell: (row: Product) => <div className="font-medium">{row.name}</div>,
      filterType: 'text' as const
    },
    {
      id: 'price',
      header: 'Price',
      cell: (row: Product) => <div>${row.price.toFixed(2)}</div>,
      filterType: 'number' as const
    },
    {
      id: 'category',
      header: 'Category',
      cell: (row: Product) => row.category,
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Smartphones', value: 'Smartphones' },
        { label: 'Laptops', value: 'Laptops' },
        { label: 'Accessories', value: 'Accessories' },
        { label: 'Tablets', value: 'Tablets' },
        { label: 'Wearables', value: 'Wearables' },
      ]
    },
    {
      id: 'stock',
      header: 'In Stock',
      cell: (row: Product) => row.stock,
      filterType: 'number' as const
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: Product) => (
        <Badge variant={row.status === "active" ? "success" : "secondary"}>
          {row.status}
        </Badge>
      ),
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ]
    },
    {
      id: 'description',
      header: 'Description',
      cell: (row: Product) => <div className="max-w-[300px] truncate">{row.description}</div>,
      filterType: 'text' as const
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row: Product) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/products/${row.id}`)}
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeleteProduct(row.id)}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      )
    }
  ];

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Price', 'Category', 'Stock', 'Status', 'Description'];
    const csvContent = [
      headers.join(','),
      ...products.map(product => [
        product.id,
        `"${product.name}"`,
        product.price,
        `"${product.category}"`,
        product.stock,
        product.status,
        `"${product.description.replace(/"/g, '""')}"`
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
        data={products}
        columns={columns}
        searchKey="name"
      />
    </div>
  );
};

export default Products;
