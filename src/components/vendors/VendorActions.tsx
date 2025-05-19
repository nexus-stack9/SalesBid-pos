
import { Button } from '@/components/ui/button';
import { PlusCircle, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Vendor } from '@/types/vendor';

interface VendorActionsProps {
  vendors: Vendor[];
}

const VendorActions = ({ vendors }: VendorActionsProps) => {
  const navigate = useNavigate();

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Contact', 'Category', 'Status', 'Join Date'];
    const csvContent = [
      headers.join(','),
      ...vendors.map(vendor => [
        vendor.id,
        `"${vendor.name}"`,
        `"${vendor.email}"`,
        `"${vendor.contact}"`,
        `"${vendor.category}"`,
        vendor.status,
        vendor.joinDate
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'vendors.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Vendors list exported successfully!');
  };

  return (
    <div className="flex gap-3">
      <Button 
        variant="outline"
        onClick={exportToCSV}
        className="hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
      >
        <Download className="mr-2 h-4 w-4" /> Export
      </Button>
      <Button 
        onClick={() => navigate('/vendors/create')}
        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-purple-600 hover:to-blue-600 shadow-md hover:shadow-lg transition-all duration-200"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Vendor
      </Button>
    </div>
  );
};

export default VendorActions;
