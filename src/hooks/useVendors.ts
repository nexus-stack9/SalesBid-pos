
import { useState } from 'react';
import { toast } from 'sonner';
import { Vendor } from '@/types/vendor';

// Mock data for vendors
const mockVendors: Vendor[] = [
  {
    id: 1,
    name: "Acme Supplies",
    email: "info@acmesupplies.com",
    contact: "+1 (555) 123-4567",
    category: "Office Supplies",
    status: "active",
    joinDate: "2021-03-12"
  },
  {
    id: 2,
    name: "Tech Innovations",
    email: "contact@techinnovations.com",
    contact: "+1 (555) 987-6543",
    category: "Electronics",
    status: "active",
    joinDate: "2022-01-05"
  },
  {
    id: 3,
    name: "Global Logistics",
    email: "support@globallogistics.com",
    contact: "+1 (555) 456-7890",
    category: "Shipping",
    status: "inactive",
    joinDate: "2020-11-18"
  },
  {
    id: 4,
    name: "Green Solutions",
    email: "info@greensolutions.com",
    contact: "+1 (555) 234-5678",
    category: "Eco-friendly Products",
    status: "active",
    joinDate: "2022-06-23"
  },
  {
    id: 5,
    name: "Premium Foods",
    email: "orders@premiumfoods.com",
    contact: "+1 (555) 789-0123",
    category: "Food & Beverage",
    status: "active",
    joinDate: "2021-09-30"
  }
];

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);

  const deleteVendor = (id: number) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      setVendors(vendors.filter(vendor => vendor.id !== id));
      toast.success('Vendor deleted successfully');
    }
  };

  return {
    vendors,
    deleteVendor
  };
}
