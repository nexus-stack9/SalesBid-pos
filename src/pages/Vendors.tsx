
import { useVendors } from '@/hooks/useVendors';
import VendorTable from '@/components/vendors/VendorTable';
import VendorActions from '@/components/vendors/VendorActions';

const Vendors = () => {
  const { vendors, deleteVendor } = useVendors();

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vendor Management</h2>
        <VendorActions vendors={vendors} />
      </div>
      
      <VendorTable 
        vendors={vendors} 
        onDelete={deleteVendor} 
      />
    </div>
  );
};

export default Vendors;
