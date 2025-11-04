import React, { useState, useCallback, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ProductUploadModal = ({ isOpen, onClose, onSave, initialData = null, isEditMode = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    vendor_id: '',
    starting_price: '',
    retail_value: '',
    auction_start: '',
    auction_end: '',
    location: '',
    shipping: '',
    quantity: '',
    condition: '',
    tags: '',
    buy_option: 0,
    sale_price: '',
    weight: '',
    height: '',
    length: '',
    breadth: '',
    trending: false,
    isactive: true
  });
  
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [dragActiveVideo, setDragActiveVideo] = useState(false);
  const [dragActiveDoc, setDragActiveDoc] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [imageErrors, setImageErrors] = useState([]);
  const [videoErrors, setVideoErrors] = useState([]);
  const [documentErrors, setDocumentErrors] = useState([]);

  const steps = [
    { id: 0, name: 'Product Info', icon: 'Package' },
    { id: 1, name: 'Pricing & Auction', icon: 'IndianRupee' },
    { id: 2, name: 'Shipping & Manifest', icon: 'Truck' },
    { id: 3, name: 'Media & Publish', icon: 'Image' }
  ];

  const categories = [
    { value: 1, label: 'Electronics' },
    { value: 2, label: 'Fashion' },
    { value: 3, label: 'Home & Garden' },
    { value: 4, label: 'Sports & Outdoors' },
    { value: 5, label: 'Books' },
    { value: 6, label: 'Automotive' }
  ];

  const vendors = [
    { value: 1, label: 'TechMart Solutions' },
    { value: 2, label: 'Fashion Hub' },
    { value: 3, label: 'Home Essentials' },
    { value: 4, label: 'Sports World' },
    { value: 5, label: 'Digital Bookstore' }
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'very_good', label: 'Very Good' },
    { value: 'good', label: 'Good' },
    { value: 'acceptable', label: 'Acceptable' }
  ];

  const shippingOptions = [
    { value: 'free', label: 'Free Shipping' },
    { value: 'standard', label: 'Standard Shipping' },
    { value: 'express', label: 'Express Shipping' },
    { value: 'pickup', label: 'Local Pickup Only' }
  ];

  // Initialize form data when in edit mode
  useEffect(() => {
    if (initialData && isEditMode && isOpen) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        category_id: initialData.category_id || '',
        vendor_id: initialData.vendor_id || '',
        starting_price: initialData.starting_price || '',
        retail_value: initialData.retail_value || '',
        auction_start: initialData.auction_start || '',
        auction_end: initialData.auction_end || '',
        location: initialData.location || '',
        shipping: initialData.shipping || '',
        quantity: initialData.quantity || '',
        condition: initialData.condition || '',
        tags: initialData.tags || '',
        buy_option: initialData.buy_option || 0,
        sale_price: initialData.sale_price || '',
        weight: initialData.weight || '',
        height: initialData.height || '',
        length: initialData.length || '',
        breadth: initialData.breadth || '',
        trending: initialData.trending || false,
        isactive: initialData.isactive !== undefined ? initialData.isactive : true
      });
    } else if (!isOpen) {
      resetForm();
    }
  }, [initialData, isEditMode, isOpen]);

  const resetForm = () => {
    setCurrentStep(0);
    setFormData({
      name: '',
      description: '',
      category_id: '',
      vendor_id: '',
      starting_price: '',
      retail_value: '',
      auction_start: '',
      auction_end: '',
      location: '',
      shipping: '',
      quantity: '',
      condition: '',
      tags: '',
      buy_option: 0,
      sale_price: '',
      weight: '',
      height: '',
      length: '',
      breadth: '',
      trending: false,
      isactive: true
    });
    setImages([]);
    setVideos([]);
    setDocuments([]);
    setErrors({});
    setUploadProgress({});
    setImageErrors([]);
    setVideoErrors([]);
    setDocumentErrors([]);
  };

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if ((formData.name || images.length > 0 || videos.length > 0 || documents.length > 0) && isOpen) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, images, videos, documents, isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Simple input change handler - no debouncing needed
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Image drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      handleImageFiles(files);
    }
  }, []);

  // Video drag and drop handlers
  const handleVideoDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveVideo(true);
    } else if (e.type === "dragleave") {
      setDragActiveVideo(false);
    }
  }, []);
  
  const handleVideoDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveVideo(false);
    
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      handleVideoFiles(files);
    }
  }, []);

  // Document drag and drop handlers
  const handleDocDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveDoc(true);
    } else if (e.type === "dragleave") {
      setDragActiveDoc(false);
    }
  }, []);
  
  const handleDocDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveDoc(false);
    
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      handleDocumentFiles(files);
    }
  }, []);
  
  const handleFileInput = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleImageFiles(files);
    }
  };

  const handleVideoInput = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleVideoFiles(files);
    }
  };

  const handleDocumentInput = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleDocumentFiles(files);
    }
  };
  
  const validateImage = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `${file.name}: Please upload only JPG, PNG, GIF, or WebP images` };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: `${file.name}: Image size should not exceed 10MB` };
    }
    
    return { valid: true };
  };

  const validateVideo = (file) => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `${file.name}: Please upload only MP4, MPEG, MOV, or WebM videos` };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: `${file.name}: Video size should not exceed 100MB` };
    }
    
    return { valid: true };
  };

  const validateDocument = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    const allowedExtensions = ['.xls', '.xlsx', '.csv'];
    
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: `${file.name}: Please upload only Excel files (.xls, .xlsx, .csv)` };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: `${file.name}: File size should not exceed 10MB` };
    }
    
    return { valid: true };
  };
  
  const handleImageFiles = (files) => {
    const newErrors = [];
    const validFiles = [];
    
    files.forEach(file => {
      const validation = validateImage(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        newErrors.push(validation.error);
      }
    });
    
    if (newErrors.length > 0) {
      setImageErrors(newErrors);
      setTimeout(() => setImageErrors([]), 5000);
    }
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file,
          preview: e.target.result,
          name: file.name,
          size: file.size
        };
        
        setImages(prev => [...prev, newImage]);
        simulateUpload(newImage.id);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoFiles = (files) => {
    const newErrors = [];
    const validFiles = [];
    
    files.forEach(file => {
      const validation = validateVideo(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        newErrors.push(validation.error);
      }
    });
    
    if (newErrors.length > 0) {
      setVideoErrors(newErrors);
      setTimeout(() => setVideoErrors([]), 5000);
    }
    
    validFiles.forEach(file => {
      const newVideo = {
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size
      };
      
      setVideos(prev => [...prev, newVideo]);
      simulateUpload(newVideo.id);
    });
  };

  const handleDocumentFiles = (files) => {
    const newErrors = [];
    const validFiles = [];
    
    files.forEach(file => {
      const validation = validateDocument(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        newErrors.push(validation.error);
      }
    });
    
    if (newErrors.length > 0) {
      setDocumentErrors(newErrors);
      setTimeout(() => setDocumentErrors([]), 5000);
    }
    
    validFiles.forEach(file => {
      const newDocument = {
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size
      };
      
      setDocuments(prev => [...prev, newDocument]);
      simulateUpload(newDocument.id);
    });
  };
  
  const simulateUpload = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
    }, 200);
  };
  
  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[imageId];
      return newProgress;
    });
  };

  const removeVideo = (videoId) => {
    setVideos(prev => prev.filter(vid => vid.id !== videoId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[videoId];
      return newProgress;
    });
  };

  const removeDocument = (docId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[docId];
      return newProgress;
    });
  };

  const setMainImage = (imageId) => {
    setImages(prev => {
      const targetImage = prev.find(img => img.id === imageId);
      const otherImages = prev.filter(img => img.id !== imageId);
      return targetImage ? [targetImage, ...otherImages] : prev;
    });
  };

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Product Info
        if (!formData?.name?.trim()) newErrors.name = 'Product name is required';
        if (!formData?.description?.trim()) newErrors.description = 'Description is required';
        if (!formData?.category_id) newErrors.category_id = 'Category is required';
        if (!formData?.location?.trim()) newErrors.location = 'Location is required';
        if (!formData?.condition) newErrors.condition = 'Condition is required';
        if (!formData?.quantity || parseInt(formData?.quantity) <= 0) {
          newErrors.quantity = 'Valid quantity is required';
        }
        break;
        
      case 1: // Pricing & Auction
        if (!formData?.starting_price || parseFloat(formData?.starting_price) <= 0) {
          newErrors.starting_price = 'Valid starting price is required';
        }
        if (!formData?.auction_start) newErrors.auction_start = 'Auction start date is required';
        if (!formData?.auction_end) newErrors.auction_end = 'Auction end date is required';
        if (formData?.auction_start && formData?.auction_end && 
            new Date(formData.auction_start) >= new Date(formData.auction_end)) {
          newErrors.auction_end = 'End date must be after start date';
        }
        break;
        
      case 2: // Shipping & Manifest
        if (!formData?.shipping) newErrors.shipping = 'Shipping option is required';
        break;
        
      case 3: // Media & Publish
        if (images?.length === 0) newErrors.images = 'At least one product image is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleStepClick = (stepIndex) => {
    // Allow clicking on any previous step or next step if current is valid
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    } else if (stepIndex === currentStep + 1 && validateStep(currentStep)) {
      setCurrentStep(stepIndex);
    }
  };

  const handleSave = async () => {
    // Validate all steps before saving
    let allValid = true;
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        allValid = false;
        break;
      }
    }

    if (!allValid) return;

    setIsSaving(true);
    try {
      const productData = {
        ...formData,
        category_id: parseInt(formData.category_id),
        vendor_id: parseInt(formData.vendor_id),
        starting_price: parseFloat(formData.starting_price),
        retail_value: formData.retail_value ? parseFloat(formData.retail_value) : null,
        quantity: parseInt(formData.quantity),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        length: formData.length ? parseFloat(formData.length) : null,
        breadth: formData.breadth ? parseFloat(formData.breadth) : null,
        buy_option: parseInt(formData.buy_option),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        
        imageFiles: images?.map(img => img.file),
        videoFiles: videos?.map(vid => vid.file),
        documentFiles: documents?.map(doc => doc.file),
        
        imagePreviews: images?.map(img => ({
          preview: img?.preview,
          name: img?.name,
          size: img?.size
        })),
        
        status: 'active',
        auctionstatus: 'pending'
      };
      
      await onSave(productData);
    } catch (error) {
      setErrors({ submit: `Failed to ${isEditMode ? 'update' : 'save'} product. Please try again.` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if ((formData.name || images.length > 0 || videos.length > 0 || documents.length > 0) && !isSaving) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    
    resetForm();
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  if (!isOpen) return null;

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 id="modal-title" className="text-xl font-semibold text-foreground">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            iconName="X"
            disabled={isSaving}
            aria-label="Close modal"
          />
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Tabs */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                disabled={index > currentStep + 1}
                className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
                  currentStep === index
                    ? 'border-primary text-primary font-medium'
                    : index < currentStep
                    ? 'border-success text-success cursor-pointer hover:text-success/80'
                    : 'border-transparent text-muted-foreground cursor-not-allowed'
                }`}
              >
                <Icon 
                  name={index < currentStep ? 'CheckCircle' : step.icon} 
                  size={20} 
                />
                <span className="hidden sm:inline text-sm">{step.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errors?.submit && (
          <div className="mx-6 mt-4 p-4 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-sm text-error">{errors.submit}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 0: Product Info */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Product Name"
                  name="name"
                  value={formData?.name}
                  onChange={handleInputChange}
                  error={errors?.name}
                  required
                  placeholder="Enter product name"
                  disabled={isSaving}
                />
                <Input
                  label="Location"
                  name="location"
                  value={formData?.location}
                  onChange={handleInputChange}
                  error={errors?.location}
                  required
                  placeholder="Enter product location"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description <span className="text-error">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData?.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Enter detailed product description"
                  disabled={isSaving}
                />
                {errors?.description && (
                  <p className="text-sm text-error mt-1">{errors?.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category <span className="text-error">*</span>
                  </label>
                  <select
                    name="category_id"
                    value={formData?.category_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    disabled={isSaving}
                  >
                    <option value="">Select category</option>
                    {categories?.map(cat => (
                      <option key={cat?.value} value={cat?.value}>{cat?.label}</option>
                    ))}
                  </select>
                  {errors?.category_id && (
                    <p className="text-sm text-error mt-1">{errors?.category_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Condition <span className="text-error">*</span>
                  </label>
                  <select
                    name="condition"
                    value={formData?.condition}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    disabled={isSaving}
                  >
                    <option value="">Select condition</option>
                    {conditions?.map(cond => (
                      <option key={cond?.value} value={cond?.value}>{cond?.label}</option>
                    ))}
                  </select>
                  {errors?.condition && (
                    <p className="text-sm text-error mt-1">{errors?.condition}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData?.quantity}
                  onChange={handleInputChange}
                  error={errors?.quantity}
                  required
                  placeholder="1"
                  disabled={isSaving}
                />
                <Input
                  label="Tags"
                  name="tags"
                  value={formData?.tags}
                  onChange={handleInputChange}
                  placeholder="Enter tags separated by commas"
                  disabled={isSaving}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Product Dimensions (Optional)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label="Weight (kg)"
                    name="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData?.weight}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    disabled={isSaving}
                  />
                  <Input
                    label="Height (cm)"
                    name="height"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData?.height}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    disabled={isSaving}
                  />
                  <Input
                    label="Length (cm)"
                    name="length"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData?.length}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    disabled={isSaving}
                  />
                  <Input
                    label="Width (cm)"
                    name="breadth"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData?.breadth}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Pricing & Auction */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input
                  label="Starting Price"
                  name="starting_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData?.starting_price}
                  onChange={handleInputChange}
                  error={errors?.starting_price}
                  required
                  placeholder="0.00"
                  disabled={isSaving}
                />
                <Input
                  label="Retail Value"
                  name="retail_value"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData?.retail_value}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  disabled={isSaving}
                />
                <Input
                  label="Sale Price"
                  name="sale_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData?.sale_price}
                  onChange={handleInputChange}
                  placeholder="Optional"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Buy Option
                </label>
                <select
                  name="buy_option"
                  value={formData?.buy_option}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  disabled={isSaving}
                >
                  <option value={0}>Auction Only</option>
                  <option value={1}>Buy Now Available</option>
                  <option value={2}>Make Offer Available</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Auction Start <span className="text-error">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="auction_start"
                    value={formData?.auction_start}
                    onChange={handleInputChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    disabled={isSaving}
                  />
                  {errors?.auction_start && (
                    <p className="text-sm text-error mt-1">{errors?.auction_start}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Auction End <span className="text-error">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="auction_end"
                    value={formData?.auction_end}
                    onChange={handleInputChange}
                    min={formData?.auction_start || new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    disabled={isSaving}
                  />
                  {errors?.auction_end && (
                    <p className="text-sm text-error mt-1">{errors?.auction_end}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-foreground mb-2">Pricing Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Starting Bid:</span>
                    <span className="font-medium text-foreground">
                      ₹{formData?.starting_price || '0.00'}
                    </span>
                  </div>
                  {formData?.retail_value && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retail Value:</span>
                      <span className="font-medium text-foreground">₹{formData?.retail_value}</span>
                    </div>
                  )}
                  {formData?.sale_price && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buy Now Price:</span>
                      <span className="font-medium text-primary">₹{formData?.sale_price}</span>
                    </div>
                  )}
                  {formData?.auction_start && formData?.auction_end && (
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">Auction Duration:</span>
                      <span className="font-medium text-foreground">
                        {Math.ceil(
                          (new Date(formData.auction_end) - new Date(formData.auction_start)) / 
                          (1000 * 60 * 60 * 24)
                        )} days
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Shipping & Manifest */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Shipping Option <span className="text-error">*</span>
                </label>
                <select
                  name="shipping"
                  value={formData?.shipping}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  disabled={isSaving}
                >
                  <option value="">Select shipping option</option>
                  {shippingOptions?.map(ship => (
                    <option key={ship?.value} value={ship?.value}>{ship?.label}</option>
                  ))}
                </select>
                {errors?.shipping && (
                  <p className="text-sm text-error mt-1">{errors?.shipping}</p>
                )}
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Icon name="Info" size={16} />
                  Shipping Information
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Free shipping applies to orders over ₹500</li>
                  <li>• Standard shipping: 5-7 business days</li>
                  <li>• Express shipping: 2-3 business days</li>
                  <li>• Local pickup available at specified location</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Manifest / Documents (Optional)
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload Excel files containing product manifest, specifications, or inventory details
                </p>
                
                {documentErrors.length > 0 && (
                  <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
                    {documentErrors.map((error, index) => (
                      <p key={index} className="text-sm text-error">{error}</p>
                    ))}
                  </div>
                )}
                
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActiveDoc 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  } ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                  onDragEnter={handleDocDrag}
                  onDragLeave={handleDocDrag}
                  onDragOver={handleDocDrag}
                  onDrop={handleDocDrop}
                >
                  <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-foreground font-medium mb-2">
                    Drag and drop Excel files here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Support for .xls, .xlsx, .csv up to 10MB each
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                    onChange={handleDocumentInput}
                    className="hidden"
                    id="document-upload"
                    disabled={isSaving}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('document-upload')?.click()}
                    iconName="Plus"
                    iconPosition="left"
                    disabled={isSaving}
                  >
                    Select Files
                  </Button>
                </div>

                {documents?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {documents?.map((doc) => (
                      <div key={doc?.id} className="flex items-center justify-between p-3 bg-muted rounded-lg relative">
                        <div className="flex items-center space-x-3">
                          <Icon name="FileText" size={20} className="text-success" />
                          <div>
                            <p className="text-sm text-foreground">{doc?.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(doc?.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeDocument(doc?.id)}
                          className="text-error hover:text-error/80"
                          disabled={isSaving}
                        >
                          <Icon name="X" size={16} />
                        </button>
                        {uploadProgress?.[doc?.id] !== undefined && uploadProgress?.[doc?.id] < 100 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${uploadProgress?.[doc?.id]}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Media & Publish */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Images <span className="text-error">*</span>
                </label>
                
                {imageErrors.length > 0 && (
                  <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
                    {imageErrors.map((error, index) => (
                      <p key={index} className="text-sm text-error">{error}</p>
                    ))}
                  </div>
                )}
                
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  } ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Icon name="Upload" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-foreground font-medium mb-2">
                    Drag and drop images here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Support for JPG, PNG, GIF, WebP up to 10MB each
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="image-upload"
                    disabled={isSaving}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    iconName="Plus"
                    iconPosition="left"
                    disabled={isSaving}
                  >
                    Select Images
                  </Button>
                </div>
                {errors?.images && (
                  <p className="text-sm text-error mt-1">{errors?.images}</p>
                )}

                {images?.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground">
                        {images.length} image{images.length !== 1 ? 's' : ''} selected
                      </p>
                      <p className="text-xs text-muted-foreground">
                        First image will be the main image
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images?.map((image, index) => (
                        <div key={image?.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-border hover:border-primary/50 transition-colors">
                            <img
                              src={image?.preview}
                              alt={image?.name}
                              className="w-full h-full object-cover"
                            />
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                Main
                              </div>
                            )}
                          </div>
                          
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {index !== 0 && (
                              <button
                                onClick={() => setMainImage(image?.id)}
                                className="w-7 h-7 bg-primary text-primary-foreground rounded flex items-center justify-center hover:bg-primary/90"
                                title="Set as main image"
                                disabled={isSaving}
                              >
                                <Icon name="Star" size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => removeImage(image?.id)}
                              className="w-7 h-7 bg-error text-error-foreground rounded flex items-center justify-center hover:bg-error/90"
                              title="Remove image"
                              disabled={isSaving}
                            >
                              <Icon name="X" size={14} />
                            </button>
                          </div>
                          
                          <div className="mt-2">
                            <p className="text-xs text-foreground truncate" title={image?.name}>
                              {image?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(image?.size)}
                            </p>
                            
                            {uploadProgress?.[image?.id] !== undefined && uploadProgress?.[image?.id] < 100 && (
                              <div className="w-full bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                                <div
                                  className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                                  style={{ width: `${uploadProgress?.[image?.id]}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Videos Section */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Videos (Optional)
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Add videos to showcase your product in action
                </p>
                
                {videoErrors.length > 0 && (
                  <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
                    {videoErrors.map((error, index) => (
                      <p key={index} className="text-sm text-error">{error}</p>
                    ))}
                  </div>
                )}
                
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActiveVideo 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  } ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                  onDragEnter={handleVideoDrag}
                  onDragLeave={handleVideoDrag}
                  onDragOver={handleVideoDrag}
                  onDrop={handleVideoDrop}
                >
                  <Icon name="Film" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-foreground font-medium mb-2">
                    Drag and drop videos here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Support for MP4, MPEG, MOV, WebM up to 100MB each
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleVideoInput}
                    className="hidden"
                    id="video-upload"
                    disabled={isSaving}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('video-upload')?.click()}
                    iconName="Plus"
                    iconPosition="left"
                    disabled={isSaving}
                  >
                    Select Videos
                  </Button>
                </div>

                {videos?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      {videos.length} video{videos.length !== 1 ? 's' : ''} uploaded
                    </p>
                    {videos?.map((video) => (
                      <div key={video?.id} className="flex items-center justify-between p-3 bg-muted rounded-lg relative">
                        <div className="flex items-center space-x-3">
                          <Icon name="Film" size={20} className="text-primary" />
                          <div>
                            <p className="text-sm text-foreground">{video?.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(video?.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeVideo(video?.id)}
                          className="text-error hover:text-error/80"
                          disabled={isSaving}
                        >
                          <Icon name="X" size={16} />
                        </button>
                        {uploadProgress?.[video?.id] !== undefined && uploadProgress?.[video?.id] < 100 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${uploadProgress?.[video?.id]}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="trending"
                    checked={formData?.trending}
                    onChange={handleInputChange}
                    className="rounded border-border disabled:opacity-50"
                    disabled={isSaving}
                  />
                  <span className="text-sm text-foreground">Mark as Trending</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isactive"
                    checked={formData?.isactive}
                    onChange={handleInputChange}
                    className="rounded border-border disabled:opacity-50"
                    disabled={isSaving}
                  />
                  <span className="text-sm text-foreground">Active</span>
                </label>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">Product Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Product:</span>
                    <p className="font-medium text-foreground">{formData?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium text-foreground">
                      {categories.find(c => c.value === parseInt(formData?.category_id))?.label || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Starting Price:</span>
                    <p className="font-medium text-foreground">₹{formData?.starting_price || '0.00'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Shipping:</span>
                    <p className="font-medium text-foreground">
                      {shippingOptions.find(s => s.value === formData?.shipping)?.label || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Images:</span>
                    <p className="font-medium text-foreground">{images.length} uploaded</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Videos:</span>
                    <p className="font-medium text-foreground">{videos.length} uploaded</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Documents:</span>
                    <p className="font-medium text-foreground">{documents.length} uploaded</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium text-foreground">{formData?.isactive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card flex items-center justify-between p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? handleClose : handlePrevious}
            iconName={currentStep === 0 ? "X" : "ArrowLeft"}
            iconPosition="left"
            disabled={isSaving}
          >
            {currentStep === 0 ? 'Cancel' : 'Previous'}
          </Button>
          
          <div className="flex items-center gap-3">
            {currentStep < steps.length - 1 ? (
              <Button
                variant="default"
                onClick={handleNext}
                iconName="ArrowRight"
                iconPosition="right"
                disabled={isSaving}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleSave}
                iconName={isSaving ? "Loader" : "Save"}
                iconPosition="left"
                disabled={isSaving}
                className={isSaving ? 'animate-pulse' : ''}
              >
                {isSaving ? 'Saving...' : (isEditMode ? 'Update Product' : 'Publish Product')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductUploadModal;