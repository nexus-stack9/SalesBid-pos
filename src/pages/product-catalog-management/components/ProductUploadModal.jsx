import React, { useState, useCallback, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

/* ─── Design tokens ──────────────────────────────────────────────────── */
const T = {
  accent: '#2563eb',
  accentLight: '#eff6ff',
  accentMid: '#bfdbfe',
  success: '#059669',
  successLight: '#ecfdf5',
  danger: '#dc2626',
  dangerLight: '#fef2f2',
  border: '#e2e8f0',
  borderFocus: '#93c5fd',
  bg: '#f8fafc',
  shadow: '0 1px 3px 0 rgba(0,0,0,.07)',
  shadowLg: '0 20px 60px rgba(0,0,0,.14)',
};

/* ─── Shared input styles ────────────────────────────────────────────── */
const fieldStyle = { width: '100%', padding: '9px 12px', border: `1px solid ${T.border}`, borderRadius: 9, fontSize: 13, color: '#374151', background: '#fff', outline: 'none', fontFamily: 'inherit', transition: 'border-color .15s' };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 };
const errorStyle = { fontSize: 12, color: T.danger, marginTop: 5 };
const selectWrap = { position: 'relative' };
const chevron = (<svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width={14} height={14} viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);

const Field = ({ label, required, error, children }) => (
  <div>
    {label && <label style={labelStyle}>{label}{required && <span style={{ color: T.danger, marginLeft: 3 }}>*</span>}</label>}
    {children}
    {error && <p style={errorStyle}>{error}</p>}
  </div>
);

