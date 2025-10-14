import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Icon from '../AppIcon';
import Button from './Button';
import { getAllVendors } from '../../services/posCrud';
import { getAllProducts } from '../../services/crudService';

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorCount, setVendorCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Decode JWT token and get user data
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  // Get user data from token and cache it
  const getUserData = () => {
    const token = Cookies.get('authToken') || Cookies.get('accessToken') || localStorage.getItem('authToken');

    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        const userData = {
          vendorId: decoded.vendorId || decoded.userId,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name
        };

        // Cache user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));

        return userData;
      }
    }

    // Try to get from cached data
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

  // Fetch counts on component mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch vendor count
        const vendorsResponse = await getAllVendors();
        setVendorCount(vendorsResponse?.data?.length || 0);

        // Fetch product count
        const productsResponse = await getAllProducts('productForm');
        setProductCount(productsResponse?.data?.length || 0);
      } catch (error) {
        console.error('Error fetching counts:', error);
        // Keep default counts of 0 if there's an error
      }
    };

    fetchCounts();
  }, []);

  const navigationItems = [
    {
      label: 'Vendors',
      path: '/vendor-management-dashboard',
      icon: 'Users',
      badge: vendorCount,
      subPaths: ['/document-verification-center']
    },
    {
      label: 'Products',
      path: '/product-catalog-management',
      icon: 'Package',
      badge: productCount
    },
    {
      label: 'Orders',
      path: '/order-management-system',
      icon: 'ShoppingCart',
      badge: 8
    }
  ];

  const isActiveRoute = (item) => {
    return location?.pathname === item?.path || 
           (item?.subPaths && item?.subPaths?.includes(location?.pathname));
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim()) {
      console.log('Searching for:', searchQuery);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    console.log('Logging out...');

    // Clear the token from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');

    // Clear cookies if used
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.startsWith('auth') || name.startsWith('refresh')) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    }

    // Close profile menu
    setIsProfileOpen(false);

    // Redirect to login page
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <Link to="/vendor-management-dashboard" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Icon name="Store" size={20} color="white" />
          </div>
          <span className="text-xl font-semibold text-foreground">Sales Bid</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`relative flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                isActiveRoute(item)
                  ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={item?.icon} size={18} />
              <span>{item?.label}</span>
              {item?.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {item?.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  placeholder="Search vendors, products, orders..."
                  className="w-64 px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-2"
                >
                  <Icon name="X" size={16} />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex"
              >
                <Icon name="Search" size={18} />
              </Button>
            )}
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative hidden md:flex">
            <Icon name="Bell" size={18} />
            <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              3
            </span>
          </Button>

          {/* User Profile */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <span className="hidden md:block text-sm font-medium">
                {userData?.name || 'User'}
              </span>
              <Icon name="ChevronDown" size={16} />
            </Button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-md shadow-dropdown z-50">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium">
                    {userData?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userData?.email || 'user@example.com'}
                  </p>
                </div>
                <div className="py-1">
                  {/* <button className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2">
                    <Icon name="Settings" size={16} />
                    <span>Settings</span>
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2">
                    <Icon name="HelpCircle" size={16} />
                    <span>Help</span>
                  </button> */}
                  <hr className="my-1 border-border" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2 text-error"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
          </Button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background z-40 border-t border-border">
          <div className="p-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                placeholder="Search..."
                className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" size="sm">
                <Icon name="Search" size={16} />
              </Button>
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute(item)
                      ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon name={item?.icon} size={20} />
                    <span>{item?.label}</span>
                  </div>
                  {item?.badge > 0 && (
                    <span className="bg-error text-error-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                      {item?.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile Notifications */}
            <button className="flex items-center justify-between w-full p-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
              <div className="flex items-center space-x-3">
                <Icon name="Bell" size={20} />
                <span>Notifications</span>
              </div>
              <span className="bg-error text-error-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                3
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;