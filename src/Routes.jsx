import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/ui/Layout"; // Update this import path

import NotFound from "./pages/NotFound";
import LoginPage from "./pages/login";
import VendorManagementDashboard from "./pages/vendor-management-dashboard";
import OrderManagementSystem from "./pages/order-management-system";
import ProductCatalogManagement from "./pages/product-catalog-management";
import VendorAnalytics from './pages/vendor-management-dashboard/VendorAnalytics';
import Profile from "./pages/Profile";
import LiveViewerPage from "./pages/LiveViewerPage";


const Routes = () => {
  return (
    <BrowserRouter> 
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Routes - No Sidebar */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

           {/* Public route for live stream viewing */}
          <Route path="/live/:productId" element={<LiveViewerPage />} />

          {/* Protected Routes - With Sidebar Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/vendor-management-dashboard" element={<VendorManagementDashboard />} />
              <Route path="/vendor-analytics" element={<VendorAnalytics />} />
              <Route path="/order-management-system" element={<OrderManagementSystem />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="/product-catalog-management" element={<ProductCatalogManagement />} />
            </Route>
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;