import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import Cookies from 'js-cookie';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Decode JWT token
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  // Get user data
  const getUserData = () => {
    const token = 
      Cookies.get('authToken') || 
      Cookies.get('accessToken') || 
      localStorage.getItem('authToken');

    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        return {
          vendorId: decoded.vendorId || decoded.userId,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
          avatar: decoded.avatar,
        };
      }
    }

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

  const userData = getUserData();

  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: '+1 (555) 123-4567',
    company: 'Sales Bid Vendor',
    role: userData?.role || 'Vendor',
    location: 'New York, USA',
    bio: 'Experienced vendor with 5+ years in e-commerce.',
    website: 'https://example.com',
    linkedin: 'https://linkedin.com/in/example',
    twitter: '@example',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/im.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const updatedUser = {
        ...userData,
        name: formData.name,
        email: formData.email,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!validatePassword()) return;

    setIsSaving(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userData?.name || '',
      email: userData?.email || '',
      phone: '+1 (555) 123-4567',
      company: 'Sales Bid Vendor',
      role: userData?.role || 'Vendor',
      location: 'New York, USA',
      bio: 'Experienced vendor with 5+ years in e-commerce.',
      website: 'https://example.com',
      linkedin: 'https://linkedin.com/in/example',
      twitter: '@example',
    });
    setErrors({});
    setIsEditing(false);
    setImagePreview(null);
    setProfileImage(null);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: 'User' },
    // { id: 'account', label: 'Account', icon: 'Settings' },
    // { id: 'activity', label: 'Activity', icon: 'Activity' },
  ];

  const stats = [
    { label: 'Total Products', value: '156', icon: 'Package', color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Orders', value: '1,234', icon: 'ShoppingCart', color: 'text-green-600 bg-green-50' },
    { label: 'Revenue', value: '45,678', icon: 'IndianRupee', color: 'text-purple-600 bg-purple-50' },
    // { label: 'Rating', value: '4.8/5.0', icon: 'Star', color: 'text-yellow-600 bg-yellow-50' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-xl bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="rounded-lg hover:bg-muted"
              >
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Profile</h1>
                <p className="text-sm text-muted-foreground">Manage your account settings</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-lg"
                  >
                    {isSaving ? (
                      <>
                        <Icon name="Loader" size={16} className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Icon name="Save" size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg"
                >
                  <Icon name="Edit" size={16} className="mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-lg ring-4 ring-background overflow-hidden">
                    {imagePreview || userData?.avatar ? (
                      <img
                        src={imagePreview || userData?.avatar}
                        alt={formData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-4xl">
                        {getInitials(formData.name)}
                      </span>
                    )}
                  </div>
                  
                  {isEditing && (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <Icon name="Camera" size={24} color="white" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </>
                  )}
                  
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-background shadow-lg" />
                </div>

                <div className="mt-6 text-center w-full">
                  <h2 className="text-2xl font-bold text-foreground">{formData.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{formData.email}</p>
                  <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    <Icon name="Shield" size={14} />
                    {formData.role}
                  </div>
                </div>

                <div className="w-full mt-6 space-y-2">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted rounded-xl transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="Lock" size={18} className="text-muted-foreground" />
                      <span className="text-sm font-medium">Change Password</span>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                  </button>
                  
                  {/* Notifications - Commented Out */}
                  {/* <button className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted rounded-xl transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <Icon name="Bell" size={18} className="text-muted-foreground" />
                      <span className="text-sm font-medium">Notifications</span>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                  </button> */}
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="mt-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
              <div className="grid grid-cols-3 gap-3">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                      <Icon name={stat.icon} size={20} />
                    </div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-border">
                <div className="flex overflow-x-auto scrollbar-thin">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap
                        transition-all duration-200 relative
                        ${activeTab === tab.id
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                        }
                      `}
                    >
                      <Icon name={tab.icon} size={18} />
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Personal Info Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Full Name <span className="text-error">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`
                              w-full px-4 py-2.5 border rounded-lg text-sm
                              transition-all duration-200
                              ${errors.name ? 'border-error' : 'border-border'}
                              ${isEditing 
                                ? 'bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                : 'bg-muted/50 cursor-not-allowed'
                              }
                            `}
                          />
                          {errors.name && (
                            <p className="text-error text-xs mt-1">{errors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Email Address <span className="text-error">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`
                              w-full px-4 py-2.5 border rounded-lg text-sm
                              transition-all duration-200
                              ${errors.email ? 'border-error' : 'border-border'}
                              ${isEditing 
                                ? 'bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                : 'bg-muted/50 cursor-not-allowed'
                              }
                            `}
                          />
                          {errors.email && (
                            <p className="text-error text-xs mt-1">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`
                              w-full px-4 py-2.5 border rounded-lg text-sm
                              transition-all duration-200
                              ${errors.phone ? 'border-error' : 'border-border'}
                              ${isEditing 
                                ? 'bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                : 'bg-muted/50 cursor-not-allowed'
                              }
                            `}
                          />
                          {errors.phone && (
                            <p className="text-error text-xs mt-1">{errors.phone}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Company
                          </label>
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`
                              w-full px-4 py-2.5 border border-border rounded-lg text-sm
                              transition-all duration-200
                              ${isEditing 
                                ? 'bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                : 'bg-muted/50 cursor-not-allowed'
                              }
                            `}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`
                              w-full px-4 py-2.5 border border-border rounded-lg text-sm
                              transition-all duration-200
                              ${isEditing 
                                ? 'bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                : 'bg-muted/50 cursor-not-allowed'
                              }
                            `}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Role
                          </label>
                          <input
                            type="text"
                            name="role"
                            value={formData.role}
                            disabled
                            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-muted/50 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows={4}
                          className={`
                            w-full px-4 py-2.5 border border-border rounded-lg text-sm
                            transition-all duration-200 resize-none
                            ${isEditing 
                              ? 'bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                              : 'bg-muted/50 cursor-not-allowed'
                            }
                          `}
                        />
                      </div>
                    </div>

                    {/* <div className="pt-6 border-t border-border">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Social Links</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Website
                          </label>
                          <div className="relative">
                            <Icon name="Globe" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="url"
                              name="website"
                              value={formData.website}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={`
                                w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm
                                transition-all duration-200
                                ${isEditing 
                                  ? 'bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                  : 'bg-muted/50 cursor-not-allowed'
                                }
                              `}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            LinkedIn
                          </label>
                          <div className="relative">
                            <Icon name="Linkedin" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="url"
                              name="linkedin"
                              value={formData.linkedin}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={`
                                w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm
                                transition-all duration-200
                                ${isEditing 
                                  ? 'bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                  : 'bg-muted/50 cursor-not-allowed'
                                }
                              `}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Twitter
                          </label>
                          <div className="relative">
                            <Icon name="Twitter" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="text"
                              name="twitter"
                              value={formData.twitter}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={`
                                w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm
                                transition-all duration-200
                                ${isEditing 
                                  ? 'bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                  : 'bg-muted/50 cursor-not-allowed'
                                }
                              `}
                            />
                          </div>
                        </div>
                      </div>
                    </div> */}
                  </div>
                )}

                {/* Account Tab - Commented Out */}
                {/* {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Account Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/30 rounded-xl border border-border">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Icon name="Lock" size={20} className="text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">Password</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Last changed 3 months ago
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowPasswordModal(true)}
                              className="rounded-lg"
                            >
                              Change
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-xl border border-border">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Icon name="Shield" size={20} className="text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">Two-Factor Authentication</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Add an extra layer of security
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-lg">
                              Enable
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Preferences</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                          <div>
                            <h4 className="font-semibold text-foreground">Email Notifications</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Receive email updates about your account
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                      <h3 className="text-lg font-semibold text-error mb-4">Danger Zone</h3>
                      
                      <div className="p-4 bg-error/5 rounded-xl border border-error/20">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">Delete Account</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Permanently delete your account and all data
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-lg text-error border-error hover:bg-error/10">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )} */}

                {/* Activity Tab - Commented Out */}
                {/* {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                      
                      <div className="space-y-4">
                        {[
                          { action: 'Updated profile picture', time: '2 hours ago', icon: 'User', color: 'text-blue-600 bg-blue-50' },
                          { action: 'Changed password', time: '1 day ago', icon: 'Lock', color: 'text-green-600 bg-green-50' },
                          { action: 'Added new product', time: '3 days ago', icon: 'Package', color: 'text-purple-600 bg-purple-50' },
                          { action: 'Updated account settings', time: '1 week ago', icon: 'Settings', color: 'text-orange-600 bg-orange-50' },
                          { action: 'Logged in from new device', time: '2 weeks ago', icon: 'Smartphone', color: 'text-red-600 bg-red-50' },
                        ].map((activity, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 transition-colors duration-200">
                            <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon name={activity.icon} size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{activity.action}</p>
                              <p className="text-sm text-muted-foreground mt-1">{activity.time}</p>
                            </div>
                            <Icon name="ChevronRight" size={18} className="text-muted-foreground flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" onClick={() => setShowPasswordModal(false)} />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in duration-200">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-foreground">Change Password</h3>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors duration-200"
                  >
                    <Icon name="X" size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`
                      w-full px-4 py-2.5 border rounded-lg text-sm
                      bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                      ${errors.currentPassword ? 'border-error' : 'border-border'}
                    `}
                  />
                  {errors.currentPassword && (
                    <p className="text-error text-xs mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`
                      w-full px-4 py-2.5 border rounded-lg text-sm
                      bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                      ${errors.newPassword ? 'border-error' : 'border-border'}
                    `}
                  />
                  {errors.newPassword && (
                    <p className="text-error text-xs mt-1">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`
                      w-full px-4 py-2.5 border rounded-lg text-sm
                      bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                      ${errors.confirmPassword ? 'border-error' : 'border-border'}
                    `}
                  />
                  {errors.confirmPassword && (
                    <p className="text-error text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-border flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="flex-1 rounded-lg"
                  onClick={handlePasswordUpdate}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Icon name="Loader" size={16} className="animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;