const SelectField = ({ label, required, error, value, onChange, name, options, disabled, placeholder }) => (
  <Field label={label} required={required} error={error}>
    <div style={selectWrap}>
      <select name={name} value={value} onChange={onChange} disabled={disabled} style={{ ...fieldStyle, appearance: 'none', WebkitAppearance: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .6 : 1 }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {chevron}
    </div>
  </Field>
);

/* ─── DropZone ───────────────────────────────────────────────────────── */
const DropZone = ({ onDrag, onDrop, dragActive, icon, title, hint, inputId, accept, multiple, onChange, disabled, children }) => (
  <div
    onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop}
    style={{ border: `2px dashed ${dragActive ? T.accent : T.border}`, borderRadius: 12, padding: '28px 20px', textAlign: 'center', background: dragActive ? T.accentLight : T.bg, transition: 'all .18s', cursor: 'default', opacity: disabled ? .5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
  >
    <div style={{ width: 44, height: 44, borderRadius: 11, background: dragActive ? T.accentMid : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
      <Icon name={icon} size={22} color={dragActive ? T.accent : '#94a3b8'} />
    </div>
    <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{title}</p>
    <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>{hint}</p>
    <input type="file" id={inputId} accept={accept} multiple={multiple} onChange={onChange} className="hidden" style={{ display: 'none' }} disabled={disabled} />
    <button onClick={() => document.getElementById(inputId)?.click()} disabled={disabled} style={{ padding: '7px 18px', border: `1px solid ${T.border}`, borderRadius: 8, background: '#fff', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
      Browse Files
    </button>
    {children}
  </div>
);

/* ─── FileItem ────────────────────────────────────────────────────────── */
const FileItem = ({ icon, name, size, isExisting, progress, onRemove, href, disabled }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden' }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon name={icon} size={16} color={T.accent} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
        {isExisting && <span style={{ fontSize: 10, fontWeight: 700, background: T.successLight, color: T.success, padding: '1px 7px', borderRadius: 20 }}>Existing</span>}
      </div>
      {size > 0 && <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{(size / 1024 / 1024).toFixed(2)} MB</p>}
      {href && <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: T.accent, textDecoration: 'none' }}>View file ↗</a>}
    </div>
    <button onClick={onRemove} disabled={disabled} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, display: 'flex', flexShrink: 0 }}>
      <Icon name="X" size={15} />
    </button>
    {progress !== undefined && progress < 100 && (
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#e2e8f0', borderRadius: 0 }}>
        <div style={{ height: '100%', background: T.accent, width: `${progress}%`, borderRadius: 0, transition: 'width .2s' }} />
      </div>
    )}
  </div>
);

/* ════════════════════════════════════════════════════════════════════════
   MAIN MODAL
════════════════════════════════════════════════════════════════════════ */
const ProductUploadModal = ({ isOpen, onClose, onSave, initialData = null, isEditMode = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ name: '', description: '', category_id: '', subcategory_id: '', brand_name: '', vendor_id: '', starting_price: '', retail_value: '', auction_start: '', auction_end: '', location: '', shipping: '', quantity: '', quantity_unit: 'units', condition: '', tags: [], listing_type: 'auction', sale_price: '', weight: '', height: '', length: '', breadth: '', product_location_pin: '', product_city: '', product_state: '', gross_weight: '', num_boxes: '', packaging_type: '', box_height: '', box_length: '', box_breadth: '', trending: false, isactive: true, seller_declaration: false });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [manifest, setManifest] = useState(null);
  const [existingManifest, setExistingManifest] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [dragActiveVideo, setDragActiveVideo] = useState(false);
  const [dragActiveManifest, setDragActiveManifest] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  const STEPS = [
    { id: 0, name: 'Product Info', icon: 'Package' },
    { id: 1, name: 'Pricing', icon: 'IndianRupee' },
    { id: 2, name: 'Shipping', icon: 'Truck' },
    { id: 3, name: 'Media', icon: 'Image' },
  ];

  const CATEGORIES = [{ value: 1, label: 'Electronics' }, { value: 2, label: 'Fashion' }, { value: 3, label: 'Home & Garden' }, { value: 4, label: 'Sports & Outdoors' }, { value: 5, label: 'Books' }, { value: 6, label: 'Automotive' }];
  const SUBCATEGORIES_MAP = {
    1: [{ value: 101, label: 'Laptops' }, { value: 102, label: 'Mobile Phones' }, { value: 103, label: 'Tablets' }, { value: 104, label: 'Cameras' }, { value: 105, label: 'Audio & Headphones' }, { value: 106, label: 'Televisions' }, { value: 107, label: 'Computer Accessories' }, { value: 108, label: 'Smart Watches' }, { value: 109, label: 'Gaming Consoles' }, { value: 110, label: 'Other Electronics' }],
    2: [{ value: 201, label: "Men's Clothing" }, { value: 202, label: "Women's Clothing" }, { value: 203, label: 'Kids Clothing' }, { value: 204, label: 'Footwear' }, { value: 205, label: 'Watches' }, { value: 206, label: 'Bags & Luggage' }, { value: 207, label: 'Jewelry' }, { value: 208, label: 'Sunglasses' }, { value: 209, label: 'Accessories' }, { value: 210, label: 'Other Fashion' }],
    3: [{ value: 301, label: 'Furniture' }, { value: 302, label: 'Kitchen Appliances' }, { value: 303, label: 'Home Decor' }, { value: 304, label: 'Bedding & Bath' }, { value: 305, label: 'Garden Tools' }, { value: 306, label: 'Lighting' }, { value: 307, label: 'Storage & Organization' }, { value: 308, label: 'Cleaning Supplies' }, { value: 309, label: 'Plants & Seeds' }, { value: 310, label: 'Other Home & Garden' }],
    4: [{ value: 401, label: 'Fitness Equipment' }, { value: 402, label: 'Cycling' }, { value: 403, label: 'Camping & Hiking' }, { value: 404, label: 'Team Sports' }, { value: 405, label: 'Water Sports' }, { value: 406, label: 'Winter Sports' }, { value: 407, label: 'Golf' }, { value: 408, label: 'Tennis & Badminton' }, { value: 409, label: 'Sportswear' }, { value: 410, label: 'Other Sports' }],
    5: [{ value: 501, label: 'Fiction' }, { value: 502, label: 'Non-Fiction' }, { value: 503, label: 'Academic & Professional' }, { value: 504, label: "Children's Books" }, { value: 505, label: 'Comics & Graphic Novels' }, { value: 506, label: 'Magazines' }, { value: 507, label: 'eBooks' }, { value: 508, label: 'Audiobooks' }, { value: 509, label: 'Rare & Collectible' }, { value: 510, label: 'Other Books' }],
    6: [{ value: 601, label: 'Car Accessories' }, { value: 602, label: 'Motorcycle Accessories' }, { value: 603, label: 'Car Electronics' }, { value: 604, label: 'Tires & Wheels' }, { value: 605, label: 'Car Care' }, { value: 606, label: 'Tools & Equipment' }, { value: 607, label: 'Replacement Parts' }, { value: 608, label: 'Interior Accessories' }, { value: 609, label: 'Exterior Accessories' }, { value: 610, label: 'Other Automotive' }],
  };
  const CONDITIONS = [{ value: 'new', label: 'New' }, { value: 'like_new', label: 'Like New' }, { value: 'very_good', label: 'Very Good' }, { value: 'good', label: 'Good' }, { value: 'acceptable', label: 'Acceptable' }];
  const QTY_UNITS = [{ value: 'units', label: 'Units' }, { value: 'boxes', label: 'Boxes' }, { value: 'bags', label: 'Bags' }, { value: 'pallets', label: 'Pallets' }, { value: 'plates', label: 'Plates' }, { value: 'truckloads', label: 'Truckloads' }, { value: 'sets', label: 'Sets' }];
  const LISTING_TYPES = [{ value: 'auction', label: 'Auction Only' }, { value: 'direct_buy', label: 'Direct Buy' }, { value: 'both', label: 'Auction + Direct Buy' }];
  const PACKAGING_TYPES = [{ value: 'loose', label: 'Loose' }, { value: 'box', label: 'Box' }, { value: 'bag', label: 'Bag' }, { value: 'crate', label: 'Crate' }, { value: 'drum', label: 'Drum' }, { value: 'bale', label: 'Bale' }, { value: 'pallet', label: 'Pallet' }, { value: 'plate', label: 'Plate' }, { value: 'truckload', label: 'Truckload' }, { value: 'other', label: 'Other' }];

  const availableSubcategories = SUBCATEGORIES_MAP[formData.category_id] || [];
  const isAuctionMode = formData.listing_type === 'auction' || formData.listing_type === 'both';
  const requiresBuyNow = formData.listing_type === 'direct_buy' || formData.listing_type === 'both';
  const allImages = [...existingImages, ...images];
  const allVideos = [...existingVideos, ...videos];
  const currentManifest = manifest || existingManifest;

  /* ── helpers ─────────────────────────────────────────────────────── */
  const fmtDate = (ds) => {
    if (!ds) return '';
    try { const d = new Date(ds); if (isNaN(d)) return ''; return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; } catch { return ''; }
  };

  const lookupPin = async (pin) => {
    if (pin.length !== 6 || !/^\d+$/.test(pin)) return;
    setPinLoading(true);
    try {
      const r = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const d = await r.json();
      if (d?.[0]?.Status === 'Success' && d[0].PostOffice?.length > 0) {
        const po = d[0].PostOffice[0];
        setFormData(prev => ({ ...prev, product_city: po.District || po.Block || '', product_state: po.State || '' }));
      } else { setFormData(prev => ({ ...prev, product_city: '', product_state: '' })); }
    } catch {} finally { setPinLoading(false); }
  };

  const simulateUpload = (id) => {
    let prog = 0;
    const t = setInterval(() => {
      prog += Math.random() * 30;
      if (prog >= 100) { prog = 100; clearInterval(t); }
      setUploadProgress(prev => ({ ...prev, [id]: prog }));
    }, 200);
  };

  /* ── init edit ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (initialData && isEditMode && isOpen) {
      let tagsArr = [];
      if (initialData.tags) {
        tagsArr = typeof initialData.tags === 'string' ? initialData.tags.split(',').map(t => t.trim()).filter(Boolean) : (Array.isArray(initialData.tags) ? initialData.tags : []);
      }
      const buyOption = initialData.buy_option;
      const listingType = buyOption === 1 ? 'direct_buy' : buyOption === 2 ? 'both' : 'auction';
      setFormData({ name: initialData.name||'', description: initialData.description||'', category_id: initialData.category_id||'', subcategory_id: initialData.subcategory_id||'', brand_name: initialData.brand_name||'', vendor_id: initialData.vendor_id||'', starting_price: initialData.starting_price||'', retail_value: initialData.retail_value||'', auction_start: fmtDate(initialData.auction_start), auction_end: fmtDate(initialData.auction_end), location: initialData.location||'', shipping: initialData.shipping||'', quantity: initialData.quantity||'', quantity_unit: initialData.quantity_unit||'units', condition: initialData.condition||'', tags: tagsArr, listing_type: listingType, sale_price: initialData.sale_price||'', weight: initialData.weight||'', height: initialData.height||'', length: initialData.length||'', breadth: initialData.breadth||'', product_location_pin: initialData.product_location_pin||initialData.location||'', product_city: initialData.product_city||'', product_state: initialData.product_state||'', gross_weight: initialData.gross_weight||initialData.weight||'', num_boxes: initialData.num_boxes||'', packaging_type: initialData.packaging_type||'', box_height: initialData.box_height||'', box_length: initialData.box_length||'', box_breadth: initialData.box_breadth||'', trending: initialData.trending||false, isactive: initialData.isactive!==undefined?initialData.isactive:true, seller_declaration: false });
      if (initialData.image_path) { const paths = initialData.image_path.includes(',') ? initialData.image_path.split(',').map(p=>p.trim()) : [initialData.image_path]; setExistingImages(paths.map((p,i) => ({ id: `existing-${i}-${Date.now()}`, preview: p, name: `Image ${i+1}`, isExisting: true, url: p }))); }
      if (initialData.video_path) { const paths = initialData.video_path.includes(',') ? initialData.video_path.split(',').map(p=>p.trim()) : [initialData.video_path]; setExistingVideos(paths.map((p,i) => ({ id: `existing-video-${i}-${Date.now()}`, name: `Video ${i+1}`, url: p, isExisting: true }))); }
      if (initialData.manifest_url) { const mu = initialData.manifest_url.includes(',') ? initialData.manifest_url.split(',')[0].trim() : initialData.manifest_url.trim(); setExistingManifest({ id: `existing-manifest-${Date.now()}`, name: mu.split('/').pop()||'Manifest File', url: mu, isExisting: true }); }
    } else if (!isOpen) { resetForm(); }
  }, [initialData, isEditMode, isOpen]);

  useEffect(() => {
    const h = e => { if (e.key === 'Escape' && isOpen) handleClose(); };
    if (isOpen) { document.addEventListener('keydown', h); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const resetForm = () => {
    setCurrentStep(0); setFormData({ name:'', description:'', category_id:'', subcategory_id:'', brand_name:'', vendor_id:'', starting_price:'', retail_value:'', auction_start:'', auction_end:'', location:'', shipping:'', quantity:'', quantity_unit:'units', condition:'', tags:[], listing_type:'auction', sale_price:'', weight:'', height:'', length:'', breadth:'', product_location_pin:'', product_city:'', product_state:'', gross_weight:'', num_boxes:'', packaging_type:'', box_height:'', box_length:'', box_breadth:'', trending:false, isactive:true, seller_declaration:false }); setImages([]); setExistingImages([]); setVideos([]); setExistingVideos([]); setDocuments([]); setManifest(null); setExistingManifest(null); setErrors({}); setUploadProgress({}); setTagInput(''); setPinLoading(false);
  };

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'category_id') { setFormData(prev => ({ ...prev, category_id: value, subcategory_id: '' })); return; }
    if (name === 'product_location_pin') {
      setFormData(prev => ({ ...prev, product_location_pin: value }));
      if (value.length < 6) setFormData(prev => ({ ...prev, product_city: '', product_state: '' }));
      if (value.length === 6) lookupPin(value);
      return;
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  /* ── file handlers ────────────────────────────────────────────────── */
  const handleDrag = useCallback((e, setter) => { e.preventDefault(); e.stopPropagation(); setter(e.type === 'dragenter' || e.type === 'dragover'); }, []);

  const addImages = (files) => {
    files.filter(f => ['image/jpeg','image/png','image/gif','image/webp'].includes(f.type) && f.size <= 10*1024*1024).forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => { const img = { id: Date.now()+Math.random(), file: f, preview: ev.target.result, name: f.name, size: f.size, isExisting: false }; setImages(prev => [...prev, img]); simulateUpload(img.id); };
      reader.readAsDataURL(f);
    });
  };
  const addVideos = (files) => { files.filter(f => ['video/mp4','video/mpeg','video/quicktime','video/webm'].includes(f.type) && f.size <= 100*1024*1024).forEach(f => { const v = { id: Date.now()+Math.random(), file: f, name: f.name, size: f.size }; setVideos(prev => [...prev, v]); simulateUpload(v.id); }); };
  const addManifest = useCallback(f => { const exts = ['.xls','.xlsx','.csv','.pdf']; if (!exts.some(e => f.name.toLowerCase().endsWith(e))) return; const m = { id: Date.now()+Math.random(), file: f, name: f.name, size: f.size }; setManifest(m); setExistingManifest(null); simulateUpload(m.id); }, []);

  const removeImage = id => id.startsWith('existing-') ? setExistingImages(p => p.filter(i => i.id !== id)) : setImages(p => p.filter(i => i.id !== id));
  const removeVideo = id => id.startsWith('existing-video-') ? setExistingVideos(p => p.filter(v => v.id !== id)) : setVideos(p => p.filter(v => v.id !== id));

  /* ── validation ───────────────────────────────────────────────────── */
  const validateStep = (step) => {
    const e = {};
    if (step === 0) {
      if (!formData.name?.trim()) e.name = 'Product name is required';
      if (!formData.description?.trim()) e.description = 'Description is required';
      if (!formData.category_id) e.category_id = 'Category is required';
      if (!formData.condition) e.condition = 'Condition is required';
      if (!formData.quantity || parseInt(formData.quantity) <= 0) e.quantity = 'Valid quantity is required';
    } else if (step === 1) {
      if (requiresBuyNow && (!formData.sale_price || parseFloat(formData.sale_price) <= 0)) e.sale_price = 'Buy Now Price is required';
      if (isAuctionMode) {
        if (!formData.starting_price || parseFloat(formData.starting_price) <= 0) e.starting_price = 'Starting bid price is required';
        if (!formData.auction_start) e.auction_start = 'Auction start date is required';
        if (!formData.auction_end) e.auction_end = 'Auction end date is required';
        if (formData.auction_start && formData.auction_end && new Date(formData.auction_start) >= new Date(formData.auction_end)) e.auction_end = 'End date must be after start date';
      }
    } else if (step === 2) {
      if (!formData.product_location_pin?.trim()) e.product_location_pin = 'PIN code is required';
      if (!formData.gross_weight || parseFloat(formData.gross_weight) <= 0) e.gross_weight = 'Gross weight is required';
      if (!formData.packaging_type) e.packaging_type = 'Packaging type is required';
    } else if (step === 3) {
      if (allImages.length === 0) e.images = 'At least one product image is required';
      if (!formData.seller_declaration) e.seller_declaration = 'You must confirm the seller declaration';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep(currentStep)) setCurrentStep(p => Math.min(p + 1, STEPS.length - 1)); };
  const handlePrev = () => setCurrentStep(p => Math.max(p - 1, 0));

  const handleSave = async () => {
    let valid = true;
    for (let i = 0; i < STEPS.length; i++) { if (!validateStep(i)) { setCurrentStep(i); valid = false; break; } }
    if (!valid) return;
    setIsSaving(true);
    try {
      const buyOption = formData.listing_type === 'direct_buy' ? 1 : formData.listing_type === 'both' ? 2 : 0;
      await onSave({
        ...formData, buy_option: buyOption,
        tags: Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        starting_price: formData.starting_price ? parseFloat(formData.starting_price) : null,
        retail_value: formData.retail_value ? parseFloat(formData.retail_value) : null,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        gross_weight: formData.gross_weight ? parseFloat(formData.gross_weight) : null,
        imageFiles: images.filter(i => !i.isExisting && i.file).map(i => i.file),
        videoFiles: videos.map(v => v.file).filter(Boolean),
        manifestFile: manifest?.file || null,
        existingImageUrls: existingImages.map(i => i.url || i.preview).filter(Boolean),
        existingVideoUrls: existingVideos.map(v => v.url).filter(Boolean),
        existingManifestUrl: existingManifest?.url || null,
        status: 'active', auctionstatus: 'pending',
      });
    } catch { setErrors({ submit: `Failed to ${isEditMode ? 'update' : 'save'} product.` }); }
    finally { setIsSaving(false); }
  };

  const handleClose = () => {
    if ((formData.name || images.length || existingImages.length) && !isSaving) {
      if (!window.confirm('You have unsaved changes. Close anyway?')) return;
    }
    resetForm(); onClose();
  };

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div onClick={e => { if (e.target === e.currentTarget) handleClose(); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 18, maxWidth: 820, width: '100%', maxHeight: '94vh', display: 'flex', flexDirection: 'column', boxShadow: T.shadowLg, overflow: 'hidden' }}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div style={{ padding: '20px 24px 0', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].name}</p>
            </div>
            <button onClick={handleClose} disabled={isSaving} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
              <Icon name="X" size={16} />
            </button>
          </div>

          {/* Progress */}
          <div style={{ height: 3, background: '#f1f5f9', borderRadius: 4, marginBottom: 0, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: T.accent, width: `${progress}%`, transition: 'width .3s ease' }} />
          </div>

          {/* Step tabs */}
          <div style={{ display: 'flex', marginTop: 0 }}>
            {STEPS.map((step, i) => (
              <button key={step.id} onClick={() => i < currentStep && setCurrentStep(i)} disabled={i > currentStep} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 8px', border: 'none', borderBottom: currentStep === i ? `2px solid ${T.accent}` : '2px solid transparent', background: 'none', cursor: i <= currentStep ? 'pointer' : 'not-allowed', color: currentStep === i ? T.accent : i < currentStep ? T.success : '#94a3b8', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', transition: 'all .15s' }}>
                <Icon name={i < currentStep ? 'CheckCircle' : step.icon} size={16} />
                <span style={{ display: 'none', '@media (min-width: 480px)': { display: 'inline' } }}>{step.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Error banner ───────────────────────────────────────────── */}
        {errors.submit && (
          <div style={{ margin: '0 24px', marginTop: 16, padding: '10px 14px', background: T.dangerLight, border: `1px solid #fecaca`, borderRadius: 9 }}>
            <p style={{ fontSize: 13, color: T.danger, margin: 0 }}>{errors.submit}</p>
          </div>
        )}

        {/* ── Content ────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px' }}>

          {/* ── STEP 0: Product Info ── */}
          {currentStep === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Product Name" required error={errors.name}>
                    <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter product name" disabled={isSaving} style={{ ...fieldStyle, borderColor: errors.name ? T.danger : T.border }} />
                  </Field>
                </div>
                <SelectField label="Category" required error={errors.category_id} name="category_id" value={formData.category_id} onChange={handleInputChange} options={CATEGORIES} disabled={isSaving} placeholder="Select category" />
                <SelectField label="Subcategory" name="subcategory_id" value={formData.subcategory_id} onChange={handleInputChange} options={availableSubcategories} disabled={isSaving || !formData.category_id} placeholder={formData.category_id ? 'Select subcategory' : 'Select category first'} />
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Description" required error={errors.description}>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Detailed product description…" disabled={isSaving} style={{ ...fieldStyle, resize: 'vertical', borderColor: errors.description ? T.danger : T.border }} />
                  </Field>
                </div>
                <Field label="Brand Name">
                  <input name="brand_name" value={formData.brand_name} onChange={handleInputChange} placeholder="Optional" disabled={isSaving} style={fieldStyle} />
                </Field>
                <SelectField label="Condition" required error={errors.condition} name="condition" value={formData.condition} onChange={handleInputChange} options={CONDITIONS} disabled={isSaving} placeholder="Select condition" />
              </div>

              {/* Quantity */}
              <Field label="Quantity" required error={errors.quantity}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input name="quantity" type="number" min="1" value={formData.quantity} onChange={handleInputChange} placeholder="1" disabled={isSaving} style={{ ...fieldStyle, flex: 1, borderColor: errors.quantity ? T.danger : T.border }} />
                  <div style={{ ...selectWrap, width: 130, flexShrink: 0 }}>
                    <select name="quantity_unit" value={formData.quantity_unit} onChange={handleInputChange} disabled={isSaving} style={{ ...fieldStyle, appearance: 'none', WebkitAppearance: 'none' }}>
                      {QTY_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                    {chevron}
                  </div>
                </div>
              </Field>

              {/* Tags */}
              <Field label="Tags">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px', border: `1px solid ${T.border}`, borderRadius: 9, background: '#fff', minHeight: 42 }}>
                  {formData.tags.map((tag, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: T.accentLight, color: T.accent, borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {tag}
                      <button type="button" onClick={() => setFormData(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.accent, padding: 0, display: 'flex' }}><Icon name="X" size={12} /></button>
                    </span>
                  ))}
                  <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); if (!formData.tags.includes(tagInput.trim())) setFormData(p => ({ ...p, tags: [...p.tags, tagInput.trim()] })); setTagInput(''); } }} placeholder="Type + Enter" disabled={isSaving} style={{ flex: 1, minWidth: 140, border: 'none', outline: 'none', fontSize: 13, fontFamily: 'inherit', background: 'transparent' }} />
                </div>
              </Field>
            </div>
          )}

          {/* ── STEP 1: Pricing ── */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <SelectField label="Listing Type" required name="listing_type" value={formData.listing_type} onChange={handleInputChange} options={LISTING_TYPES} disabled={isSaving} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Retail Value (₹)">
                  <input name="retail_value" type="number" step=".01" min="0" value={formData.retail_value} onChange={handleInputChange} placeholder="0.00" disabled={isSaving} style={fieldStyle} />
                </Field>
                {requiresBuyNow && (
                  <Field label="Buy Now Price (₹)" required error={errors.sale_price}>
                    <input name="sale_price" type="number" step=".01" min="0" value={formData.sale_price} onChange={handleInputChange} placeholder="0.00" disabled={isSaving} style={{ ...fieldStyle, borderColor: errors.sale_price ? T.danger : T.border }} />
                  </Field>
                )}
              </div>
              {isAuctionMode && (
                <>
                  <Field label="Starting Bid Price (₹)" required error={errors.starting_price}>
                    <input name="starting_price" type="number" step=".01" min="0" value={formData.starting_price} onChange={handleInputChange} placeholder="0.00" disabled={isSaving} style={{ ...fieldStyle, borderColor: errors.starting_price ? T.danger : T.border }} />
                  </Field>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label="Auction Start" required error={errors.auction_start}>
                      <input type="datetime-local" name="auction_start" value={formData.auction_start} onChange={handleInputChange} min={new Date().toISOString().slice(0, 16)} disabled={isSaving} style={{ ...fieldStyle, borderColor: errors.auction_start ? T.danger : T.border }} />
                    </Field>
                    <Field label="Auction End" required error={errors.auction_end}>
                      <input type="datetime-local" name="auction_end" value={formData.auction_end} onChange={handleInputChange} min={formData.auction_start || new Date().toISOString().slice(0, 16)} disabled={isSaving} style={{ ...fieldStyle, borderColor: errors.auction_end ? T.danger : T.border }} />
                    </Field>
                  </div>
                </>
              )}
              {/* Summary */}
              <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, padding: '16px 18px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Pricing Summary</p>
                {[
                  formData.retail_value && { label: 'Retail Value', val: `₹${formData.retail_value}` },
                  requiresBuyNow && formData.sale_price && { label: 'Buy Now Price', val: `₹${formData.sale_price}` },
                  isAuctionMode && formData.starting_price && { label: 'Starting Bid', val: `₹${formData.starting_price}` },
                  isAuctionMode && formData.auction_start && formData.auction_end && { label: 'Duration', val: `${Math.max(0, Math.ceil((new Date(formData.auction_end) - new Date(formData.auction_start)) / (1000*60*60*24)))} days` },
                ].filter(Boolean).map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: '#64748b' }}>{row.label}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Shipping ── */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field label="Product PIN Code" required error={errors.product_location_pin}>
                <div style={{ position: 'relative' }}>
                  <input name="product_location_pin" type="text" value={formData.product_location_pin} onChange={handleInputChange} maxLength={6} inputMode="numeric" placeholder="6-digit PIN code" disabled={isSaving} style={{ ...fieldStyle, borderColor: errors.product_location_pin ? T.danger : T.border }} />
                  {pinLoading && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}><Icon name="Loader" size={15} color={T.accent} style={{ animation: 'spin .9s linear infinite' }} /></div>}
                </div>
                {(formData.product_city || formData.product_state) && <p style={{ fontSize: 12, color: T.success, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}><Icon name="CheckCircle" size={13} />{formData.product_city}{formData.product_city && formData.product_state ? ', ' : ''}{formData.product_state}</p>}
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="City"><input name="product_city" value={formData.product_city} onChange={handleInputChange} placeholder="Auto-filled from PIN" disabled={isSaving || pinLoading} style={fieldStyle} /></Field>
                <Field label="State"><input name="product_state" value={formData.product_state} onChange={handleInputChange} placeholder="Auto-filled from PIN" disabled={isSaving || pinLoading} style={fieldStyle} /></Field>
                <Field label="Gross Weight (kg)" required error={errors.gross_weight}><input name="gross_weight" type="number" step=".01" min="0" value={formData.gross_weight} onChange={handleInputChange} placeholder="0.00" disabled={isSaving} style={{ ...fieldStyle, borderColor: errors.gross_weight ? T.danger : T.border }} /></Field>
                <Field label="No. of Boxes"><input name="num_boxes" type="number" min="0" value={formData.num_boxes} onChange={handleInputChange} placeholder="0" disabled={isSaving} style={fieldStyle} /></Field>
              </div>
              <SelectField label="Packaging Type" required error={errors.packaging_type} name="packaging_type" value={formData.packaging_type} onChange={handleInputChange} options={PACKAGING_TYPES} disabled={isSaving} placeholder="Select packaging" />
              <div>
                <p style={{ ...labelStyle, marginBottom: 10 }}>Box Dimensions (cm)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[['box_height', 'Height'], ['box_length', 'Length'], ['box_breadth', 'Width']].map(([n, l]) => (
                    <Field key={n} label={l}><input name={n} type="number" step=".01" min="0" value={formData[n]} onChange={handleInputChange} placeholder="0.00" disabled={isSaving} style={fieldStyle} /></Field>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Media ── */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* Images */}
              <div>
                <Field label="Product Images" required error={errors.images}>
                  <DropZone onDrag={e => handleDrag(e, setDragActive)} onDrop={e => { handleDrag(e, setDragActive); if (e.dataTransfer.files) addImages(Array.from(e.dataTransfer.files)); }} dragActive={dragActive} icon="Upload" title="Drag & drop images here" hint="JPG, PNG, GIF, WebP • Max 10MB each" inputId="img-upload" accept="image/*" multiple onChange={e => addImages(Array.from(e.target.files))} disabled={isSaving} />
                </Field>
                {allImages.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>{allImages.length} image{allImages.length !== 1 ? 's' : ''} — first is main image</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                      {allImages.map((img, i) => (
                        <div key={img.id} style={{ position: 'relative' }}>
                          <div style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: `2px solid ${i === 0 ? T.accent : T.border}`, background: '#f1f5f9' }}>
                            <img src={img.preview || img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: T.accent, color: '#fff', fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '2px 0' }}>MAIN</div>}
                          </div>
                          <button onClick={() => removeImage(img.id)} disabled={isSaving} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="X" size={11} />
                          </button>
                          {img.isExisting && <span style={{ position: 'absolute', top: 4, left: 4, fontSize: 9, fontWeight: 700, background: T.successLight, color: T.success, padding: '1px 5px', borderRadius: 10 }}>Saved</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Videos */}
              <div>
                <p style={{ ...labelStyle, marginBottom: 8 }}>Product Videos <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>(Optional)</span></p>
                <DropZone onDrag={e => handleDrag(e, setDragActiveVideo)} onDrop={e => { handleDrag(e, setDragActiveVideo); if (e.dataTransfer.files) addVideos(Array.from(e.dataTransfer.files)); }} dragActive={dragActiveVideo} icon="Film" title="Drag & drop videos here" hint="MP4, MOV, WebM • Max 100MB each" inputId="vid-upload" accept="video/*" multiple onChange={e => addVideos(Array.from(e.target.files))} disabled={isSaving} />
                {allVideos.length > 0 && <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>{allVideos.map(v => <FileItem key={v.id} icon="Film" name={v.name} size={v.size || 0} isExisting={v.isExisting} progress={uploadProgress[v.id]} href={v.url && !v.file ? v.url : undefined} onRemove={() => removeVideo(v.id)} disabled={isSaving} />)}</div>}
              </div>

              {/* Manifest */}
              <div>
                <p style={{ ...labelStyle, marginBottom: 8 }}>Manifest File <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>(Optional)</span></p>
                <DropZone onDrag={e => handleDrag(e, setDragActiveManifest)} onDrop={e => { e.preventDefault(); e.stopPropagation(); setDragActiveManifest(false); if (e.dataTransfer.files?.[0]) addManifest(e.dataTransfer.files[0]); }} dragActive={false} icon="FileText" title="Drag & drop manifest here" hint="Excel, CSV, or PDF • Max 10MB" inputId="manifest-upload" accept=".xls,.xlsx,.csv,.pdf" multiple={false} onChange={e => { if (e.target.files?.[0]) addManifest(e.target.files[0]); }} disabled={isSaving} />
                {currentManifest && <div style={{ marginTop: 10 }}><FileItem icon="FileText" name={currentManifest.name} size={currentManifest.size || 0} isExisting={currentManifest.isExisting} progress={uploadProgress[currentManifest.id]} href={currentManifest.url && !currentManifest.file ? currentManifest.url : undefined} onRemove={() => { setManifest(null); setExistingManifest(null); }} disabled={isSaving} /></div>}
              </div>

              {/* Flags */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[['trending', 'Mark as Trending'], ['isactive', 'Active']].map(([name, label]) => (
                  <label key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" name={name} checked={formData[name]} onChange={handleInputChange} disabled={isSaving} style={{ width: 16, height: 16, accentColor: T.accent }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</span>
                  </label>
                ))}
              </div>

              {/* Seller declaration */}
              <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, padding: '16px 18px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Seller Declaration</p>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" name="seller_declaration" checked={formData.seller_declaration} onChange={handleInputChange} disabled={isSaving} style={{ width: 16, height: 16, marginTop: 2, accentColor: T.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>I confirm that all information provided is accurate to the best of my knowledge, and the goods listed belong to me or my company for sale.</span>
                </label>
                {errors.seller_declaration && <p style={errorStyle}>{errors.seller_declaration}</p>}
              </div>

              {/* Summary */}
              <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 11, padding: '16px 18px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Product Summary</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    ['Product', formData.name || '—'],
                    ['Category', CATEGORIES.find(c => c.value === parseInt(formData.category_id))?.label || '—'],
                    ['Listing', LISTING_TYPES.find(t => t.value === formData.listing_type)?.label || '—'],
                    ['Images', `${allImages.length} uploaded`],
                    ['Videos', `${allVideos.length} uploaded`],
                    ['Manifest', currentManifest ? 'Uploaded' : 'None'],
                    ['Status', formData.isactive ? 'Active' : 'Inactive'],
                  ].map(([k, v]) => (
                    <div key={k}><p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>{k}</p><p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>{v}</p></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
          <button onClick={currentStep === 0 ? handleClose : handlePrev} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: `1px solid ${T.border}`, borderRadius: 9, background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon name={currentStep === 0 ? 'X' : 'ArrowLeft'} size={15} />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>
          {currentStep < STEPS.length - 1 ? (
            <button onClick={handleNext} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', border: 'none', borderRadius: 9, background: T.accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 2px 8px ${T.accent}44` }}>
              Next <Icon name="ArrowRight" size={15} />
            </button>
          ) : (
            <button onClick={handleSave} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 22px', border: 'none', borderRadius: 9, background: isSaving ? '#94a3b8' : T.accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: isSaving ? 'none' : `0 2px 8px ${T.accent}44` }}>
              <Icon name={isSaving ? 'Loader' : 'Save'} size={15} />
              {isSaving ? 'Saving…' : isEditMode ? 'Update Product' : 'Publish Product'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductUploadModal;