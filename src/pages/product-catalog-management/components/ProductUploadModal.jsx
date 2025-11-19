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
    subcategory_id: '',
    brand_name: '',
    vendor_id: '',
    starting_price: '',
    retail_value: '',
    auction_start: '',
    auction_end: '',
    location: '',
    shipping: '',
    quantity: '',
    quantity_unit: 'units',
    condition: '',
    tags: [],
    listing_type: 'auction', // 'auction', 'direct_buy', 'both'
    sale_price: '',
    weight: '',
    height: '',
    length: '',
    breadth: '',
    // Shipping fields
    product_location_pin: '',
    product_city: '',
    product_state: '',
    gross_weight: '',
    num_boxes: '',
    packaging_type: '',
    // Box dimensions
    box_height: '',
    box_length: '',
    box_breadth: '',
    trending: false,
    isactive: true,
    seller_declaration: false
  });
  
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [manifest, setManifest] = useState(null);
  const [existingManifest, setExistingManifest] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [dragActiveVideo, setDragActiveVideo] = useState(false);
  const [dragActiveDoc, setDragActiveDoc] = useState(false);
  const [dragActiveManifest, setDragActiveManifest] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [imageErrors, setImageErrors] = useState([]);
  const [videoErrors, setVideoErrors] = useState([]);
  const [documentErrors, setDocumentErrors] = useState([]);
  const [manifestErrors, setManifestErrors] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  const steps = [
    { id: 0, name: 'Product Info', icon: 'Package' },
    { id: 1, name: 'Pricing & Auction', icon: 'IndianRupee' },
    { id: 2, name: 'Shipping & Pickup', icon: 'Truck' },
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

  // Subcategories mapped to main categories
  const subcategoriesMap = {
    1: [ // Electronics
      { value: 101, label: 'Laptops' },
      { value: 102, label: 'Mobile Phones' },
      { value: 103, label: 'Tablets' },
      { value: 104, label: 'Cameras' },
      { value: 105, label: 'Audio & Headphones' },
      { value: 106, label: 'Televisions' },
      { value: 107, label: 'Computer Accessories' },
      { value: 108, label: 'Smart Watches' },
      { value: 109, label: 'Gaming Consoles' },
      { value: 110, label: 'Other Electronics' }
    ],
    2: [ // Fashion
      { value: 201, label: 'Men\'s Clothing' },
      { value: 202, label: 'Women\'s Clothing' },
      { value: 203, label: 'Kids Clothing' },
      { value: 204, label: 'Footwear' },
      { value: 205, label: 'Watches' },
      { value: 206, label: 'Bags & Luggage' },
      { value: 207, label: 'Jewelry' },
      { value: 208, label: 'Sunglasses' },
      { value: 209, label: 'Accessories' },
      { value: 210, label: 'Other Fashion' }
    ],
    3: [ // Home & Garden
      { value: 301, label: 'Furniture' },
      { value: 302, label: 'Kitchen Appliances' },
      { value: 303, label: 'Home Decor' },
      { value: 304, label: 'Bedding & Bath' },
      { value: 305, label: 'Garden Tools' },
      { value: 306, label: 'Lighting' },
      { value: 307, label: 'Storage & Organization' },
      { value: 308, label: 'Cleaning Supplies' },
      { value: 309, label: 'Plants & Seeds' },
      { value: 310, label: 'Other Home & Garden' }
    ],
    4: [ // Sports & Outdoors
      { value: 401, label: 'Fitness Equipment' },
      { value: 402, label: 'Cycling' },
      { value: 403, label: 'Camping & Hiking' },
      { value: 404, label: 'Team Sports' },
      { value: 405, label: 'Water Sports' },
      { value: 406, label: 'Winter Sports' },
      { value: 407, label: 'Golf' },
      { value: 408, label: 'Tennis & Badminton' },
      { value: 409, label: 'Sportswear' },
      { value: 410, label: 'Other Sports' }
    ],
    5: [ // Books
      { value: 501, label: 'Fiction' },
      { value: 502, label: 'Non-Fiction' },
      { value: 503, label: 'Academic & Professional' },
      { value: 504, label: 'Children\'s Books' },
      { value: 505, label: 'Comics & Graphic Novels' },
      { value: 506, label: 'Magazines' },
      { value: 507, label: 'eBooks' },
      { value: 508, label: 'Audiobooks' },
      { value: 509, label: 'Rare & Collectible' },
      { value: 510, label: 'Other Books' }
    ],
    6: [ // Automotive
      { value: 601, label: 'Car Accessories' },
      { value: 602, label: 'Motorcycle Accessories' },
      { value: 603, label: 'Car Electronics' },
      { value: 604, label: 'Tires & Wheels' },
      { value: 605, label: 'Car Care' },
      { value: 606, label: 'Tools & Equipment' },
      { value: 607, label: 'Replacement Parts' },
      { value: 608, label: 'Interior Accessories' },
      { value: 609, label: 'Exterior Accessories' },
      { value: 610, label: 'Other Automotive' }
    ]
  };

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

  const quantityUnits = [
    { value: 'units', label: 'Units' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'bags', label: 'Bags' },
    { value: 'pallets', label: 'Pallets' },
    { value: 'plates', label: 'Plates' },
    { value: 'truckloads', label: 'Truckloads' },
    { value: 'sets', label: 'Sets' }
  ];

  const listingTypes = [
    { value: 'auction', label: 'Auction' },
    { value: 'direct_buy', label: 'Direct Buy' },
    { value: 'both', label: 'Both' }
  ];

  const packagingTypes = [
    { value: 'loose', label: 'Loose' },
    { value: 'box', label: 'Box' },
    { value: 'bag', label: 'Bag' },
    { value: 'crate', label: 'Crate' },
    { value: 'drum', label: 'Drum' },
    { value: 'bale', label: 'Bale' },
    { value: 'pallet', label: 'Pallet' },
    { value: 'plate', label: 'Plate' },
    { value: 'truckload', label: 'Truckload' },
    { value: 'other', label: 'Other' }
  ];

  // Get available subcategories based on selected category
  const getAvailableSubcategories = () => {
    if (!formData.category_id) return [];
    return subcategoriesMap[formData.category_id] || [];
  };

  // PIN code lookup using Indian Postal API
  const lookupPinCode = async (pin) => {
    if (pin && pin.length === 6 && /^\d+$/.test(pin)) {
      setPinLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          return {
            city: postOffice.District || postOffice.Block || '',
            state: postOffice.State || ''
          };
        }
      } catch (error) {
        console.error('PIN lookup error:', error);
        return null;
      } finally {
        setPinLoading(false);
      }
    }
    return null;
  };

  // Helper function to convert date to datetime-local format
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      // Format to YYYY-MM-DDTHH:mm for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Initialize form data when in edit mode
  useEffect(() => {
    if (initialData && isEditMode && isOpen) {
      // Parse tags from string or array
      let tagsArray = [];
      if (initialData.tags) {
        if (typeof initialData.tags === 'string') {
          tagsArray = initialData.tags.split(',').map(t => t.trim()).filter(t => t);
        } else if (Array.isArray(initialData.tags)) {
          tagsArray = initialData.tags;
        }
      }

      // Determine listing type from buy_option
      let listingType = 'auction';
      if (initialData.buy_option === 1) {
        listingType = 'direct_buy';
      } else if (initialData.buy_option === 2) {
        listingType = 'both';
      }

      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        category_id: initialData.category_id || '',
        subcategory_id: initialData.subcategory_id || '',
        brand_name: initialData.brand_name || '',
        vendor_id: initialData.vendor_id || '',
        starting_price: initialData.starting_price || '',
        retail_value: initialData.retail_value || '',
        auction_start: formatDateForInput(initialData.auction_start),
        auction_end: formatDateForInput(initialData.auction_end),
        location: initialData.location || '',
        shipping: initialData.shipping || '',
        quantity: initialData.quantity || '',
        quantity_unit: initialData.quantity_unit || 'units',
        condition: initialData.condition || '',
        tags: tagsArray,
        listing_type: listingType,
        sale_price: initialData.sale_price || '',
        weight: initialData.weight || '',
        height: initialData.height || '',
        length: initialData.length || '',
        breadth: initialData.breadth || '',
        // Shipping fields
        product_location_pin: initialData.product_location_pin || initialData.location || '',
        product_city: initialData.product_city || '',
        product_state: initialData.product_state || '',
        gross_weight: initialData.gross_weight || initialData.weight || '',
        num_boxes: initialData.num_boxes || '',
        packaging_type: initialData.packaging_type || '',
        box_height: initialData.box_height || '',
        box_length: initialData.box_length || '',
        box_breadth: initialData.box_breadth || '',
        trending: initialData.trending || false,
        isactive: initialData.isactive !== undefined ? initialData.isactive : true,
        seller_declaration: false
      });

      // Load existing images from image_path
      if (initialData.image_path) {
        const imagePaths = initialData.image_path.includes(',') 
          ? initialData.image_path.split(',').map(path => path.trim())
          : [initialData.image_path];
        
        const existingImgs = imagePaths.map((path, index) => ({
          id: `existing-${index}-${Date.now()}`,
          preview: path,
          name: `Image ${index + 1}`,
          isExisting: true,
          url: path
        }));
        setExistingImages(existingImgs);
      }

      // Load existing videos from video_path
      if (initialData.video_path) {
        const videoPaths = initialData.video_path.includes(',') 
          ? initialData.video_path.split(',').map(path => path.trim())
          : [initialData.video_path];
        
        const existingVids = videoPaths.map((path, index) => ({
          id: `existing-video-${index}-${Date.now()}`,
          name: `Video ${index + 1}`,
          url: path,
          isExisting: true
        }));
        setExistingVideos(existingVids);
      }

      // Load existing manifest from manifest_url
      if (initialData.manifest_url) {
        const manifestUrl = initialData.manifest_url.includes(',') 
          ? initialData.manifest_url.split(',')[0].trim()
          : initialData.manifest_url.trim();
        
        setExistingManifest({
          id: `existing-manifest-${Date.now()}`,
          name: manifestUrl.split('/').pop() || 'Manifest File',
          url: manifestUrl,
          isExisting: true
        });
      }
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
      subcategory_id: '',
      brand_name: '',
      vendor_id: '',
      starting_price: '',
      retail_value: '',
      auction_start: '',
      auction_end: '',
      location: '',
      shipping: '',
      quantity: '',
      quantity_unit: 'units',
      condition: '',
      tags: [],
      listing_type: 'auction',
      sale_price: '',
      weight: '',
      height: '',
      length: '',
      breadth: '',
      product_location_pin: '',
      product_city: '',
      product_state: '',
      gross_weight: '',
      num_boxes: '',
      packaging_type: '',
      box_height: '',
      box_length: '',
      box_breadth: '',
      trending: false,
      isactive: true,
      seller_declaration: false
    });
    setImages([]);
    setExistingImages([]);
    setVideos([]);
    setExistingVideos([]);
    setDocuments([]);
    setManifest(null);
    setExistingManifest(null);
    setErrors({});
    setUploadProgress({});
    setImageErrors([]);
    setVideoErrors([]);
    setDocumentErrors([]);
    setManifestErrors([]);
    setTagInput('');
    setPinLoading(false);
  };

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasChanges = formData.name || 
        images.length > 0 || 
        existingImages.length > 0 ||
        videos.length > 0 || 
        existingVideos.length > 0 ||
        documents.length > 0 ||
        manifest !== null ||
        existingManifest !== null;
      if (hasChanges && isOpen) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, images, existingImages, videos, existingVideos, documents, manifest, existingManifest, isOpen]);

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

  // Simple input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Reset subcategory when category changes
    if (name === 'category_id') {
      setFormData(prev => ({
        ...prev,
        category_id: value,
        subcategory_id: '' // Reset subcategory when category changes
      }));
    }

    // Handle PIN code lookup
    if (name === 'product_location_pin') {
      // Clear city and state if PIN is being cleared
      if (value.length < 6) {
        setFormData(prev => ({
          ...prev,
          product_city: '',
          product_state: ''
        }));
      }
      // Lookup when 6 digits are entered
      if (value.length === 6 && /^\d+$/.test(value)) {
        lookupPinCode(value).then(result => {
          if (result) {
            setFormData(prev => ({
              ...prev,
              product_city: result.city || '',
              product_state: result.state || ''
            }));
          } else {
            // Clear fields if lookup fails
            setFormData(prev => ({
              ...prev,
              product_city: '',
              product_state: ''
            }));
          }
        });
      }
    }
  };

  // Handle tag input
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
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

  // Manifest drag and drop handlers
  const handleManifestDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveManifest(true);
    } else if (e.type === "dragleave") {
      setDragActiveManifest(false);
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

  const validateManifest = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/pdf'
    ];
    const allowedExtensions = ['.xls', '.xlsx', '.csv', '.pdf'];
    
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: `${file.name}: Please upload only Excel or PDF files (.xls, .xlsx, .csv, .pdf)` };
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
          size: file.size,
          isExisting: false
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

  const handleManifestFile = useCallback((file) => {
    const validation = validateManifest(file);
    
    if (!validation.valid) {
      setManifestErrors([validation.error]);
      setTimeout(() => setManifestErrors([]), 5000);
      return;
    }
    
    const newManifest = {
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size
    };
    
    setManifest(newManifest);
    setExistingManifest(null); // Clear existing manifest when new one is uploaded
    simulateUpload(newManifest.id);
  }, []);

  const handleManifestInput = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleManifestFile(file);
    }
  }, [handleManifestFile]);

  const handleManifestDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveManifest(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleManifestFile(file);
    }
  }, [handleManifestFile]);
  
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
    // Check if it's an existing image
    if (imageId.startsWith('existing-')) {
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } else {
      setImages(prev => prev.filter(img => img.id !== imageId));
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[imageId];
        return newProgress;
      });
    }
  };

  const removeVideo = (videoId) => {
    // Check if it's an existing video
    if (videoId.startsWith('existing-video-')) {
      setExistingVideos(prev => prev.filter(vid => vid.id !== videoId));
    } else {
      setVideos(prev => prev.filter(vid => vid.id !== videoId));
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[videoId];
        return newProgress;
      });
    }
  };

  const removeDocument = (docId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[docId];
      return newProgress;
    });
  };

  const removeManifest = () => {
    if (manifest) {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[manifest.id];
        return newProgress;
      });
    }
    setManifest(null);
    setExistingManifest(null);
  };

  const setMainImage = (imageId) => {
    const allImages = [...existingImages, ...images];
    const targetImage = allImages.find(img => img.id === imageId);
    if (!targetImage) return;

    if (targetImage.isExisting) {
      const otherExisting = existingImages.filter(img => img.id !== imageId);
      setExistingImages([targetImage, ...otherExisting]);
    } else {
      const otherImages = images.filter(img => img.id !== imageId);
      setImages([targetImage, ...otherImages]);
    }
  };

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Product Info
        if (!formData?.name?.trim()) newErrors.name = 'Product name is required';
        if (!formData?.description?.trim()) newErrors.description = 'Description is required';
        if (!formData?.category_id) newErrors.category_id = 'Category is required';
        if (!formData?.condition) newErrors.condition = 'Condition is required';
        if (!formData?.quantity || parseInt(formData?.quantity) <= 0) {
          newErrors.quantity = 'Valid quantity is required';
        }
        break;
        
      case 1: // Pricing & Auction
        if (!formData?.listing_type) {
          newErrors.listing_type = 'Listing type is required';
        }
        if (formData?.listing_type === 'direct_buy' || formData?.listing_type === 'both') {
          if (!formData?.sale_price || parseFloat(formData?.sale_price) <= 0) {
            newErrors.sale_price = 'Buy Now Price is required';
          }
        }
        if (formData?.listing_type === 'auction' || formData?.listing_type === 'both') {
          if (!formData?.starting_price || parseFloat(formData?.starting_price) <= 0) {
            newErrors.starting_price = 'Starting Bid Price is required';
          }
          if (!formData?.auction_start) newErrors.auction_start = 'Auction start date is required';
          if (!formData?.auction_end) newErrors.auction_end = 'Auction end date is required';
          if (formData?.auction_start && formData?.auction_end && 
              new Date(formData.auction_start) >= new Date(formData.auction_end)) {
            newErrors.auction_end = 'End date must be after start date';
          }
        }
        break;
        
      case 2: // Shipping & Pickup
        if (!formData?.product_location_pin?.trim()) {
          newErrors.product_location_pin = 'Product Location (PIN) is required';
        }
        if (!formData?.gross_weight || parseFloat(formData?.gross_weight) <= 0) {
          newErrors.gross_weight = 'Approx. Gross Weight is required';
        }
        if (!formData?.packaging_type) {
          newErrors.packaging_type = 'Packaging Type is required';
        }
        break;
        
      case 3: // Media & Publish
        if ((images?.length === 0 && existingImages?.length === 0)) {
          newErrors.images = 'At least one product image is required';
        }
        if (!formData?.seller_declaration) {
          newErrors.seller_declaration = 'You must confirm the seller declaration';
        }
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
      // Convert listing_type to buy_option
      let buyOption = 0;
      if (formData.listing_type === 'direct_buy') {
        buyOption = 1;
      } else if (formData.listing_type === 'both') {
        buyOption = 2;
      }

      // Map location - use product_location_pin as primary, fallback to location
      const locationValue = formData.product_location_pin || formData.location || '';
      
      const productData = {
        // Basic product info
        name: formData.name || '',
        description: formData.description || '',
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null,
        brand_name: formData.brand_name || '',
        vendor_id: formData.vendor_id ? parseInt(formData.vendor_id) : null,
        condition: formData.condition || '',
        
        // Quantity
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        quantity_unit: formData.quantity_unit || 'units',
        
        // Tags
        tags: Array.isArray(formData.tags) ? formData.tags.join(',') : (formData.tags || ''),
        
        // Pricing
        listing_type: formData.listing_type || 'auction',
        buy_option: buyOption,
        starting_price: formData.starting_price ? parseFloat(formData.starting_price) : null,
        retail_value: formData.retail_value ? parseFloat(formData.retail_value) : null,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        
        // Auction dates (only if auction mode)
        auction_start: (formData.listing_type === 'auction' || formData.listing_type === 'both') 
          ? (formData.auction_start || null) 
          : null,
        auction_end: (formData.listing_type === 'auction' || formData.listing_type === 'both') 
          ? (formData.auction_end || null) 
          : null,
        
        // Location (use product_location_pin as primary)
        location: locationValue,
        product_location_pin: formData.product_location_pin || '',
        product_city: formData.product_city || '',
        product_state: formData.product_state || '',
        
        // Shipping
        shipping: formData.shipping || '',
        gross_weight: formData.gross_weight ? parseFloat(formData.gross_weight) : null,
        num_boxes: formData.num_boxes ? parseInt(formData.num_boxes) : null,
        packaging_type: formData.packaging_type || '',
        
        // Box dimensions
        box_height: formData.box_height ? parseFloat(formData.box_height) : null,
        box_length: formData.box_length ? parseFloat(formData.box_length) : null,
        box_breadth: formData.box_breadth ? parseFloat(formData.box_breadth) : null,
        
        // Legacy dimensions (for backward compatibility)
        weight: formData.gross_weight ? parseFloat(formData.gross_weight) : (formData.weight ? parseFloat(formData.weight) : null),
        height: formData.box_height ? parseFloat(formData.box_height) : (formData.height ? parseFloat(formData.height) : null),
        length: formData.box_length ? parseFloat(formData.box_length) : (formData.length ? parseFloat(formData.length) : null),
        breadth: formData.box_breadth ? parseFloat(formData.box_breadth) : (formData.breadth ? parseFloat(formData.breadth) : null),
        
        // Status flags
        trending: formData.trending || false,
        isactive: formData.isactive !== undefined ? formData.isactive : true,
        seller_declaration: formData.seller_declaration || false,
        status: 'active',
        auctionstatus: 'pending',
        
        // Files
        imageFiles: images?.filter(img => !img.isExisting && img.file).map(img => img.file) || [],
        videoFiles: videos?.map(vid => vid.file).filter(Boolean) || [],
        documentFiles: documents?.map(doc => doc.file).filter(Boolean) || [],
        manifestFile: manifest?.file || null,
        
        // Existing files (for edit mode)
        existingImageUrls: existingImages?.map(img => img.url || img.preview).filter(Boolean) || [],
        existingVideoUrls: existingVideos?.map(vid => vid.url).filter(Boolean) || [],
        existingManifestUrl: existingManifest?.url || null,
        
        // Image previews (for reference)
        imagePreviews: images?.map(img => ({
          preview: img?.preview,
          name: img?.name,
          size: img?.size
        })) || []
      };
      
      await onSave(productData);
    } catch (error) {
      setErrors({ submit: `Failed to ${isEditMode ? 'update' : 'save'} product. Please try again.` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    const hasChanges = formData.name || 
      images.length > 0 || 
      existingImages.length > 0 ||
      videos.length > 0 || 
      existingVideos.length > 0 ||
      documents.length > 0 ||
      manifest !== null ||
      existingManifest !== null;
    if (hasChanges && !isSaving) {
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
  const allImages = [...existingImages, ...images];
  const allVideos = [...existingVideos, ...videos];
  const currentManifest = manifest || existingManifest;
  const isAuctionMode = formData.listing_type === 'auction' || formData.listing_type === 'both';
  const requiresBuyNowPrice = formData.listing_type === 'direct_buy' || formData.listing_type === 'both';
  const availableSubcategories = getAvailableSubcategories();

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Subcategory
                  </label>
                  <select
                    name="subcategory_id"
                    value={formData?.subcategory_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    disabled={isSaving || !formData.category_id}
                  >
                    <option value="">
                      {formData.category_id ? 'Select subcategory' : 'Select category first'}
                    </option>
                    {availableSubcategories?.map(subcat => (
                      <option key={subcat?.value} value={subcat?.value}>{subcat?.label}</option>
                    ))}
                  </select>
                  {errors?.subcategory_id && (
                    <p className="text-sm text-error mt-1">{errors?.subcategory_id}</p>
                  )}
                </div>
                <Input
                  label="Brand Name"
                  name="brand_name"
                  value={formData?.brand_name}
                  onChange={handleInputChange}
                  placeholder="Enter brand name (optional)"
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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Quantity <span className="text-error">*</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      name="quantity"
                      type="number"
                      min="1"
                      value={formData?.quantity}
                      onChange={handleInputChange}
                      error={errors?.quantity}
                      placeholder="1"
                      disabled={isSaving}
                      className="flex-1"
                    />
                    <select
                      name="quantity_unit"
                      value={formData?.quantity_unit}
                      onChange={handleInputChange}
                      className="px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      disabled={isSaving}
                    >
                      {quantityUnits?.map(unit => (
                        <option key={unit?.value} value={unit?.value}>{unit?.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-md bg-input min-h-[42px]">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-primary/80"
                        disabled={isSaving}
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="Type and press Enter to add tag"
                    className="flex-1 min-w-[200px] outline-none bg-transparent text-sm"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Pricing & Auction */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Listing Type <span className="text-error">*</span>
                </label>
                <select
                  name="listing_type"
                  value={formData?.listing_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  disabled={isSaving}
                >
                  {listingTypes?.map(type => (
                    <option key={type?.value} value={type?.value}>{type?.label}</option>
                  ))}
                </select>
                {errors?.listing_type && (
                  <p className="text-sm text-error mt-1">{errors?.listing_type}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {requiresBuyNowPrice && (
                  <Input
                    label="Buy Now Price"
                    name="sale_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData?.sale_price}
                    onChange={handleInputChange}
                    error={errors?.sale_price}
                    required={requiresBuyNowPrice}
                    placeholder="0.00"
                    disabled={isSaving}
                  />
                )}
              </div>

              {isAuctionMode && (
                <>
                  <Input
                    label="Starting Bid Price"
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
                </>
              )}

              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-foreground mb-2">Pricing Summary</h3>
                <div className="space-y-2 text-sm">
                  {formData?.retail_value && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retail Value:</span>
                      <span className="font-medium text-foreground">₹{formData?.retail_value}</span>
                    </div>
                  )}
                  {requiresBuyNowPrice && formData?.sale_price && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Buy Now Price:</span>
                      <span className="font-medium text-primary">₹{formData?.sale_price}</span>
                    </div>
                  )}
                  {isAuctionMode && formData?.starting_price && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Starting Bid:</span>
                      <span className="font-medium text-foreground">₹{formData?.starting_price}</span>
                    </div>
                  )}
                  {isAuctionMode && formData?.auction_start && formData?.auction_end && (
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

          {/* Step 2: Shipping & Pickup */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Location (PIN) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="product_location_pin"
                    value={formData?.product_location_pin}
                    onChange={handleInputChange}
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    placeholder="Enter 6-digit PIN code"
                    disabled={isSaving}
                  />
                  {pinLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Icon name="Loader" size={16} className="animate-spin text-primary" />
                    </div>
                  )}
                </div>
                {errors?.product_location_pin && (
                  <p className="text-sm text-error mt-1">{errors?.product_location_pin}</p>
                )}
                {(formData?.product_city || formData?.product_state) && (
                  <p className="text-sm text-success mt-1 flex items-center gap-1">
                    <Icon name="CheckCircle" size={14} />
                    {formData.product_city}{formData.product_city && formData.product_state ? ', ' : ''}{formData.product_state}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="City"
                  name="product_city"
                  value={formData?.product_city}
                  onChange={handleInputChange}
                  placeholder="Auto-filled from PIN"
                  disabled={isSaving || pinLoading}
                />
                <Input
                  label="State"
                  name="product_state"
                  value={formData?.product_state}
                  onChange={handleInputChange}
                  placeholder="Auto-filled from PIN"
                  disabled={isSaving || pinLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Approx. Gross Weight (kg)"
                  name="gross_weight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData?.gross_weight}
                  onChange={handleInputChange}
                  error={errors?.gross_weight}
                  required
                  placeholder="0.00"
                  disabled={isSaving}
                />
                <Input
                  label="No. of Boxes / Cartons"
                  name="num_boxes"
                  type="number"
                  min="0"
                  value={formData?.num_boxes}
                  onChange={handleInputChange}
                  placeholder="0"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Packaging Type <span className="text-error">*</span>
                </label>
                <select
                  name="packaging_type"
                  value={formData?.packaging_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  disabled={isSaving}
                >
                  <option value="">Select packaging type</option>
                  {packagingTypes?.map(pkg => (
                    <option key={pkg?.value} value={pkg?.value}>{pkg?.label}</option>
                  ))}
                </select>
                {errors?.packaging_type && (
                  <p className="text-sm text-error mt-1">{errors?.packaging_type}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Product Dimensions of Single Box</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Height (cm)"
                    name="box_height"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData?.box_height}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    disabled={isSaving}
                  />
                  <Input
                    label="Length (cm)"
                    name="box_length"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData?.box_length}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    disabled={isSaving}
                  />
                  <Input
                    label="Width (cm)"
                    name="box_breadth"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData?.box_breadth}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    disabled={isSaving}
                  />
                </div>
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

                {allImages?.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-muted-foreground">
                        {allImages.length} image{allImages.length !== 1 ? 's' : ''} selected
                        {existingImages.length > 0 && ` (${existingImages.length} existing, ${images.length} new)`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        First image will be the main image
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {allImages?.map((image, index) => (
                        <div key={image?.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-border hover:border-primary/50 transition-colors">
                            <img
                              src={image?.preview || image?.url}
                              alt={image?.name}
                              className="w-full h-full object-cover"
                            />
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                Main
                              </div>
                            )}
                            {image?.isExisting && (
                              <div className="absolute top-2 right-2 bg-success text-success-foreground text-xs px-2 py-1 rounded">
                                Existing
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
                            {image?.size && (
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(image?.size)}
                              </p>
                            )}
                            
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

                {allVideos?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      {allVideos.length} video{allVideos.length !== 1 ? 's' : ''} uploaded
                      {existingVideos.length > 0 && ` (${existingVideos.length} existing, ${videos.length} new)`}
                    </p>
                    {allVideos?.map((video) => (
                      <div key={video?.id} className="flex items-center justify-between p-3 bg-muted rounded-lg relative">
                        <div className="flex items-center space-x-3">
                          <Icon name="Film" size={20} className="text-primary" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-foreground">{video?.name}</p>
                              {video?.isExisting && (
                                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">Existing</span>
                              )}
                            </div>
                            {video?.size && (
                              <p className="text-xs text-muted-foreground">{formatFileSize(video?.size)}</p>
                            )}
                            {video?.url && !video?.file && (
                              <a 
                                href={video?.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                View Video
                              </a>
                            )}
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

              {/* Manifest File Section */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Manifest File (Optional)
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload a manifest file (Excel, CSV, or PDF) for product documentation
                </p>
                
                {manifestErrors.length > 0 && (
                  <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
                    {manifestErrors.map((error, index) => (
                      <p key={index} className="text-sm text-error">{error}</p>
                    ))}
                  </div>
                )}
                
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActiveManifest 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  } ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                  onDragEnter={handleManifestDrag}
                  onDragLeave={handleManifestDrag}
                  onDragOver={handleManifestDrag}
                  onDrop={handleManifestDrop}
                >
                  <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-foreground font-medium mb-2">
                    Drag and drop manifest file here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Support for Excel (.xls, .xlsx), CSV (.csv), or PDF (.pdf) up to 10MB
                  </p>
                  <input
                    type="file"
                    accept=".xls,.xlsx,.csv,.pdf"
                    onChange={handleManifestInput}
                    className="hidden"
                    id="manifest-upload"
                    disabled={isSaving}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('manifest-upload')?.click()}
                    iconName="Plus"
                    iconPosition="left"
                    disabled={isSaving}
                  >
                    Select Manifest File
                  </Button>
                </div>

                {currentManifest && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg relative">
                      <div className="flex items-center space-x-3">
                        <Icon name="FileText" size={20} className="text-primary" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-foreground">{currentManifest?.name}</p>
                            {currentManifest?.isExisting && (
                              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">Existing</span>
                            )}
                          </div>
                          {currentManifest?.size && (
                            <p className="text-xs text-muted-foreground">{formatFileSize(currentManifest?.size)}</p>
                          )}
                          {currentManifest?.url && !currentManifest?.file && (
                            <a 
                              href={currentManifest?.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              View Manifest
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={removeManifest}
                        className="text-error hover:text-error/80"
                        disabled={isSaving}
                      >
                        <Icon name="X" size={16} />
                      </button>
                      {uploadProgress?.[currentManifest?.id] !== undefined && uploadProgress?.[currentManifest?.id] < 100 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress?.[currentManifest?.id]}%` }}
                          />
                        </div>
                      )}
                    </div>
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

              {/* Seller Declaration */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">SELLER DECLARATION (TRUST FACTOR)</h3>
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="seller_declaration"
                    checked={formData?.seller_declaration}
                    onChange={handleInputChange}
                    className="mt-1 rounded border-border disabled:opacity-50"
                    disabled={isSaving}
                  />
                  <span className="text-sm text-foreground">
                    I confirm that all information provided is accurate to the best of my knowledge,
                    and the goods listed belong to me or my company for sale.
                  </span>
                </label>
                {errors?.seller_declaration && (
                  <p className="text-sm text-error mt-2">{errors?.seller_declaration}</p>
                )}
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
                  {formData?.subcategory_id && (
                    <div>
                      <span className="text-muted-foreground">Subcategory:</span>
                      <p className="font-medium text-foreground">
                        {availableSubcategories.find(s => s.value === parseInt(formData?.subcategory_id))?.label || 'Not set'}
                      </p>
                    </div>
                  )}
                  {formData?.brand_name && (
                    <div>
                      <span className="text-muted-foreground">Brand:</span>
                      <p className="font-medium text-foreground">{formData?.brand_name}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Listing Type:</span>
                    <p className="font-medium text-foreground">
                      {listingTypes.find(t => t.value === formData?.listing_type)?.label || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Images:</span>
                    <p className="font-medium text-foreground">{allImages.length} uploaded</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Videos:</span>
                    <p className="font-medium text-foreground">{allVideos.length} uploaded</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Manifest:</span>
                    <p className="font-medium text-foreground">{currentManifest ? 'Uploaded' : 'Not uploaded'}</p>
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