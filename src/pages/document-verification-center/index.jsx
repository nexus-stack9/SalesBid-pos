import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import DocumentCard from './components/DocumentCard';
import DocumentViewer from './components/DocumentViewer';
import VendorInfoPanel from './components/VendorInfoPanel';
import BulkActionsPanel from './components/BulkActionsPanel';
import FilterPanel from './components/FilterPanel';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';

const DocumentVerificationCenter = () => {
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [viewerDocument, setViewerDocument] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    documentType: 'all',
    vendor: 'all',
    search: '',
    sort: 'uploadedAt-desc'
  });

  // Mock data for documents
  const [documents, setDocuments] = useState([
    {
      id: 'doc-001',
      vendorId: 'vendor-001',
      vendorName: 'TechCorp Solutions',
      type: 'PAN Card',
      status: 'pending',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      uploadedAt: '2025-01-10 14:30',
      fileSize: '2.4 MB',
      lastReviewed: null,
      comments: []
    },
    {
      id: 'doc-002',
      vendorId: 'vendor-001',
      vendorName: 'TechCorp Solutions',
      type: 'Aadhaar Front',
      status: 'approved',
      imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
      uploadedAt: '2025-01-10 14:32',
      fileSize: '1.8 MB',
      lastReviewed: '2025-01-11 09:15',
      comments: [
        {
          author: 'Admin User',
          date: '2025-01-11 09:15',
          text: 'Document is clear and all details are visible. Approved.',
          action: 'approved'
        }
      ]
    },
    {
      id: 'doc-003',
      vendorId: 'vendor-002',
      vendorName: 'Global Enterprises',
      type: 'Bank Proof',
      status: 'rejected',
      imageUrl: 'https://images.unsplash.com/photo-1554224154-26032fced8bd?w=400&h=300&fit=crop',
      uploadedAt: '2025-01-09 16:45',
      fileSize: '3.1 MB',
      lastReviewed: '2025-01-10 11:20',
      comments: [
        {
          author: 'Admin User',
          date: '2025-01-10 11:20',
          text: 'Bank statement is older than 3 months. Please provide recent statement.',
          action: 'rejected'
        }
      ]
    },
    {
      id: 'doc-004',
      vendorId: 'vendor-003',
      vendorName: 'Innovation Labs',
      type: 'Aadhaar Back',
      status: 'requires-resubmission',
      imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
      uploadedAt: '2025-01-08 10:15',
      fileSize: '2.2 MB',
      lastReviewed: '2025-01-09 14:30',
      comments: [
        {
          author: 'Admin User',
          date: '2025-01-09 14:30',
          text: 'Image quality is poor. Please upload a clearer image.',
          action: 'requires-resubmission'
        }
      ]
    },
    {
      id: 'doc-005',
      vendorId: 'vendor-004',
      vendorName: 'Digital Dynamics',
      type: 'PAN Card',
      status: 'pending',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      uploadedAt: '2025-01-12 11:20',
      fileSize: '1.9 MB',
      lastReviewed: null,
      comments: []
    },
    {
      id: 'doc-006',
      vendorId: 'vendor-005',
      vendorName: 'Smart Systems',
      type: 'GST Certificate',
      status: 'pending',
      imageUrl: 'https://images.unsplash.com/photo-1554224154-26032fced8bd?w=400&h=300&fit=crop',
      uploadedAt: '2025-01-12 15:45',
      fileSize: '2.7 MB',
      lastReviewed: null,
      comments: []
    }
  ]);

  // Mock vendor data
  const vendors = [
    {
      id: 'vendor-001',
      name: 'TechCorp Solutions',
      businessType: 'Technology Services',
      location: 'San Francisco, CA',
      registrationDate: 'Dec 15, 2024',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop',
      verificationProgress: 75,
      documentsVerified: 3,
      totalDocuments: 4,
      email: 'contact@techcorp.com',
      phone: '+1 (555) 123-4567',
      website: 'www.techcorp.com',
      registrationNumber: 'TC2024001',
      gstNumber: '29ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      incorporationDate: 'Jan 15, 2020',
      documentStatus: [
        { type: 'PAN Card', status: 'pending' },
        { type: 'Aadhaar Front', status: 'approved' },
        { type: 'Aadhaar Back', status: 'approved' },
        { type: 'Bank Proof', status: 'approved' }
      ]
    },
    {
      id: 'vendor-002',
      name: 'Global Enterprises',
      businessType: 'Manufacturing',
      location: 'New York, NY',
      registrationDate: 'Dec 20, 2024',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop',
      verificationProgress: 25,
      documentsVerified: 1,
      totalDocuments: 4,
      email: 'info@globalent.com',
      phone: '+1 (555) 987-6543',
      website: 'www.globalenterprises.com',
      registrationNumber: 'GE2024002',
      gstNumber: '36FGHIJ5678K2L9',
      panNumber: 'FGHIJ5678K',
      incorporationDate: 'Mar 10, 2018',
      documentStatus: [
        { type: 'PAN Card', status: 'approved' },
        { type: 'Aadhaar Front', status: 'pending' },
        { type: 'Aadhaar Back', status: 'pending' },
        { type: 'Bank Proof', status: 'rejected' }
      ]
    }
  ];

  const documentTypes = ['PAN Card', 'Aadhaar Front', 'Aadhaar Back', 'Bank Proof', 'GST Certificate'];

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents?.filter(doc => {
      const matchesStatus = filters?.status === 'all' || doc?.status === filters?.status;
      const matchesType = filters?.documentType === 'all' || doc?.type === filters?.documentType;
      const matchesVendor = filters?.vendor === 'all' || doc?.vendorId === filters?.vendor;
      const matchesSearch = filters?.search === '' || 
        doc?.vendorName?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
        doc?.type?.toLowerCase()?.includes(filters?.search?.toLowerCase());

      return matchesStatus && matchesType && matchesVendor && matchesSearch;
    });

    // Sort documents
    const [sortField, sortDirection] = filters?.sort?.split('-');
    filtered?.sort((a, b) => {
      let aValue = a?.[sortField];
      let bValue = b?.[sortField];

      if (sortField === 'uploadedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [documents, filters]);

  const pendingDocuments = documents?.filter(doc => doc?.status === 'pending')?.length;

  // Handle document selection
  const handleDocumentSelect = (documentId, isSelected) => {
    if (isSelected) {
      setSelectedDocuments(prev => [...prev, documentId]);
    } else {
      setSelectedDocuments(prev => prev?.filter(id => id !== documentId));
    }
  };

  const handleSelectAll = () => {
    const pendingDocIds = filteredDocuments?.filter(doc => doc?.status === 'pending')?.map(doc => doc?.id);
    setSelectedDocuments(pendingDocIds);
  };

  const handleDeselectAll = () => {
    setSelectedDocuments([]);
  };

  // Document actions
  const handleViewDocument = (document) => {
    setViewerDocument(document);
    setIsViewerOpen(true);
    
    // Set selected vendor for info panel
    const vendor = vendors?.find(v => v?.id === document?.vendorId);
    setSelectedVendor(vendor);
  };

  const handleApproveDocument = (documentData) => {
    setDocuments(prev => prev?.map(doc => 
      doc?.id === documentData?.id 
        ? { 
            ...doc, 
            status: 'approved', 
            lastReviewed: documentData?.reviewedAt,
            comments: [...doc?.comments, {
              author: documentData?.reviewedBy,
              date: documentData?.reviewedAt,
              text: documentData?.comment,
              action: 'approved'
            }]
          }
        : doc
    ));
  };

  const handleRejectDocument = (documentData) => {
    setDocuments(prev => prev?.map(doc => 
      doc?.id === documentData?.id 
        ? { 
            ...doc, 
            status: 'rejected', 
            lastReviewed: documentData?.reviewedAt,
            comments: [...doc?.comments, {
              author: documentData?.reviewedBy,
              date: documentData?.reviewedAt,
              text: documentData?.comment,
              action: 'rejected'
            }]
          }
        : doc
    ));
  };

  const handleRequestResubmission = (documentData) => {
    setDocuments(prev => prev?.map(doc => 
      doc?.id === documentData?.id 
        ? { 
            ...doc, 
            status: 'requires-resubmission', 
            lastReviewed: documentData?.reviewedAt,
            comments: [...doc?.comments, {
              author: documentData?.reviewedBy,
              date: documentData?.reviewedAt,
              text: documentData?.comment,
              action: 'requires-resubmission'
            }]
          }
        : doc
    ));
  };

  // Bulk actions
  const handleBulkApprove = (actionData) => {
    setDocuments(prev => prev?.map(doc => 
      actionData?.documentIds?.includes(doc?.id)
        ? { 
            ...doc, 
            status: 'approved', 
            lastReviewed: actionData?.reviewedAt,
            comments: [...doc?.comments, {
              author: actionData?.reviewedBy,
              date: actionData?.reviewedAt,
              text: actionData?.comment,
              action: 'approved'
            }]
          }
        : doc
    ));
    setSelectedDocuments([]);
  };

  const handleBulkReject = (actionData) => {
    setDocuments(prev => prev?.map(doc => 
      actionData?.documentIds?.includes(doc?.id)
        ? { 
            ...doc, 
            status: 'rejected', 
            lastReviewed: actionData?.reviewedAt,
            comments: [...doc?.comments, {
              author: actionData?.reviewedBy,
              date: actionData?.reviewedAt,
              text: actionData?.comment,
              action: 'rejected'
            }]
          }
        : doc
    ));
    setSelectedDocuments([]);
  };

  const handleBulkRequestResubmission = (actionData) => {
    setDocuments(prev => prev?.map(doc => 
      actionData?.documentIds?.includes(doc?.id)
        ? { 
            ...doc, 
            status: 'requires-resubmission', 
            lastReviewed: actionData?.reviewedAt,
            comments: [...doc?.comments, {
              author: actionData?.reviewedBy,
              date: actionData?.reviewedAt,
              text: actionData?.comment,
              action: 'requires-resubmission'
            }]
          }
        : doc
    ));
    setSelectedDocuments([]);
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      documentType: 'all',
      vendor: 'all',
      search: '',
      sort: 'uploadedAt-desc'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Document Verification Center</h1>
              <p className="text-muted-foreground">
                Review and verify vendor business documentation during the onboarding process
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Icon name="Download" size={16} />
                Export Report
              </Button>
              <Button variant="outline">
                <Icon name="RefreshCw" size={16} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="xl:col-span-3 space-y-6">
              {/* Bulk Actions Panel */}
              <BulkActionsPanel
                selectedDocuments={selectedDocuments}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onBulkApprove={handleBulkApprove}
                onBulkReject={handleBulkReject}
                onBulkRequestResubmission={handleBulkRequestResubmission}
                totalDocuments={documents?.length}
                pendingDocuments={pendingDocuments}
              />

              {/* Filter Panel */}
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                documentTypes={documentTypes}
                vendors={vendors}
              />

              {/* Documents Grid */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Documents ({filteredDocuments?.length})
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Icon name="Info" size={16} />
                    <span>Click on document to view in full screen</span>
                  </div>
                </div>

                {filteredDocuments?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocuments?.map((document) => (
                      <div key={document?.id} className="relative">
                        {document?.status === 'pending' && (
                          <div className="absolute top-2 left-2 z-10">
                            <Checkbox
                              checked={selectedDocuments?.includes(document?.id)}
                              onChange={(e) => handleDocumentSelect(document?.id, e?.target?.checked)}
                              className="bg-background/80"
                            />
                          </div>
                        )}
                        <DocumentCard
                          document={document}
                          onView={handleViewDocument}
                          onApprove={handleApproveDocument}
                          onReject={handleRejectDocument}
                          onRequestResubmission={handleRequestResubmission}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon name="FileX" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search criteria
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              {selectedVendor ? (
                <VendorInfoPanel vendor={selectedVendor} />
              ) : (
                <div className="bg-card border border-border rounded-lg p-6 text-center">
                  <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">Vendor Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on a document to view vendor details and verification progress
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {/* Document Viewer Modal */}
      <DocumentViewer
        document={viewerDocument}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setViewerDocument(null);
        }}
        onApprove={handleApproveDocument}
        onReject={handleRejectDocument}
        onRequestResubmission={handleRequestResubmission}
      />
    </div>
  );
};

export default DocumentVerificationCenter;