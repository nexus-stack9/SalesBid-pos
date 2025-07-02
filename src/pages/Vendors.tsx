
import { useState } from 'react';
import { useVendors } from '@/hooks/useVendors';
import VendorTable from '@/components/vendors/VendorTable';
import VendorActions from '@/components/vendors/VendorActions';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Vendors = () => {
  const { vendors, deleteVendor, isLoading, error } = useVendors();
  const [vendorToDelete, setVendorToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: number) => {
    setVendorToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (vendorToDelete === null) return;
    
    try {
      setIsDeleting(true);
      await deleteVendor(vendorToDelete);
      setVendorToDelete(null);
    } catch (error) {
      console.error('Error deleting vendor:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading vendors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vendor Management</h2>
        <VendorActions vendors={vendors} />
      </div>
      
      <VendorTable 
        vendors={vendors} 
        onDelete={handleDeleteClick} 
      />

      <AlertDialog open={vendorToDelete !== null} onOpenChange={(open) => !open && setVendorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              Are you sure you want to delete this vendor? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Vendors;
