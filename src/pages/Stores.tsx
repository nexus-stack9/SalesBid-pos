
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Define type for Store
interface Store {
  id: number;
  name: string;
  address: string;
  manager: string;
  employees: number;
  type: "flagship" | "mall" | "outlet" | "standard";
  status: "active" | "inactive";
}

const mockStores: Store[] = [
  {
    id: 1,
    name: "Downtown Main",
    address: "123 Main St, New York, NY",
    manager: "John Smith",
    employees: 45,
    type: "flagship",
    status: "active"
  },
  {
    id: 2,
    name: "Westfield Mall",
    address: "456 Market Ave, San Francisco, CA",
    manager: "Jane Doe",
    employees: 32,
    type: "mall",
    status: "active"
  },
  {
    id: 3,
    name: "Fashion Outlet",
    address: "789 Designer Blvd, Los Angeles, CA",
    manager: "Mike Johnson",
    employees: 28,
    type: "outlet",
    status: "active"
  },
  {
    id: 4,
    name: "Suburban Store",
    address: "101 Shopping Center, Chicago, IL",
    manager: "Sarah Wilson",
    employees: 22,
    type: "standard",
    status: "inactive"
  },
  {
    id: 5,
    name: "City Center",
    address: "555 Urban Plaza, Miami, FL",
    manager: "David Brown",
    employees: 30,
    type: "standard",
    status: "active"
  }
];

const Stores = () => {
  const [stores, setStores] = useState<Store[]>(mockStores);
  const navigate = useNavigate();

  const columns = [
    {
      id: 'name',
      header: 'Name',
      cell: (row: Store) => <div className="font-medium">{row.name}</div>,
      filterType: 'text' as const
    },
    {
      id: 'address',
      header: 'Address',
      cell: (row: Store) => <div className="max-w-[250px] truncate">{row.address}</div>,
      filterType: 'text' as const
    },
    {
      id: 'manager',
      header: 'Manager',
      cell: (row: Store) => row.manager,
      filterType: 'text' as const
    },
    {
      id: 'employees',
      header: 'Employees',
      cell: (row: Store) => row.employees,
      filterType: 'number' as const
    },
    {
      id: 'type',
      header: 'Type',
      cell: (row: Store) => (
        <Badge variant="outline" className="capitalize">
          {row.type}
        </Badge>
      ),
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Flagship', value: 'flagship' },
        { label: 'Mall', value: 'mall' },
        { label: 'Outlet', value: 'outlet' },
        { label: 'Standard', value: 'standard' },
      ]
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: Store) => (
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
      id: 'actions',
      header: 'Actions',
      cell: (row: Store) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/stores/${row.id}`)}
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeleteStore(row.id)}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      )
    }
  ];

  const handleDeleteStore = (id: number) => {
    setStores(stores.filter(store => store.id !== id));
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Address', 'Manager', 'Employees', 'Type', 'Status'];
    const csvContent = [
      headers.join(','),
      ...stores.map(store => [
        store.id,
        `"${store.name}"`,
        `"${store.address}"`,
        `"${store.manager}"`,
        store.employees,
        store.type,
        store.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'stores.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Stores list exported successfully!');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Store Locations</h2>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={exportToCSV}
            className="hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button 
            onClick={() => navigate('/stores/create')}
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-purple-600 hover:to-blue-600 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Store
          </Button>
        </div>
      </div>
      
      <DataTable
        data={stores}
        columns={columns}
        searchKey="name"
      />
    </div>
  );
};

export default Stores;
