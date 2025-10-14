import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Icon from '../AppIcon';
import Image from '../AppImage';
import VendorStatusBadge from '../../pages/vendor-management-dashboard/components/VendorStatusBadge';

const VendorDetailsModal = ({
  isOpen,
  onClose,
  vendor,
  onStatusChange
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  if (!vendor) return null;

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'documents', label: 'Documents', icon: 'FileText' },
    { id: 'products', label: 'Products', icon: 'Package' }
  ];

  const mockDocuments = [
    { id: 1, name: 'Business License', status: 'approved', uploadDate: '2024-01-10', fileSize: '2.4 MB' },
    { id: 2, name: 'Tax Certificate', status: 'approved', uploadDate: '2024-01-10', fileSize: '1.8 MB' },
    { id: 3, name: 'Bank Statement', status: 'pending', uploadDate: '2024-01-12', fileSize: '3.2 MB' },
    { id: 4, name: 'Insurance Policy', status: 'rejected', uploadDate: '2024-01-08', fileSize: '4.1 MB' }
  ];

  const mockProducts = [
    { 
      id: 1, 
      name: 'Wireless Headphones', 
      category: 'Electronics', 
      price: 9999.99, 
      status: 'active',
      sku: 'WH-001',
      stock: 150,
      description: 'High-quality wireless headphones with noise cancellation',
      brand: 'TechBrand',
      weight: '250g',
      dimensions: '20x18x8 cm'
    },
    { 
      id: 2, 
      name: 'Smartphone Case', 
      category: 'Electronics', 
      price: 499.99, 
      status: 'active',
      sku: 'SC-002',
      stock: 300,
      description: 'Premium quality protective case for smartphones',
      brand: 'CasePro',
      weight: '50g',
      dimensions: '15x8x1 cm'
    },
    { 
      id: 3, 
      name: 'Bluetooth Speaker', 
      category: 'Electronics', 
      price: 4999.99, 
      status: 'inactive',
      sku: 'BS-003',
      stock: 0,
      description: 'Portable bluetooth speaker with 360-degree sound',
      brand: 'SoundMax',
      weight: '500g',
      dimensions: '12x12x15 cm'
    },
    { 
      id: 4, 
      name: 'Laptop Stand', 
      category: 'Accessories', 
      price: 1999.99, 
      status: 'active',
      sku: 'LS-004',
      stock: 75,
      description: 'Adjustable aluminum laptop stand for better ergonomics',
      brand: 'DeskPro',
      weight: '800g',
      dimensions: '30x25x5 cm'
    }
  ];

  const categories = ['all', ...new Set(mockProducts.map(p => p.category))];

  // Filter products based on search and filters
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const styles = {
    documentItem: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    title: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937'
    },
    badge: {
      background: '#10b981',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px'
    },
    imageBox: {
      background: '#f9fafb',
      borderRadius: '6px',
      padding: '20px',
      textAlign: 'center'
    },
    image: {
      maxWidth: '300px',
      maxHeight: '200px',
      objectFit: 'contain'
    },
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '20px',
      padding: '20px 0'
    },
    card: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#ffffff',
      transition: 'box-shadow 0.2s'
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '12px'
    },
    imageWrapper: {
      position: 'relative',
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      minHeight: '150px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    expandHint: {
      position: 'absolute',
      bottom: '8px',
      right: '8px',
      fontSize: '12px',
      color: '#6b7280',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '4px 8px',
      borderRadius: '4px'
    },
    status: {
      marginTop: '12px',
      fontSize: '12px',
      color: '#10b981',
      fontWeight: '500'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      cursor: 'pointer'
    },
    modalImage: {
      maxWidth: '90%',
      maxHeight: '90%',
      objectFit: 'contain',
      cursor: 'default'
    },
    closeButton: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      fontSize: '40px',
      color: 'white',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      zIndex: 1001
    },
    infoCard: {
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e5e7eb'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #e5e7eb'
    },
    infoLabel: {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: '500'
    },
    infoValue: {
      fontSize: '14px',
      color: '#1f2937',
      fontWeight: '600'
    }
  };

  const handleImageClick = (imagePath, imageTitle) => {
    setExpandedImage({ path: imagePath, title: imageTitle });
  };

  const closeModal = () => {
    setExpandedImage(null);
  };

  const toggleProductExpansion = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  // Mock document images - replace these with actual vendor document URLs
  const documentImages = {
    aadhaarFront: vendor?.aadhaar_front || vendor?.profile_picture || '/placeholder-document.png',
    aadhaarBack: vendor?.aadhaar_back || vendor?.profile_picture || '/placeholder-document.png',
    panCard: vendor?.pan_card || vendor?.profile_picture || '/placeholder-document.png',
    bankProof: vendor?.bank_proof || vendor?.profile_picture || '/placeholder-document.png'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vendor Details" size="xl">
      <div className="space-y-6">
        {/* Vendor Header */}
        <div className="flex items-start space-x-4 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <Image src={vendor?.profile_picture} alt={vendor?.business_name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-foreground">{vendor?.business_name}</h2>
              <VendorStatusBadge status={vendor?.status} isActive={vendor?.isActive} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Contact Person:</span>
                <span className="ml-2 text-foreground font-medium">{vendor?.vendor_name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2 text-foreground">{vendor?.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <span className="ml-2 text-foreground">{vendor?.phone_number}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span>
                <span className="ml-2 text-foreground">{vendor?.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex space-x-0 overflow-x-auto">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Information Card */}
                <div style={styles.infoCard}>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Icon name="Briefcase" size={20} className="mr-2 text-primary" />
                    Business Information
                  </h3>
                  <div className="space-y-1">
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Registration Date</span>
                      <span style={styles.infoValue}>{formatDate(vendor?.created_date_time)}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Business Type</span>
                      <span style={styles.infoValue}>{vendor?.business_type || 'N/A'}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>GST Number</span>
                      <span style={styles.infoValue}>{vendor?.gst_number || 'N/A'}</span>
                    </div>
                    <div style={{...styles.infoRow, borderBottom: 'none'}}>
                      <span style={styles.infoLabel}>Business Category</span>
                      <span style={styles.infoValue}>{vendor?.category || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Account Status Card */}
                <div style={styles.infoCard}>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Icon name="Shield" size={20} className="mr-2 text-primary" />
                    Account Status
                  </h3>
                  <div className="space-y-1">
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Verification Status</span>
                      <span style={styles.infoValue}>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          vendor?.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vendor?.status === 'approved' ? 'Verified' : 'Pending Verification'}
                        </span>
                      </span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Account Status</span>
                      <span style={styles.infoValue}>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          vendor?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vendor?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Products Listed</span>
                      <span style={styles.infoValue}>{mockProducts?.length}</span>
                    </div>
                    <div style={{...styles.infoRow, borderBottom: 'none'}}>
                      <span style={styles.infoLabel}>Total Documents</span>
                      <span style={styles.infoValue}>{mockDocuments?.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">Uploaded Documents</h3>
              </div>

              {/* Document Images Grid */}
              <div style={styles.container}>
                {/* Aadhaar Front */}
                <div style={styles.card}>
                  <div style={styles.label}>Aadhaar Card - Front</div>
                  <div
                    style={styles.imageWrapper}
                    onClick={() => handleImageClick(documentImages.aadhaarFront, 'Aadhaar Card - Front')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src={documentImages.aadhaarFront}
                      alt="Aadhaar Front"
                      style={styles.image}
                    />
                    <span style={styles.expandHint}>Click to expand</span>
                  </div>
                  <div style={styles.status}>✓ Uploaded</div>
                </div>

                {/* Aadhaar Back */}
                <div style={styles.card}>
                  <div style={styles.label}>Aadhaar Card - Back</div>
                  <div
                    style={styles.imageWrapper}
                    onClick={() => handleImageClick(documentImages.aadhaarBack, 'Aadhaar Card - Back')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src={documentImages.aadhaarBack}
                      alt="Aadhaar Back"
                      style={styles.image}
                    />
                    <span style={styles.expandHint}>Click to expand</span>
                  </div>
                  <div style={styles.status}>✓ Uploaded</div>
                </div>

                {/* PAN Card */}
                <div style={styles.card}>
                  <div style={styles.label}>PAN Card</div>
                  <div
                    style={styles.imageWrapper}
                    onClick={() => handleImageClick(documentImages.panCard, 'PAN Card')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src={documentImages.panCard}
                      alt="PAN Card"
                      style={styles.image}
                    />
                    <span style={styles.expandHint}>Click to expand</span>
                  </div>
                  <div style={styles.status}>✓ Uploaded</div>
                </div>

                {/* Bank Proof */}
                <div style={styles.card}>
                  <div style={styles.label}>Bank Proof</div>
                  <div
                    style={styles.imageWrapper}
                    onClick={() => handleImageClick(documentImages.bankProof, 'Bank Proof')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src={documentImages.bankProof}
                      alt="Bank Proof"
                      style={styles.image}
                    />
                    <span style={styles.expandHint}>Click to expand</span>
                  </div>
                  <div style={styles.status}>✓ Uploaded</div>
                </div>
              </div>

              {/* Modal for expanded image */}
              {expandedImage && (
                <div style={styles.modal} onClick={closeModal}>
                  <button style={styles.closeButton} onClick={closeModal}>
                    ×
                  </button>
                  <img
                    src={expandedImage.path}
                    alt={expandedImage.title}
                    style={styles.modalImage}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">Product Catalog</h3>
                <Button variant="outline" size="sm">
                  <Icon name="Plus" size={16} />
                  Add Product
                </Button>
              </div>

              {/* Search and Filter Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(c => c !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Products List */}
              <div className="space-y-3">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No products found matching your criteria.
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product?.id} className="border border-border rounded-lg">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Icon name="Package" size={20} className="text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{product?.name}</p>
                            <p className="text-sm text-muted-foreground">{product?.category} 
                              {/* • SKU: {product?.sku} */}
                              </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium text-foreground">₹{product?.price.toLocaleString('en-IN')}</p>
                            <p className={`text-xs ${product?.status === 'active' ? 'text-success' : 'text-muted-foreground'}`}>
                              {product?.status}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleProductExpansion(product?.id)}
                          >
                            <Icon name={expandedProduct === product?.id ? 'ChevronUp' : 'Eye'} size={16} />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Expanded Product Details */}
                      {expandedProduct === product?.id && (
                        <div className="border-t border-border bg-gray-50 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-foreground mb-3">Product Details</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Brand:</span>
                                  <span className="text-foreground">{product?.brand}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Weight:</span>
                                  <span className="text-foreground">{product?.weight}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Dimensions:</span>
                                  <span className="text-foreground">{product?.dimensions}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-3">Inventory</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Stock:</span>
                                  <span className={`font-medium ${product?.stock > 0 ? 'text-success' : 'text-red-600'}`}>
                                    {product?.stock} units
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Status:</span>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    product?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {product?.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <h4 className="font-semibold text-foreground mb-2">Description</h4>
                              <p className="text-sm text-muted-foreground">{product?.description}</p>
                            </div>
                          </div>
                          <div className="flex justify-end mt-4 space-x-2">
                            <Button variant="outline" size="sm">
                              <Icon name="Edit" size={14} />
                              Edit Product
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                              <Icon name="Trash2" size={14} />
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {vendor?.status === 'pending' && (
          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => onStatusChange?.(vendor?.id, 'reject')}
              iconName="X"
              iconPosition="left"
            >
              Reject
            </Button>
            <Button
              variant="default"
              onClick={() => onStatusChange?.(vendor?.id, 'approve')}
              iconName="Check"
              iconPosition="left"
            >
              Approve
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VendorDetailsModal;