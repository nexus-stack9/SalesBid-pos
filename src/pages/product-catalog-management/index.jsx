import React, { useState, useEffect, useMemo } from 'react';
import { Package, Plus, Download, RefreshCw } from 'lucide-react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FilterControls from './components/FilterControls';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import ProductTable from './components/ProductTable';
import ProductUploadModal from './components/ProductUploadModal';
import Button from '../../components/ui/Button';
import { getAllProductsByVendorId } from '../../services/posCrud';
import { insertRecord, uploadMultipleFiles, updatedata, deleteRecord } from '../../services/crudService';

const ProductCatalogManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserData = () => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (error) {
        console.error('Error parsing cached user data:', error);
      }
    }
    return null;
  };

  const fetchAllProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = getUserData();
      
      if (!userData?.vendorId) {
        setError("Vendor ID not found");
        setProducts([]);
        setFilteredProducts([]);
        setIsLoading(false);
        return;
      }

      const response = await getAllProductsByVendorId(userData.vendorId);
      
      if (response?.data && Array.isArray(response.data)) {
        setProducts(response.data);
        setFilteredProducts(response.data);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
      
    } catch (err) {
      console.error("❌ Error details:", err);
      
      if (err.response?.status === 204) {
        setProducts([]);
        setFilteredProducts([]);
      } else {
        setError(err.response?.data?.error || "Failed to load products");
        setProducts([]);
        setFilteredProducts([]);
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
        product?.auctionstatus === filters?.auctionStatus
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

  const handleStatusToggle = async (productId) => {
    try {
      const product = products.find(p => p.product_id === productId);
      if (!product) return;

      const newStatus = !product.isactive;
      
      const result = await updatedata('productForm', productId, {
        isactive: newStatus
      });

      if (!result.success) {
        console.error('Failed to update product status:', result.message);
        return;
      }

      setProducts(prev => prev?.map(p =>
        p?.product_id === productId
          ? { ...p, isactive: newStatus }
          : p
      ));
      setFilteredProducts(prev => prev?.map(p =>
        p?.product_id === productId
          ? { ...p, isactive: newStatus }
          : p
      ));

    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const handleAuctionToggle = async (productId) => {
    try {
      const product = products.find(p => p.product_id === productId);
      if (!product) return;

      const newStatus = product?.auctionstatus === 'live' ? 'scheduled' : 'live';
      
      const result = await updatedata('productForm', productId, {
        auction_status: newStatus
      });

      if (!result.success) {
        console.error('Failed to update auction status:', result.message);
        return;
      }

      setProducts(prev => prev?.map(p =>
        p?.product_id === productId
          ? { ...p, auctionstatus: newStatus }
          : p
      ));
      setFilteredProducts(prev => prev?.map(p =>
        p?.product_id === productId
          ? { ...p, auctionstatus: newStatus }
          : p
      ));

    } catch (error) {
      console.error('Error toggling auction status:', error);
    }
  };

  const handleEditProduct = (productId) => {
    const product = products.find(p => p.product_id === productId);
    if (product) {
      setEditingProduct(product);
      setIsEditModalOpen(true);
    }
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

  const handleAuctionSchedule = async (auctionData) => {
    try {
      const updateData = {
        auction_start: auctionData.startDateTime.toISOString(),
        auction_end: auctionData.endDateTime.toISOString(),
        starting_price: auctionData.minBid,
        auction_status: 'scheduled',
        auctionstatus: 'scheduled'
      };

      const result = await updatedata('productForm', auctionData.productId, updateData);

      if (!result.success) {
        console.error('Failed to schedule auction:', result.message);
        alert('Failed to schedule auction. Please try again.');
        return;
      }

      setProducts(prev => prev?.map(product =>
        product?.product_id === auctionData.productId
          ? { 
              ...product, 
              auction_start: auctionData.startDateTime.toISOString(),
              auction_end: auctionData.endDateTime.toISOString(),
              starting_price: auctionData.minBid,
              auctionstatus: 'scheduled'
            }
          : product
      ));
      setFilteredProducts(prev => prev?.map(product =>
        product?.product_id === auctionData.productId
          ? { 
              ...product, 
              auction_start: auctionData.startDateTime.toISOString(),
              auction_end: auctionData.endDateTime.toISOString(),
              starting_price: auctionData.minBid,
              auctionstatus: 'scheduled'
            }
          : product
      ));

      alert('Auction scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling auction:', error);
      alert('Failed to schedule auction. Please try again.');
    }
  };

  const handleCellValueUpdate = async (productId, field, value) => {
    try {
      const updateData = {};
      if (field === 'startDate' || field === 'auction_start') {
        updateData.auction_start = value;
      } else if (field === 'endDate' || field === 'auction_end') {
        updateData.auction_end = value;
      } else {
        const fieldMapping = {
          'name': 'product_name',
          'description': 'product_description',
          'status': 'product_status',
          'isactive': 'is_active',
          'auctionstatus': 'auction_status'
        };
        const uiFieldName = fieldMapping[field] || field;
        updateData[uiFieldName] = value;
      }

      const result = await updatedata('productForm', productId, updateData);

      if (!result.success) {
        console.error('Failed to update product field:', result.message);
        return;
      }

      setProducts(prev => prev?.map(product =>
        product?.product_id === productId
          ? { ...product, ...updateData }
          : product
      ));
      setFilteredProducts(prev => prev?.map(product =>
        product?.product_id === productId
          ? { ...product, ...updateData }
          : product
      ));

    } catch (error) {
      console.error('Error updating product field:', error);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedProducts.length === 0) return;

    try {
      setIsLoading(true);
      
      switch (action) {
        case 'activate':
          await Promise.all(
            selectedProducts.map(productId =>
              updatedata('productForm', productId, { is_active: true })
            )
          );
          setProducts(prev => prev?.map(product =>
            selectedProducts?.includes(product?.product_id)
              ? { ...product, isactive: true }
              : product
          ));
          setFilteredProducts(prev => prev?.map(product =>
            selectedProducts?.includes(product?.product_id)
              ? { ...product, isactive: true }
              : product
          ));
          break;
          
        case 'deactivate':
          await Promise.all(
            selectedProducts.map(productId =>
              updatedata('productForm', productId, { is_active: false })
            )
          );
          setProducts(prev => prev?.map(product =>
            selectedProducts?.includes(product?.product_id)
              ? { ...product, isactive: false }
              : product
          ));
          setFilteredProducts(prev => prev?.map(product =>
            selectedProducts?.includes(product?.product_id)
              ? { ...product, isactive: false }
              : product
          ));
          break;
          
        case 'start-auction':
          await Promise.all(
            selectedProducts.map(productId =>
              updatedata('productForm', productId, { auctionstatus: 'live' })
            )
          );
          setProducts(prev => prev?.map(product =>
            selectedProducts?.includes(product?.product_id)
              ? { ...product, auctionstatus: 'live' }
              : product
          ));
          setFilteredProducts(prev => prev?.map(product =>
            selectedProducts?.includes(product?.product_id)
              ? { ...product, auctionstatus: 'live' }
              : product
          ));
          break;
          
        case 'end-auction':
          await Promise.all(
            selectedProducts.map(productId =>
              updatedata('productForm', productId, { auctionstatus: 'ended' })
            )
          );
          setProducts(prev => prev?.map(product =>
            selectedProducts?.includes(product?.product_id)
              ? { ...product, auctionstatus: 'ended' }
              : product
          ));
          setFilteredProducts(prev => prev?.map(product =>
            selectedProducts?.includes(product?.product_id)
              ? { ...product, auctionstatus: 'ended' }
              : product
          ));
          break;
          
        case 'delete':
          const confirmDelete = window.confirm(
            `Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`
          );
          
          if (!confirmDelete) {
            setIsLoading(false);
            return;
          }
          
          await Promise.all(
            selectedProducts.map(productId =>
              updatedata('productForm', productId, { is_active: false })
            )
          );
          
          setProducts(prev => prev?.filter(product => !selectedProducts?.includes(product?.product_id)));
          setFilteredProducts(prev => prev?.filter(product => !selectedProducts?.includes(product?.product_id)));
          break;
      }
      
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedProducts([]);
  };

  const handleExport = () => {
    console.log('Exporting products...');
  };

  const handleAddProduct = () => {
    setIsUploadModalOpen(true);
  };

  const handleEditSave = async (productData) => {
    try {
      const productId = editingProduct.product_id;
      const vendorId = getUserData()?.vendorId;
      const filePathPrefix = "https://pub-a9806e1f673d447a94314a6d53e85114.r2.dev";

      // Step 1: Update product basic data
      const updateData = {
        product_name: productData.name || '',
        product_description: productData.description || '',
        category_id: productData.category_id || null,
        starting_price: productData.starting_price || null,
        retail_value: productData.retail_value || null,
        auction_start: productData.auction_start || null,
        auction_end: productData.auction_end || null,
        location: productData.location || '',
        shipping: productData.shipping || '',
        quantity: productData.quantity || null,
        quantity_unit: productData.quantity_unit || 'units',
        condition: productData.condition || '',
        tags: productData.tags || '',
        buy_option: productData.buy_option !== undefined ? productData.buy_option : 0,
        sale_price: productData.sale_price || null,
        
        // Shipping fields
        product_location_pin: productData.product_location_pin || '',
        product_city: productData.product_city || '',
        product_state: productData.product_state || '',
        gross_weight: productData.gross_weight || null,
        num_boxes: productData.num_boxes || null,
        packaging_type: productData.packaging_type || '',
        
        // Box dimensions
        box_height: productData.box_height || null,
        box_length: productData.box_length || null,
        box_breadth: productData.box_breadth || null,
        
        // Legacy dimensions (for backward compatibility)
        weight: productData.gross_weight || productData.weight || null,
        height: productData.box_height || productData.height || null,
        length: productData.box_length || productData.length || null,
        breadth: productData.box_breadth || productData.breadth || null,
        
        // Status
        trending: productData.trending || false,
        is_active: productData.isactive !== undefined ? productData.isactive : true,
        seller_declaration: productData.seller_declaration || false,
        product_status: productData.status || 'active',
        auction_status: productData.auctionstatus || 'pending',
        auctionstatus: productData.auctionstatus || 'pending',
      };

      const result = await updatedata('productForm', productId, updateData);
      if (!result.success) {
        alert('Failed to update product. Please try again.');
        return false;
      }

      // Step 2: Prepare file paths object
      const filePaths = {};

      // Step 3: Combine all files for single upload
      const allFiles = [];
      const fileTypeMap = {}; // Track file type by name
      
      // Add images
      const allImageUrls = [];
      if (productData.existingImageUrls && productData.existingImageUrls.length > 0) {
        allImageUrls.push(...productData.existingImageUrls);
      }
      if (productData.imageFiles && productData.imageFiles.length > 0) {
        productData.imageFiles.forEach(file => {
          allFiles.push(file);
          fileTypeMap[file.name] = 'image';
        });
      }
      
      // Add videos
      const allVideoUrls = [];
      if (productData.existingVideoUrls && productData.existingVideoUrls.length > 0) {
        allVideoUrls.push(...productData.existingVideoUrls);
      }
      if (productData.videoFiles && productData.videoFiles.length > 0) {
        productData.videoFiles.forEach(file => {
          allFiles.push(file);
          fileTypeMap[file.name] = 'video';
        });
      }
      
      // Add documents (for backward compatibility)
      if (productData.documentFiles && productData.documentFiles.length > 0) {
        productData.documentFiles.forEach(file => {
          allFiles.push(file);
          fileTypeMap[file.name] = 'document';
        });
      }
      
      // Add manifest file
      if (productData.manifestFile) {
        allFiles.push(productData.manifestFile);
        fileTypeMap[productData.manifestFile.name] = 'manifest';
      }
      
      // Step 4: Upload all files at once if there are any new files
      if (allFiles.length > 0) {
        const baseUploadPath = `${vendorId}/Products/${productId}`;
        
        try {
          console.log('📤 Uploading all files at once to:', baseUploadPath);
          const uploadRes = await uploadMultipleFiles(allFiles, baseUploadPath);
          
          if (uploadRes.success) {
            // Organize uploaded files by type
            const manifestFiles = [];
            allFiles.forEach((file) => {
              const filePath = `${filePathPrefix}/${baseUploadPath}/${file.name}`;
              const fileType = fileTypeMap[file.name];
              
              if (fileType === 'image') {
                allImageUrls.push(filePath);
              } else if (fileType === 'video') {
                allVideoUrls.push(filePath);
              } else if (fileType === 'document') {
                // Documents go to manifest_url (backward compatibility)
                manifestFiles.push(filePath);
              } else if (fileType === 'manifest') {
                // Manifest takes priority - single file
                manifestFiles.length = 0; // Clear documents if manifest exists
                manifestFiles.push(filePath);
              }
            });
            
            // Set manifest_url - manifest file takes priority over documents
            if (manifestFiles.length > 0) {
              filePaths.manifest_url = manifestFiles.length === 1 
                ? manifestFiles[0] 
                : manifestFiles.join(',');
            }
            
            console.log('✅ All files uploaded successfully');
          }
        } catch (uploadError) {
          console.error('❌ Error during file upload:', uploadError);
        }
      }
      
      // Update paths
      if (allImageUrls.length > 0) {
        filePaths.image_path = allImageUrls.join(',');
      }
      
      if (allVideoUrls.length > 0) {
        filePaths.video_path = allVideoUrls.join(',');
      }
      
      // Keep existing manifest if no new one is uploaded
      if (!productData.manifestFile && !productData.documentFiles?.length && productData.existingManifestUrl) {
        filePaths.manifest_url = productData.existingManifestUrl;
      }

      // Step 7: Update product with all file paths in one call
      if (Object.keys(filePaths).length > 0) {
        await updatedata('productForm', productId, filePaths);
      }

      // Step 8: Refresh product list
      await fetchAllProducts();
      setIsEditModalOpen(false);
      setEditingProduct(null);
      alert('Product updated successfully!');
      
      return true;
      
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product. Please try again.');
      return false;
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      const vendorId = getUserData()?.vendorId;
      const filePathPrefix = "https://pub-a9806e1f673d447a94314a6d53e85114.r2.dev";

      // Step 1: Create product with basic data first
      const productFormData = {
        name: productData.name || '',
        description: productData.description || '',
        category_id: productData.category_id || null,
        starting_price: productData.starting_price || null,
        retail_value: productData.retail_value || null,
        auction_start: productData.auction_start || null,
        auction_end: productData.auction_end || null,
        location: productData.location || '',
        shipping: productData.shipping || '',
        quantity: productData.quantity || null,
        quantity_unit: productData.quantity_unit || 'units',
        condition: productData.condition || '',
        tags: productData.tags || '',
        buy_option: productData.buy_option !== undefined ? productData.buy_option : 0,
        sale_price: productData.sale_price || null,
        
        // Shipping fields
        product_location_pin: productData.product_location_pin || '',
        product_city: productData.product_city || '',
        product_state: productData.product_state || '',
        gross_weight: productData.gross_weight || null,
        num_boxes: productData.num_boxes || null,
        packaging_type: productData.packaging_type || '',
        
        // Box dimensions
        box_height: productData.box_height || null,
        box_length: productData.box_length || null,
        box_breadth: productData.box_breadth || null,
        
        // Legacy dimensions (for backward compatibility)
        weight: productData.gross_weight || productData.weight || null,
        height: productData.box_height || productData.height || null,
        length: productData.box_length || productData.length || null,
        breadth: productData.box_breadth || productData.breadth || null,
        
        // Status
        trending: productData.trending || false,
        isactive: productData.isactive !== undefined ? productData.isactive : true,
        seller_declaration: productData.seller_declaration || false,
        status: productData.status || 'active',
        created_by: getUserData()?.email || '',
        seller_id: getUserData()?.vendorId || null,
        auctionstatus: productData.auctionstatus || 'pending',
        vendor_email: getUserData()?.email || '',
        vendor_id: getUserData()?.vendorId || null,
        currentBid: null,
        image_path: '',
        video_path: '',
        manifest_url: ''
      };
      
      const result = await insertRecord('productForm', productFormData);
      
      if (!result.success || !result.id) {
        alert('Failed to create product. Please try again.');
        return false;
      }
      
      const productId = result.id;
      console.log('✅ Product created with ID:', productId);

      // Step 2: Prepare file paths object
      const filePaths = {};

      // Step 3: Combine all files for single upload
      const allFiles = [];
      const fileTypeMap = {}; // Track file type by name
      
      // Add images
      const allImageUrls = [];
      if (productData.existingImageUrls && productData.existingImageUrls.length > 0) {
        allImageUrls.push(...productData.existingImageUrls);
      }
      if (productData.imageFiles && productData.imageFiles.length > 0) {
        productData.imageFiles.forEach(file => {
          allFiles.push(file);
          fileTypeMap[file.name] = 'image';
        });
      }
      
      // Add videos
      const allVideoUrls = [];
      if (productData.videoFiles && productData.videoFiles.length > 0) {
        productData.videoFiles.forEach(file => {
          allFiles.push(file);
          fileTypeMap[file.name] = 'video';
        });
      }
      
      // Add documents (for backward compatibility)
      if (productData.documentFiles && productData.documentFiles.length > 0) {
        productData.documentFiles.forEach(file => {
          allFiles.push(file);
          fileTypeMap[file.name] = 'document';
        });
      }
      
      // Add manifest file
      if (productData.manifestFile) {
        allFiles.push(productData.manifestFile);
        fileTypeMap[productData.manifestFile.name] = 'manifest';
      }
      
      // Step 4: Upload all files at once if there are any new files
      if (allFiles.length > 0) {
        const baseUploadPath = `${vendorId}/Products/${productId}`;
        
        try {
          console.log('📤 Uploading all files at once to:', baseUploadPath);
          const uploadRes = await uploadMultipleFiles(allFiles, baseUploadPath);
          
          if (uploadRes.success) {
            // Organize uploaded files by type
            const manifestFiles = [];
            allFiles.forEach((file) => {
              const filePath = `${filePathPrefix}/${baseUploadPath}/${file.name}`;
              const fileType = fileTypeMap[file.name];
              
              if (fileType === 'image') {
                allImageUrls.push(filePath);
              } else if (fileType === 'video') {
                allVideoUrls.push(filePath);
              } else if (fileType === 'document') {
                // Documents go to manifest_url (backward compatibility)
                manifestFiles.push(filePath);
              } else if (fileType === 'manifest') {
                // Manifest takes priority - single file
                manifestFiles.length = 0; // Clear documents if manifest exists
                manifestFiles.push(filePath);
              }
            });
            
            // Set manifest_url - manifest file takes priority over documents
            if (manifestFiles.length > 0) {
              filePaths.manifest_url = manifestFiles.length === 1 
                ? manifestFiles[0] 
                : manifestFiles.join(',');
            }
            
            console.log('✅ All files uploaded successfully');
          }
        } catch (uploadError) {
          console.error('❌ Error during file upload:', uploadError);
        }
      }
      
      // Update paths
      if (allImageUrls.length > 0) {
        filePaths.image_path = allImageUrls.join(',');
        console.log('✅ All images (existing + new):', filePaths.image_path);
      }
      
      if (allVideoUrls.length > 0) {
        filePaths.video_path = allVideoUrls.join(',');
        console.log('✅ All videos:', filePaths.video_path);
      }
      
      if (filePaths.manifest_url) {
        console.log('✅ Manifest/Documents:', filePaths.manifest_url);
      }

      // Step 7: Update product with all file paths in one call
      if (Object.keys(filePaths).length > 0) {
        console.log('📝 Updating product with file paths:', filePaths);
        const updateResult = await updatedata('productForm', productId, filePaths);
        
        if (updateResult.success) {
          console.log('✅ Product updated with file paths successfully');
        } else {
          console.error('❌ Failed to update product with file paths');
        }
      }
      
      // Step 8: Refresh product list and close modal
      await fetchAllProducts();
      setIsUploadModalOpen(false);
      alert('Product added successfully!');
      
      return true;
      
    } catch (error) {
      console.error('❌ Error saving product:', error);
      alert('Error saving product. Please try again.');
      return false;
    }
  };

  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts?.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredProducts?.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{paddingLeft: '5rem'}}>
          <Breadcrumb />
          
          {/* Enhanced Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Product Catalog Management
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage product listings, auction controls, and inventory
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Filter Controls */}
          <div className="mb-6">
            <FilterControls
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              onAddProduct={handleAddProduct}
            />
          </div>

          {/* Bulk Actions Toolbar */}
          <BulkActionsToolbar
            selectedCount={selectedProducts?.length}
            onBulkAction={handleBulkAction}
            onClearSelection={handleClearSelection}
            onExport={handleExport}
          />

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-2xl shadow-xl">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-purple-600 mx-auto mb-6"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="text-purple-600" size={32} />
                  </div>
                </div>
                <p className="text-gray-600 font-semibold text-lg">Loading products...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Products Table */}
              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-6">
                <ProductTable
                  products={getCurrentPageProducts()}
                  onStatusToggle={handleStatusToggle}
                  onAuctionToggle={handleAuctionToggle}
                  onEditProduct={handleEditProduct}
                  onBulkAction={handleBulkAction}
                  selectedProducts={selectedProducts}
                  onSelectProduct={handleSelectProduct}
                  onSelectAll={handleSelectAll}
                  onCellValueUpdate={handleCellValueUpdate}
                  onAuctionSchedule={handleAuctionSchedule}
                />
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                  <div className="text-sm text-gray-600 font-medium">
                    Showing <span className="font-bold text-gray-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredProducts?.length)}</span> of <span className="font-bold text-gray-900">{filteredProducts?.length}</span> products
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      iconName="ChevronLeft"
                      iconPosition="left"
                      className="rounded-xl"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`rounded-xl min-w-[40px] ${currentPage === pageNum ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}`}
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
                      className="rounded-xl"
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
      
      {/* Modals */}
      <ProductUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSave={handleSaveProduct}
        isEditMode={false}
      />

      <ProductUploadModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleEditSave}
        initialData={editingProduct}
        isEditMode={true}
      />
    </div>
  );
};

export default ProductCatalogManagement;