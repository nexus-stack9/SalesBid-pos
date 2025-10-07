import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import StatsCards from './components/StatsCards';
import FilterControls from './components/FilterControls';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import ProductTable from './components/ProductTable';
import ProductUploadModal from './components/ProductUploadModal';
import Button from '../../components/ui/Button';
import { getAllVendors } from '../../services/posCrud';
import { getAllProductsByVendorId } from '../../services/posCrud';
import { insertRecord, uploadMultipleFiles, uploadFile, updatedata } from '../../services/crudService';

const ProductCatalogManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const stats = {
    totalProducts: 156,
    activeAuctions: 23,
    scheduledAuctions: 18,
    totalRevenue: 245680
  };

  const fetchAllProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllProductsByVendorId(15);
      console.log("Fetched products:", response?.data);
      setProducts(response?.data || []);
      setFilteredProducts(response?.data || []);
    } catch (err) {
      if (err.response?.status === 204) {
        setProducts([]);
        setFilteredProducts([]);
      } else {
        setError("Failed to load products");
        console.error("Error fetching products:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleFilterChange = (filters) => {
    let filtered = [...products];

    if (filters?.category) {
      filtered = filtered?.filter(product => 
        product?.category?.toLowerCase() === filters?.category?.toLowerCase()
      );
    }

    if (filters?.vendor) {
      filtered = filtered?.filter(product => 
        product?.seller?.toLowerCase()?.includes(filters?.vendor?.toLowerCase())
      );
    }

    if (filters?.auctionStatus) {
      filtered = filtered?.filter(product => 
        product?.auctionStatus === filters?.auctionStatus
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    if (!query?.trim()) {
      setFilteredProducts(products);
      return;
    }

    let filtered = products?.filter(product =>
      product?.name?.toLowerCase()?.includes(query?.toLowerCase()) ||
      product?.sku?.toLowerCase()?.includes(query?.toLowerCase()) ||
      product?.seller?.toLowerCase()?.includes(query?.toLowerCase())
    );

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleStatusToggle = (productId) => {
    setProducts(prev => prev?.map(product =>
      product?.product_id === productId
        ? { ...product, isActive: !product?.isActive }
        : product
    ));
    setFilteredProducts(prev => prev?.map(product =>
      product?.product_id === productId
        ? { ...product, isActive: !product?.isActive }
        : product
    ));
  };

  const handleAuctionToggle = (productId) => {
    setProducts(prev => prev?.map(product =>
      product?.product_id === productId
        ? { 
            ...product, 
            auctionStatus: product?.auctionStatus === 'live' ? 'scheduled' : 'live'
          }
        : product
    ));
    setFilteredProducts(prev => prev?.map(product =>
      product?.product_id === productId
        ? { 
            ...product, 
            auctionStatus: product?.auctionStatus === 'live' ? 'scheduled' : 'live'
          }
        : product
    ));
  };

  const handleEditProduct = (productId) => {
    console.log('Edit product:', productId);
    // Navigate to edit page or open edit modal
  };

  const handleSelectProduct = (productId, isSelected) => {
    if (isSelected) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev?.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const currentPageProducts = getCurrentPageProducts();
      const currentPageIds = currentPageProducts?.map(product => product?.product_id);
      setSelectedProducts(prev => [...new Set([...prev, ...currentPageIds])]);
    } else {
      const currentPageProducts = getCurrentPageProducts();
      const currentPageIds = currentPageProducts?.map(product => product?.product_id);
      setSelectedProducts(prev => prev?.filter(id => !currentPageIds?.includes(id)));
    }
  };

  const handleBulkAction = (action) => {
    console.log(`Performing bulk action: ${action} on products:`, selectedProducts);
    
    switch (action) {
      case 'activate':
        setProducts(prev => prev?.map(product =>
          selectedProducts?.includes(product?.product_id)
            ? { ...product, isActive: true }
            : product
        ));
        setFilteredProducts(prev => prev?.map(product =>
          selectedProducts?.includes(product?.product_id)
            ? { ...product, isActive: true }
            : product
        ));
        break;
      case 'deactivate':
        setProducts(prev => prev?.map(product =>
          selectedProducts?.includes(product?.product_id)
            ? { ...product, isActive: false }
            : product
        ));
        setFilteredProducts(prev => prev?.map(product =>
          selectedProducts?.includes(product?.product_id)
            ? { ...product, isActive: false }
            : product
        ));
        break;
      case 'start-auction':
        setProducts(prev => prev?.map(product =>
          selectedProducts?.includes(product?.product_id)
            ? { ...product, auctionStatus: 'live' }
            : product
        ));
        setFilteredProducts(prev => prev?.map(product =>
          selectedProducts?.includes(product?.product_id)
            ? { ...product, auctionStatus: 'live' }
            : product
        ));
        break;
      case 'end-auction':
        setProducts(prev => prev?.map(product =>
          selectedProducts?.includes(product?.product_id)
            ? { ...product, auctionStatus: 'ended' }
            : product
        ));
        setFilteredProducts(prev => prev?.map(product =>
          selectedProducts?.includes(product?.product_id)
            ? { ...product, auctionStatus: 'ended' }
            : product
        ));
        break;
      case 'delete':
        setProducts(prev => prev?.filter(product => !selectedProducts?.includes(product?.product_id)));
        setFilteredProducts(prev => prev?.filter(product => !selectedProducts?.includes(product?.product_id)));
        break;
    }
    
    setSelectedProducts([]);
  };

  const handleClearSelection = () => {
    setSelectedProducts([]);
  };

  const handleExport = () => {
    console.log('Exporting selected products:', selectedProducts);
    // Implement export functionality
  };

  const handleAddProduct = () => {
    setIsUploadModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      console.log('Saving product with data:', productData);
      
      // Prepare product data for database (without file objects)
      const productFormData = {
        name: productData.name,
        description: productData.description,
        category_id: productData.category_id,
        vendor_id: productData.vendor_id,
        starting_price: productData.starting_price,
        retail_value: productData.retail_value,
        auction_start: productData.auction_start,
        auction_end: productData.auction_end,
        location: productData.location,
        shipping: productData.shipping,
        quantity: productData.quantity,
        condition: productData.condition,
        tags: productData.tags,
        buy_option: productData.buy_option,
        sale_price: productData.sale_price,
        weight: productData.weight,
        height: productData.height,
        length: productData.length,
        breadth: productData.breadth,
        trending: productData.trending,
        isactive: productData.isactive,
        status: productData.status,
        auctionstatus: productData.auctionstatus,
        vendorEmail: 'vendor@example.com', // TODO: Get from auth context
        currentBid: null,
        image_path: '' // Will be updated after upload
      };
      
      // Step 1: Insert product record into database
      console.log('Inserting product record:', productFormData);
      const result = await insertRecord('productForm', productFormData);
      
      if (!result.success || !result.id) {
        console.error('Failed to create product:', result.error);
        alert(result.error || 'Failed to create product');
        return;
      }
      
      const productId = result.id;
      const vendorId = productData.vendor_id || 15; // Using 15 as default based on your fetchAllProducts
      console.log('Product created with ID:', productId);
      
      // Step 2: Handle image uploads if any
      let mainImagePath = '';
      if (productData.imageFiles && productData.imageFiles.length > 0) {
        const filePathPrefix = "https://pub-a9806e1f673d447a94314a6d53e85114.r2.dev";
        const uploadPath = `${vendorId}/Products/${productId}`;
        
        console.log('Uploading images to path:', uploadPath);
        console.log('Number of images to upload:', productData.imageFiles.length);
        
        try {
          // Upload all image files
          const uploadRes = await uploadMultipleFiles(productData.imageFiles, uploadPath);
          
          if (uploadRes.success) {
            console.log('Images uploaded successfully');
            
            // Set the first image as the main image path
            mainImagePath = `${filePathPrefix}/${uploadPath}/${productData.imageFiles[0].name}`;
            
            // Update product record with main image path
            const updateData = {
              image_path: mainImagePath
            };
            
            console.log('Updating product with image path:', updateData);
            const updateRes = await updatedata('productForm', productId, updateData);
            
            if (!updateRes.success) {
              console.error('Failed to update product with image path:', updateRes.error);
            }
          } else {
            console.error('Image upload failed:', uploadRes.error);
            alert('Product created but image upload failed. You can add images later.');
          }
        } catch (uploadError) {
          console.error('Error during image upload:', uploadError);
          alert('Product created but image upload failed. You can add images later.');
        }
      }
      
      // Step 3: Handle video uploads if any
      if (productData.videoFiles && productData.videoFiles.length > 0) {
        const filePathPrefix = "https://pub-a9806e1f673d447a94314a6d53e85114.r2.dev";
        const uploadPath = `${vendorId}/Products/${productId}/videos`;
        
        console.log('Uploading videos to path:', uploadPath);
        console.log('Number of videos to upload:', productData.videoFiles.length);
        
        try {
          const uploadRes = await uploadMultipleFiles(productData.videoFiles, uploadPath);
          
          if (uploadRes.success) {
            console.log('Videos uploaded successfully');
          } else {
            console.error('Video upload failed:', uploadRes.error);
            alert('Videos upload failed. You can add videos later.');
          }
        } catch (uploadError) {
          console.error('Error during video upload:', uploadError);
        }
      }
      
      // Step 4: Add to local state for immediate UI update
      const newProductWithId = {
        ...productFormData,
        product_id: productId,
        id: productId,
        image_path: mainImagePath
      };
      
      setProducts(prev => [newProductWithId, ...prev]);
      setFilteredProducts(prev => [newProductWithId, ...prev]);
      
      // Step 5: Refresh products list from server
      await fetchAllProducts();
      
      console.log('Product saved successfully with ID:', productId);
      alert('Product created successfully!');
      
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts?.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredProducts?.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Product Catalog Management</h1>
              <p className="text-muted-foreground">
                Manage product listings, auction controls, and inventory across all vendors
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
                onClick={handleExport}
              >
                Export All
              </Button>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                onClick={handleAddProduct}
              >
                Add Product
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* Filter Controls */}
          <FilterControls
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onAddProduct={handleAddProduct}
          />

          {/* Bulk Actions Toolbar */}
          <BulkActionsToolbar
            selectedCount={selectedProducts?.length}
            onBulkAction={handleBulkAction}
            onClearSelection={handleClearSelection}
            onExport={handleExport}
          />

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Products Table */}
              <ProductTable
                products={getCurrentPageProducts()}
                onStatusToggle={handleStatusToggle}
                onAuctionToggle={handleAuctionToggle}
                onEditProduct={handleEditProduct}
                onBulkAction={handleBulkAction}
                selectedProducts={selectedProducts}
                onSelectProduct={handleSelectProduct}
                onSelectAll={handleSelectAll}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts?.length)} of {filteredProducts?.length} products
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      iconName="ChevronLeft"
                      iconPosition="left"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      iconName="ChevronRight"
                      iconPosition="right"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* Product Upload Modal */}
      <ProductUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default ProductCatalogManagement;