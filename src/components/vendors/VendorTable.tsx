
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Vendor } from '@/types/vendor';

interface VendorTableProps {
  vendors: Vendor[];
  onDelete: (id: number) => void;
}

const VendorTable = ({ vendors, onDelete }: VendorTableProps) => {
  const columns = [
    {
      id: 'name',
      header: 'Name',
      cell: (row: Vendor) => <div className="font-medium">{row.name}</div>,
      filterType: 'text' as const
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row: Vendor) => <div className="text-muted-foreground">{row.email}</div>,
      filterType: 'text' as const
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: (row: Vendor) => row.contact,
      filterType: 'text' as const
    },
    {
      id: 'category',
      header: 'Category',
      cell: (row: Vendor) => row.category,
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Office Supplies', value: 'Office Supplies' },
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Shipping', value: 'Shipping' },
        { label: 'Eco-friendly Products', value: 'Eco-friendly Products' },
        { label: 'Food & Beverage', value: 'Food & Beverage' },
      ]
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: Vendor) => (
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
      id: 'joinDate',
      header: 'Join Date',
      cell: (row: Vendor) => new Date(row.joinDate).toLocaleDateString(),
      filterType: 'text' as const
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row: Vendor) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/vendors/${row.id}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      data={vendors}
      columns={columns}
      searchKey="name"
    />
  );
};

export default VendorTable;
