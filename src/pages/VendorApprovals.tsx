import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataTable from '@/components/shared/DataTable';
import { getAllProducts, updatedata } from '@/services/crudService';
import { Loader2, CheckCircle2, XCircle, RefreshCw, Eye, FileText, ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// API shape for vendors (as returned by vendorForm)
interface ApiVendor {
  'Vendor ID': number;
  'Vendor Name': string;
  'Vendor Email': string;
  'Vendor Phone': string;
  'Vendor Address': string;
  'Status': number;
  'Category': string;
  'Password': string;
  'Role': string;
  'Pincode': string;
  'Date of Birth': string;
  'Business Type': string;
  'Business Name': string;
  'GST Number': string;
  'Items Category': string;
  'Business Description': string;
  'PAN Number': string;
  'Aadhaar Number': string;
  'PAN Card Path': string;
  'Aadhaar Front Path': string;
  'Aadhaar Back Path': string;
  'Account Holder Name': string;
  'Bank Account Number': string;
  'Bank Name': string;
  'IFSC Code': string;
  'Bank Proof Path': string;
  'Agree to Terms': boolean;
  'Created At': string;
  'Updated At': string;
  'Address Line 1': string;
  'Address Line 2': string;
  'City': string;
  'State': string;
  'Postal Code': string;
  'Country': string;
  'Profile Picture': string;
  'Video Path': string;
  'Created Date Time': string;
}

// Local shape for table rendering
interface ApprovalVendor {
  id: number;
  name: string;
  email: string;
  contact: string;
  address: string;
  category: string;
  statusCode: 0 | 1 | 2;
  statusLabel: 'pending' | 'approved' | 'rejected';
  businessType: string;
  businessName: string;
  gstNumber: string;
  panNumber: string;
  aadhaarNumber: string;
  accountHolderName: string;
  bankAccountNumber: string;
  bankName: string;
  ifscCode: string;
  businessDescription: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  pincode: string;
  dob: string;
  itemsCategory: string;
  profilePicture: string;
  videoPath: string;
  panCardPath: string;
  aadhaarFrontPath: string;
  aadhaarBackPath: string;
  bankProofPath: string;
  agreeTerms: boolean;
  createdAt: string;
  updatedAt: string;
  createdDateTime: string;
}

const mapStatus = (code: number): ApprovalVendor['statusLabel'] => {
  if (code === 1) return 'approved';
  if (code === 2) return 'rejected';
  return 'pending';
};

const statusBadge = (label: ApprovalVendor['statusLabel']) => {
  if (label === 'approved') return <Badge variant="success">Approved</Badge>;
  if (label === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
};

const VendorApprovals = () => {
  const [vendors, setVendors] = useState<ApprovalVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<ApprovalVendor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<{ title: string; url: string } | null>(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await getAllProducts('vendorForm');
      if (!res.success || !res.data) throw new Error(res.message || 'Failed to fetch vendors');

      const mapped: ApprovalVendor[] = (res.data as ApiVendor[]).map((v) => ({
        id: v['Vendor ID'],
        name: v['Vendor Name'] || `Vendor ${v['Vendor ID']}`,
        email: v['Vendor Email'] || '',
        contact: v['Vendor Phone'] || '',
        address: v['Vendor Address'] || '',
        category: v['Category'] || 'Uncategorized',
        statusCode: (v['Status'] as number) as 0 | 1 | 2,
        statusLabel: mapStatus(v['Status']),
        businessType: v['Business Type'] || '',
        businessName: v['Business Name'] || '',
        gstNumber: v['GST Number'] || '',
        panNumber: v['PAN Number'] || '',
        aadhaarNumber: v['Aadhaar Number'] || '',
        accountHolderName: v['Account Holder Name'] || '',
        bankAccountNumber: v['Bank Account Number'] || '',
        bankName: v['Bank Name'] || '',
        ifscCode: v['IFSC Code'] || '',
        businessDescription: v['Business Description'] || '',
        addressLine1: v['Address Line 1'] || '',
        addressLine2: v['Address Line 2'] || '',
        city: v['City'] || '',
        state: v['State'] || '',
        postalCode: v['Postal Code'] || '',
        country: v['Country'] || '',
        pincode: v['Pincode'] || '',
        dob: v['Date of Birth'] || '',
        itemsCategory: v['Items Category'] || '',
        profilePicture: v['Profile Picture'] || '',
        videoPath: v['Video Path'] || '',
        panCardPath: v['PAN Card Path'] || '',
        aadhaarFrontPath: v['Aadhaar Front Path'] || '',
        aadhaarBackPath: v['Aadhaar Back Path'] || '',
        bankProofPath: v['Bank Proof Path'] || '',
        agreeTerms: v['Agree to Terms'] || false,
        createdAt: v['Created At'] || '',
        updatedAt: v['Updated At'] || '',
        createdDateTime: v['Created Date Time'] || '',
      }));
      setVendors(mapped);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);


  
 

  const setStatus = async (vendor: ApprovalVendor, statusCode: 0 | 1 | 2) => {
    try {
      setUpdatingId(vendor.id);
      // Corrected API signature and ensured list refresh after update
      const resp = await updatedata('vendorForm', vendor.id, { Status: statusCode });
      if (!resp.success) throw new Error(resp.message || 'Failed to update status');
      toast.success(`Vendor ${statusCode === 1 ? 'approved' : statusCode === 2 ? 'rejected' : 'set to pending'}`);
      await fetchVendors();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Failed to update vendor');
    } finally {
      setUpdatingId(null);
    }
  };

  const viewVendorDetails = (vendor: ApprovalVendor) => {
    setSelectedVendor(vendor);
    setDialogOpen(true);
  };

  const viewImage = (title: string, url: string) => {
    if (!url) {
      toast.error('No image available');
      return;
    }
    setCurrentImage({ title, url });
    setImageDialogOpen(true);
  };

  const hasDocument = (path: string) => {
    return path && path.trim() !== '';
  };

  const pending = useMemo(() => vendors.filter((v) => v.statusLabel === 'pending'), [vendors]);
  const approved = useMemo(() => vendors.filter((v) => v.statusLabel === 'approved'), [vendors]);
  const rejected = useMemo(() => vendors.filter((v) => v.statusLabel === 'rejected'), [vendors]);

  const makeColumns = (mode: 'pending' | 'approved' | 'rejected') => [
    {
      id: 'name',
      header: 'Name',
      cell: (row: ApprovalVendor) => <div className="font-medium">{row.name}</div>,
      filterType: 'text' as const,
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row: ApprovalVendor) => row.email,
      filterType: 'text' as const,
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: (row: ApprovalVendor) => row.contact,
      filterType: 'text' as const,
    },
    {
      id: 'businessType',
      header: 'Business Type',
      cell: (row: ApprovalVendor) => row.businessType || 'N/A',
      filterType: 'text' as const,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: ApprovalVendor) => statusBadge(row.statusLabel),
    },
    {
      id: 'profilePicture',
      header: 'Profile',
      cell: (row: ApprovalVendor) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => viewImage('Profile Picture', row.profilePicture)}
          disabled={!hasDocument(row.profilePicture)}
        >
          <ImageIcon className="h-4 w-4 mr-1" />
          View
        </Button>
      ),
    },
    {
      id: 'panCard',
      header: 'PAN Card',
      cell: (row: ApprovalVendor) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => viewImage('PAN Card', row.panCardPath)}
          disabled={!hasDocument(row.panCardPath)}
        >
          <FileText className="h-4 w-4 mr-1" />
          View
        </Button>
      ),
    },
    {
      id: 'aadhaarFront',
      header: 'Aadhaar Front',
      cell: (row: ApprovalVendor) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => viewImage('Aadhaar Front', row.aadhaarFrontPath)}
          disabled={!hasDocument(row.aadhaarFrontPath)}
        >
          <FileText className="h-4 w-4 mr-1" />
          View
        </Button>
      ),
    },
    {
      id: 'aadhaarBack',
      header: 'Aadhaar Back',
      cell: (row: ApprovalVendor) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => viewImage('Aadhaar Back', row.aadhaarBackPath)}
          disabled={!hasDocument(row.aadhaarBackPath)}
        >
          <FileText className="h-4 w-4 mr-1" />
          View
        </Button>
      ),
    },
    {
      id: 'bankProof',
      header: 'Bank Proof',
      cell: (row: ApprovalVendor) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => viewImage('Bank Proof', row.bankProofPath)}
          disabled={!hasDocument(row.bankProofPath)}
        >
          <FileText className="h-4 w-4 mr-1" />
          View
        </Button>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row: ApprovalVendor) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => viewVendorDetails(row)}
          >
            <Eye className="h-4 w-4 mr-1" /> Details
          </Button>
          {mode !== 'approved' && (
            <Button
              size="sm"
              onClick={() => setStatus(row, 1)}
              disabled={updatingId === row.id}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {updatingId === row.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                </>
              )}
            </Button>
          )}
          {mode !== 'rejected' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setStatus(row, 2)}
              disabled={updatingId === row.id}
            >
              {updatingId === row.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </>
              )}
            </Button>
          )}
          {mode !== 'pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus(row, 0)}
              disabled={updatingId === row.id}
            >
              {updatingId === row.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" /> Pending
                </>
              )}
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading vendors...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seller Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="pt-4">
              <DataTable data={pending} columns={makeColumns('pending')} searchKey="name" />
            </TabsContent>

            <TabsContent value="approved" className="pt-4">
              <DataTable data={approved} columns={makeColumns('approved')} searchKey="name" />
            </TabsContent>

            <TabsContent value="rejected" className="pt-4">
              <DataTable data={rejected} columns={makeColumns('rejected')} searchKey="name" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Vendor Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedVendor?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{selectedVendor.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{selectedVendor.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p>{selectedVendor.contact}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                  <p>{selectedVendor.dob || 'N/A'}</p>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Business Information</h3>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Business Type</label>
                  <p>{selectedVendor.businessType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                  <p>{selectedVendor.businessName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">GST Number</label>
                  <p>{selectedVendor.gstNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">PAN Number</label>
                  <p>{selectedVendor.panNumber || 'N/A'}</p>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Address</h3>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p>{selectedVendor.addressLine1} {selectedVendor.addressLine2}</p>
                  <p>{selectedVendor.city}, {selectedVendor.state} {selectedVendor.postalCode}</p>
                  <p>{selectedVendor.country}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pincode</label>
                  <p>{selectedVendor.pincode || 'N/A'}</p>
                </div>
              </div>

              {/* Bank Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Bank Details</h3>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Holder</label>
                  <p>{selectedVendor.accountHolderName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                  <p>{selectedVendor.bankAccountNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                  <p>{selectedVendor.bankName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IFSC Code</label>
                  <p>{selectedVendor.ifscCode || 'N/A'}</p>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4 col-span-2">
                <h3 className="font-semibold text-lg border-b pb-2">Additional Information</h3>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Business Description</label>
                  <p className="text-sm">{selectedVendor.businessDescription || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Items Category</label>
                  <p>{selectedVendor.itemsCategory || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Aadhaar Number</label>
                  <p>{selectedVendor.aadhaarNumber || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image View Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{currentImage?.title}</DialogTitle>
            <DialogDescription>
              View document for {selectedVendor?.name}
            </DialogDescription>
          </DialogHeader>
          
          {currentImage && (
            <div className="flex justify-center items-center mt-4">
              <img
                src={currentImage.url}
                alt={currentImage.title}
                className="max-w-full max-h-[70vh] object-contain border rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  toast.error('Failed to load image');
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorApprovals;