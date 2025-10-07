import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = () => {
  const location = useLocation();
  
  const routeMap = {
    '/vendor-management-dashboard': 'Vendor Management',
    '/product-catalog-management': 'Product Catalog',
    '/order-management-system': 'Order Management',
    '/document-verification-center': 'Document Verification',
    '/login': 'Login'
  };

  const parentRouteMap = {
    '/document-verification-center': {
      parent: '/vendor-management-dashboard',
      parentLabel: 'Vendor Management'
    }
  };

  const currentPath = location?.pathname;
  const currentLabel = routeMap?.[currentPath];
  const parentInfo = parentRouteMap?.[currentPath];

  if (currentPath === '/login') {
    return null;
  }

  const breadcrumbItems = [];

  // Add Dashboard as root
  breadcrumbItems?.push({
    label: 'Dashboard',
    path: '/vendor-management-dashboard',
    isActive: false
  });

  // Add parent if exists
  if (parentInfo) {
    breadcrumbItems?.push({
      label: parentInfo?.parentLabel,
      path: parentInfo?.parent,
      isActive: false
    });
  }

  // Add current page
  if (currentLabel && (!parentInfo || currentPath !== '/vendor-management-dashboard')) {
    breadcrumbItems?.push({
      label: currentLabel,
      path: currentPath,
      isActive: true
    });
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      {breadcrumbItems?.map((item, index) => (
        <React.Fragment key={item?.path}>
          {index > 0 && (
            <Icon name="ChevronRight" size={16} className="text-border" />
          )}
          {item?.isActive ? (
            <span className="text-foreground font-medium">{item?.label}</span>
          ) : (
            <Link
              to={item?.path}
              className="hover:text-foreground transition-colors duration-150"
            >
              {item?.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;