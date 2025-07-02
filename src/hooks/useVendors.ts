
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Vendor } from '@/types/vendor';
import { getAllProducts, deleteRecord } from '@/services/crudService';

// Type for the vendor data from the API
interface ApiVendor {
  'Vendor ID': number;
  'Vendor Name': string;
  'Vendor Email': string;
  'Vendor Phone': string;
  'Vendor Address': string;
  'Status': number;
  'Category': string;
}

// Map API response to Vendor type
const mapApiToVendor = (apiData: ApiVendor): Vendor => ({
  id: apiData['Vendor ID'],
  name: apiData['Vendor Name'] || `Vendor ${apiData['Vendor ID']}`,
  email: apiData['Vendor Email'],
  contact: apiData['Vendor Phone'],
  category: apiData.Category || 'Uncategorized',
  status: apiData.Status === 1 ? 'active' : 'inactive',
  address: apiData['Vendor Address']
});

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setIsLoading(true);
        const response = await getAllProducts('vendorForm');
        
        if (response.success && response.data) {
          const mappedVendors = response.data.map(mapApiToVendor);
          setVendors(mappedVendors);
        } else {
          throw new Error(response.message || 'Failed to fetch vendors');
        }
      } catch (err) {
        console.error('Error fetching vendors:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        toast.error('Failed to load vendors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const deleteVendor = async (id: number) => {
    try {
      const response = await deleteRecord('vendorForm', id);
      
      if (response.success) {
        setVendors(vendors.filter(vendor => vendor.id !== id));
        toast.success('Vendor deleted successfully');
      } else {
        throw new Error(response.message || 'Failed to delete vendor');
      }
      return response.success;
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete vendor');
      throw error;
    }
  };

  return {
    vendors,
    deleteVendor,
    isLoading,
    error
  };
}
