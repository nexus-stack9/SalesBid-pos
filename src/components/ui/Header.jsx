import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Icon from '../AppIcon';
import Button from './Button';
import { getAllVendors, getAllProductsByVendorId } from '../../services/posCrud';

const Sidebar = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [vendorCount, setVendorCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

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
      return null;
    }
  };

  // Get user data from token
  const getUserData = () => {
    const token = 
      Cookies.get('authToken') || 
      Cookies.get('accessToken') || 
      localStorage.getItem('authToken');

    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        const userData = {
          vendorId: decoded.vendorId || decoded.userId,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
          avatar: decoded.avatar,
        };
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
    }

    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  const userData = getUserData();
  const isAdmin = userData?.role?.toLowerCase() === 'salesbidadmin';

  // Fetch counts
  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true);
      try {
        const promises = [];

        // Only fetch vendors if user is admin
        if (isAdmin) {
          promises.push(getAllVendors());
        }

        // Fetch products
        if (userData?.vendorId) {
          promises.push(getAllProductsByVendorId(userData.vendorId));
        } else {
          promises.push(Promise.resolve({ data: [] }));
        }

        const results = await Promise.all(promises);

        if (isAdmin) {
          setVendorCount(results[0]?.data?.length || 0);
          setProductCount(results[1]?.data?.length || 0);
        } else {
          setProductCount(results[0]?.data?.length || 0);
        }
      } catch (error) {
        // Error handling - counts will remain at 0
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [userData?.vendorId, isAdmin]);

  // Define all navigation items
  const allNavigationItems = [
    {
      label: 'Dashboard',
      path: '/vendor-analytics',
      icon: 'LayoutDashboard',
      subPaths: ['/document-verification-center'],
      adminOnly: false,
    },
    {
      label: 'Vendors',
      path: '/vendor-management-dashboard',
      icon: 'Users',
      badge: vendorCount,
      subPaths: ['/document-verification-center'],
      adminOnly: true, // Only visible to admin
    },
    {
      label: 'Products',
      path: '/product-catalog-management',
      icon: 'Package',
      badge: productCount,
      adminOnly: false,
    },
    {
      label: 'Orders',
      path: '/order-management-system',
      icon: 'ShoppingCart',
      badge: 8,
      adminOnly: false,
    },
  ];

  // Filter navigation items based on user role
  const navigationItems = allNavigationItems.filter(item => {
    if (item.adminOnly) {
      return isAdmin;
    }
    return true;
  });

  const isActiveRoute = (item) => {
    return (
      location?.pathname === item?.path ||
      (item?.subPaths && item?.subPaths?.includes(location?.pathname))
    );
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');

    // Clear all cookies
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.startsWith('auth') || name.startsWith('refresh')) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      }
    }

    setIsProfileOpen(false);
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full bg-card">
      {/* Logo Section */}
      <div className="flex items-center justify-between p-5 lg:p-6 border-b border-border/50">
        <Link
          to="/vendor-analytics"
          className="flex items-center space-x-3 group"
          onClick={() => isMobile && setIsMobileSidebarOpen(false)}
        >
          <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
            <Icon name="Store" size={22} color="white" />
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground tracking-tight">
              Sales Bid
            </span>
            <span className="text-xs text-muted-foreground">
              Vendor Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {navigationItems?.map((item) => {
          const isActive = isActiveRoute(item);
          
          return (
            <Link
              key={item?.path}
              to={item?.path}
              onClick={() => isMobile && setIsMobileSidebarOpen(false)}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`
                relative flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-sm font-medium 
                transition-all duration-200 group overflow-hidden
                ${
                  isActive
                    ? 'text-primary bg-primary/10 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}

              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`
                  flex-shrink-0 transition-transform duration-200
                  ${hoveredItem === item.path ? 'scale-110' : 'scale-100'}
                `}>
                  <Icon 
                    name={item?.icon} 
                    size={20} 
                    className={isActive ? 'text-primary' : ''}
                  />
                </div>
                <span className="truncate">{item?.label}</span>
              </div>

              {/* Badge */}
              {item?.badge > 0 && (
                <span className="bg-primary/10 text-primary text-xs rounded-full min-w-[22px] h-5.5 px-2 flex items-center justify-center font-semibold border border-primary/20">
                  {item?.badge > 99 ? '99+' : item?.badge}
                </span>
              )}

              {/* Hover effect */}
              <div className={`
                absolute inset-0 bg-gradient-to-r from-transparent via-muted/30 to-transparent
                transform -translate-x-full group-hover:translate-x-full transition-transform duration-700
              `} />
            </Link>
          );
        })}

        {/* Divider */}
        <div className="pt-4">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-border/50 bg-muted/20">
        <div className="relative" ref={isMobile ? null : profileRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`
              w-full flex items-center justify-between gap-3 hover:bg-muted/70 rounded-xl p-3
              transition-all duration-200
              ${isProfileOpen ? 'bg-muted/70' : ''}
            `}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl flex items-center justify-center shadow-md ring-2 ring-background">
                  {userData?.avatar ? (
                    <img 
                      src={userData.avatar} 
                      alt={userData.name} 
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {getInitials(userData?.name)}
                    </span>
                  )}
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
              </div>

              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {userData?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate capitalize">
                  {userData?.role || 'Vendor'}
                </p>
              </div>
            </div>

            <Icon 
              name="ChevronDown" 
              size={16} 
              className={`text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
                isProfileOpen ? 'rotate-180' : ''
              }`}
            />
          </Button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <>
              {/* Mobile backdrop */}
              {isMobile && (
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileOpen(false)}
                />
              )}
              
              <div 
                className={`
                  absolute left-0 right-0 bottom-full mb-2 z-50
                  bg-popover border border-border rounded-xl shadow-2xl
                  animate-in fade-in slide-in-from-bottom-2 duration-200
                `}
              >
                <div className="p-2">
                  {/* Profile link */}
                  <Link
                    to="/profile"
                    onClick={() => {
                      setIsProfileOpen(false);
                      isMobile && setIsMobileSidebarOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors duration-150"
                  >
                    <Icon name="User" size={16} className="text-muted-foreground" />
                    <span>View Profile</span>
                  </Link>

                  {/* Settings link */}
                  {/* <Link
                    to="/settings"
                    onClick={() => {
                      setIsProfileOpen(false);
                      isMobile && setIsMobileSidebarOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors duration-150"
                  >
                    <Icon name="Settings" size={16} className="text-muted-foreground" />
                    <span>Settings</span>
                  </Link> */}

                  <div className="h-px bg-border my-2" />

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-error hover:bg-error/10 rounded-lg transition-colors duration-150"
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
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-30 w-64 bg-card/95 backdrop-blur-xl border-r border-border/50">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border/50 h-16 shadow-sm">
        <div className="flex items-center justify-between h-full px-4">
          <Link 
            to="/vendor-analytics" 
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
              <Icon name="Store" size={20} color="white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground tracking-tight">
                Sales Bid
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="rounded-lg hover:bg-muted"
            >
              <Icon 
                name={isMobileSidebarOpen ? 'X' : 'Menu'} 
                size={24} 
              />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`
          lg:hidden fixed top-16 left-0 bottom-0 w-80 max-w-[85vw] z-50
          bg-card border-r border-border/50 shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent isMobile={true} />
      </aside>

      {/* Spacer for desktop */}
      <div className="hidden lg:block w-64" />

      {/* Spacer for mobile */}
      <div className="lg:hidden h-16" />
    </>
  );
};

export default Sidebar;