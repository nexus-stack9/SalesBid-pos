import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Icon from '../AppIcon';
import Button from './Button';
import { getAllVendors, getAllProductsByVendorId } from '../../services/posCrud';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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

        // Fetch product count by vendor ID
        if (userData?.vendorId) {
          const productsResponse = await getAllProductsByVendorId(userData.vendorId);
          setProductCount(productsResponse?.data?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
        // Keep default counts of 0 if there's an error
      }
    };

    fetchCounts();
  }, [userData?.vendorId]);

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

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <Link 
          to="/vendor-management-dashboard" 
          className="flex items-center space-x-3"
          onClick={() => isMobile && setIsMobileSidebarOpen(false)}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="Store" size={20} color="white" />
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="text-xl font-semibold text-foreground">Sales Bid</span>
          )}
        </Link>
        {/* {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex"
          >
            <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={18} />
          </Button>
        )} */}
      </div>

      {/* Search */}
      {/* {(!isCollapsed || isMobile) && (
        <div className="p-4 border-b border-border">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            <Icon 
              name="Search" 
              size={16} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
          </form>
        </div>
      )} */}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigationItems?.map((item) => (
          <Link
            key={item?.path}
            to={item?.path}
            onClick={() => isMobile && setIsMobileSidebarOpen(false)}
            className={`relative flex items-center ${
              isCollapsed && !isMobile ? 'justify-center' : 'justify-between'
            } px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
              isActiveRoute(item)
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title={isCollapsed && !isMobile ? item?.label : ''}
          >
            <div className="flex items-center space-x-3">
              <Icon name={item?.icon} size={20} className="flex-shrink-0" />
              {(!isCollapsed || isMobile) && <span>{item?.label}</span>}
            </div>
            {item?.badge > 0 && (!isCollapsed || isMobile) && (
              <span className="bg-error text-error-foreground text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center font-medium">
                {item?.badge}
              </span>
            )}
            {item?.badge > 0 && isCollapsed && !isMobile && (
              <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {item?.badge}
              </span>
            )}
          </Link>
        ))}

        {/* Notifications */}
        {/* <button
          className={`relative flex items-center ${
            isCollapsed && !isMobile ? 'justify-center' : 'justify-between'
          } w-full px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted`}
          title={isCollapsed && !isMobile ? 'Notifications' : ''}
        >
          <div className="flex items-center space-x-3">
            <Icon name="Bell" size={20} className="flex-shrink-0" />
            {(!isCollapsed || isMobile) && <span>Notifications</span>}
          </div>
          {(!isCollapsed || isMobile) && (
            <span className="bg-error text-error-foreground text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center font-medium">
              3
            </span>
          )}
          {isCollapsed && !isMobile && (
            <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              3
            </span>
          )}
        </button> */}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`w-full flex items-center ${
              isCollapsed && !isMobile ? 'justify-center' : 'justify-between'
            } hover:bg-muted`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={16} color="white" />
              </div>
              {(!isCollapsed || isMobile) && (
                <div className="text-left">
                  <p className="text-sm font-medium truncate max-w-[150px]">
                    {userData?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {userData?.email || 'user@example.com'}
                  </p>
                </div>
              )}
            </div>
            {(!isCollapsed || isMobile) && <Icon name="ChevronDown" size={16} />}
          </Button>

          {isProfileOpen && (
            <>
              {/* Backdrop for mobile */}
              <div 
                className="fixed inset-0 z-40 md:hidden" 
                onClick={() => setIsProfileOpen(false)}
              />
              
              <div className={`absolute ${
                isCollapsed && !isMobile ? 'left-full ml-2 bottom-0' : 'left-0 bottom-full mb-2'
              } w-48 bg-popover border border-border rounded-md shadow-dropdown z-50`}>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center space-x-2 text-error"
                  >
                    <Icon name="LogOut" size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 bottom-0 z-30 bg-card border-r border-border transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border h-16">
        <div className="flex items-center justify-between h-full px-4">
          <Link to="/vendor-management-dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Store" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground">Sales Bid</span>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            <Icon name={isMobileSidebarOpen ? "X" : "Menu"} size={24} />
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40 top-16"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <aside className="md:hidden fixed left-0 top-16 bottom-0 w-64 z-50 bg-card border-r border-border transform transition-transform duration-300">
            <SidebarContent isMobile={true} />
          </aside>
        </>
      )}

      {/* Spacer for main content - THIS IS KEY */}
      <div className={`hidden md:block transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`} />
    </>
  );
};

export default Sidebar;