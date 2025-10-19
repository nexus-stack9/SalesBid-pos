import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  TrendingUp, TrendingDown, Package, IndianRupee, ShoppingCart, Calendar,
  Filter, Download, Plus, RefreshCw, Eye, Zap, Clock, CheckCircle
} from 'lucide-react';
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

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    // Total stats
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p?.isactive).length;
    const liveAuctions = products.filter(p => p?.auctionstatus === 'live').length;
    const scheduledAuctions = products.filter(p => p?.auctionstatus === 'scheduled').length;
    const totalRevenue = products.reduce((sum, p) => sum + (parseFloat(p?.starting_price) || 0), 0);

    // Auction status distribution
    const auctionStatusData = [
      { name: 'Live', value: liveAuctions, color: '#10b981' },
      { name: 'Scheduled', value: scheduledAuctions, color: '#f59e0b' },
      { name: 'Ended', value: products.filter(p => p?.auctionstatus === 'ended').length, color: '#6b7280' },
      { name: 'Draft', value: products.filter(p => !p?.auctionstatus || p?.auctionstatus === 'draft').length, color: '#94a3b8' }
    ];

    // Category distribution
    const categoryCount = {};
    products.forEach(product => {
      const category = product?.category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const categoryData = Object.keys(categoryCount).slice(0, 5).map(category => ({
      name: category,
      count: categoryCount[category]
    }));

    // Price range distribution
    const priceRanges = [
      { range: '₹0-1000', min: 0, max: 1000, count: 0 },
      { range: '₹1000-5000', min: 1000, max: 5000, count: 0 },
      { range: '₹5000-10000', min: 5000, max: 10000, count: 0 },
      { range: '₹10000+', min: 10000, max: Infinity, count: 0 }
    ];

    products.forEach(product => {
      const price = parseFloat(product?.starting_price) || 0;
      priceRanges.forEach(range => {
        if (price >= range.min && price < range.max) {
          range.count++;
        }
      });
    });

    // Stock status
    const stockData = [
      { name: 'In Stock', value: products.filter(p => (p?.quantity || 0) > 10).length, color: '#10b981' },
      { name: 'Low Stock', value: products.filter(p => {
        const qty = p?.quantity || 0;
        return qty > 0 && qty <= 10;
      }).length, color: '#f59e0b' },
      { name: 'Out of Stock', value: products.filter(p => (p?.quantity || 0) === 0).length, color: '#ef4444' }
    ];

    // Recent activity (mock data - replace with real timestamps)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const activityData = months.map(month => ({
      month,
      products: Math.floor(Math.random() * 30) + 10
    }));

    return {
      totalProducts,
      activeProducts,
      liveAuctions,
      scheduledAuctions,
      totalRevenue,
      auctionStatusData,
      categoryData,
      priceRanges,
      stockData,
      activityData
    };
  }, [products]);

  // Stats for cards
  const stats = useMemo(() => {
    return [
      {
        title: 'Total Products',
        value: analyticsData.totalProducts,
        change: '+12.5%',
        isPositive: true,
        icon: Package,
        iconBg: 'bg-blue-500',
        iconColor: 'text-blue-500',
        description: `${analyticsData.activeProducts} active`
      },
      {
        title: 'Live Auctions',
        value: analyticsData.liveAuctions,
        change: '+8.2%',
        isPositive: true,
        icon: Zap,
        iconBg: 'bg-green-500',
        iconColor: 'text-green-500',
        description: 'Currently running'
      },
      {
        title: 'Scheduled',
        value: analyticsData.scheduledAuctions,
        change: '+15.3%',
        isPositive: true,
        icon: Clock,
        iconBg: 'bg-yellow-500',
        iconColor: 'text-yellow-500',
        description: 'Upcoming auctions'
      },
      {
        title: 'Total Value',
        value: `₹${(analyticsData.totalRevenue / 1000).toFixed(1)}K`,
        change: '+23.1%',
        isPositive: true,
        icon: IndianRupee,
        iconBg: 'bg-purple-500',
        iconColor: 'text-purple-500',
        description: 'Inventory value'
      }
    ];
  }, [analyticsData]);

  const fetchAllProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = getUserData();
      
      console.log("userData:", userData);
      console.log("vendorId:", userData?.vendorId);
      
      if (!userData?.vendorId) {
        setError("Vendor ID not found");
        setProducts([]);
        setFilteredProducts([]);
        setIsLoading(false);
        return;
      }

      const response = await getAllProductsByVendorId(userData.vendorId);
      
      console.log("Full response:", response);
      console.log("Response data:", response?.data);
      
      if (response?.data && Array.isArray(response.data)) {
        setProducts(response.data);
        setFilteredProducts(response.data);
        console.log(`✅ Loaded ${response.data.length} products`);
      } else {
        setProducts([]);
        setFilteredProducts([]);
        console.log("⚠️ No products found or invalid data format");
      }
      
    } catch (err) {
      console.error("❌ Error details:", err);
      
      if (err.response?.status === 204) {
        console.log("ℹ️ 204: No products available for this vendor");
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
        is_active: newStatus
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

      console.log('Product status updated successfully');
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

      console.log('Auction status updated successfully');
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
      console.log('Scheduling auction with data:', auctionData);

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

      console.log('✅ Auction scheduled successfully');
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

      console.log('Product field updated successfully');
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
      const updateData = {
        product_name: productData.name,
        product_description: productData.description,
        category_id: productData.category_id,
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
        is_active: productData.isactive,
        product_status: productData.status,
        auction_status: productData.auctionstatus,
        created_by: getUserData()?.email,
        seller_id: getUserData()?.vendorId,
        auctionstatus: productData.auctionstatus,
        vendor_email: getUserData()?.email,
        vendor_id: getUserData()?.vendorId,
      };

      const result = await updatedata('productForm', editingProduct.product_id, updateData);
      if (!result.success) {
        alert('Failed to update product. Please try again.');
        return false;
      }

      if (productData.imageFiles && productData.imageFiles.length > 0) {
        const filePathPrefix = "https://pub-a9806e1f673d447a94314a6d53e85114.r2.dev";
        const vendorId = getUserData()?.vendorId;
        const uploadPath = `${vendorId}/Products/${editingProduct?.product_id}`;
        
        try {
          const uploadRes = await uploadMultipleFiles(productData.imageFiles, uploadPath);
          
          if (uploadRes.success) {
            const allImagePaths = productData.imageFiles.map((file) => {
              return `${filePathPrefix}/${uploadPath}/${file.name}`;
            }).join(',');
            
            await updatedata('productForm', editingProduct.product_id, { image_path: allImagePaths });
          }
        } catch (uploadError) {
          console.error('Error during image upload:', uploadError);
        }
      }

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
      const productFormData = {
        name: productData.name,
        description: productData.description,
        category_id: productData.category_id,
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
        isactive: true,
        status: productData.status,
        created_by: getUserData()?.email,
        seller_id: getUserData()?.vendorId,
        auctionstatus: productData.auctionstatus,
        vendor_email: getUserData()?.email,
        vendor_id: getUserData()?.vendorId,
        currentBid: null,
        image_path: ''
      };
      
      const result = await insertRecord('productForm', productFormData);
      
      if (!result.success || !result.id) {
        alert('Failed to create product. Please try again.');
        return false;
      }
      
      const productId = result.id;
      const vendorId = getUserData()?.vendorId;
      
      let allImagePaths = '';
      
      if (productData.imageFiles && productData.imageFiles.length > 0) {
        const filePathPrefix = "https://pub-a9806e1f673d447a94314a6d53e85114.r2.dev";
        const uploadPath = `${vendorId}/Products/${productId}`;
        
        try {
          const uploadRes = await uploadMultipleFiles(productData.imageFiles, uploadPath);
          
          if (uploadRes.success) {
            allImagePaths = productData.imageFiles.map((file) => {
              return `${filePathPrefix}/${uploadPath}/${file.name}`;
            }).join(',');

            await updatedata('productForm', productId, { image_path: allImagePaths });
          }
        } catch (uploadError) {
          console.error('Error during image upload:', uploadError);
        }
      } 
      
      if (productData.videoFiles && productData.videoFiles.length > 0) {
        const filePathPrefix = "https://pub-a9806e1f673d447a94314a6d53e85114.r2.dev";
        const uploadPath = `${vendorId}/Products/${productId}/videos`;
        
        try {
          await uploadMultipleFiles(productData.videoFiles, uploadPath);
        } catch (uploadError) {
          console.error('Error during video upload:', uploadError);
        }
      }
      
      await fetchAllProducts();
      setIsUploadModalOpen(false);
      alert('Product added successfully!');
      
      return true;
      
    } catch (error) {
      console.error('Error saving product:', error);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb />
          
          {/* Enhanced Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-blue-600 bg-clip-text text-transparent mb-3">
                  Product Catalog Management
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage product listings, auction controls with powerful analytics
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={fetchAllProducts}
                  className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm font-medium"
                >
                  <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
                <button
                  onClick={handleExport}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 font-medium"
                >
                  <Download size={18} />
                  Export
                </button>
                <button
                  onClick={handleAddProduct}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/30 font-medium"
                >
                  <Plus size={18} />
                  Add Product
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.iconBg} bg-opacity-10`}>
                      <Icon className={stat.iconColor} size={28} />
                    </div>
                    <span className={`flex items-center text-sm font-semibold px-2.5 py-1 rounded-full ${stat.isPositive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                      {stat.isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Auction Status Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                Auction Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analyticsData.auctionStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.auctionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {analyticsData.auctionStatusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                Top Categories
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analyticsData.categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '12px'
                    }} 
                  />
                  <Bar dataKey="count" fill="url(#colorBar)" radius={[10, 10, 0, 0]} />
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Price Range Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                Price Range Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={analyticsData.priceRanges}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="range" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#a855f7" 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Stock Status */}
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-orange-600 to-red-600 rounded-full"></div>
                Stock Status
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analyticsData.stockData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.stockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {analyticsData.stockData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
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