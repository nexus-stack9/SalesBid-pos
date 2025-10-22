import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";


import NotFound from "./pages/NotFound";
import LoginPage from "./pages/login";
import VendorManagementDashboard from "./pages/vendor-management-dashboard";
import OrderManagementSystem from "./pages/order-management-system";
import ProductCatalogManagement from "./pages/product-catalog-management";
import LiveViewerPage from "./pages/LiveViewerPage";

const Routes = () => {
  return (
    <BrowserRouter> 
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Public route for live stream viewing */}
          <Route path="/live/:productId" element={<LiveViewerPage />} />

           <Route element={<ProtectedRoute/>}>
          <Route path="/vendor-management-dashboard" element={<VendorManagementDashboard />} />
          <Route path="/order-management-system" element={<OrderManagementSystem />} />
          <Route path="/product-catalog-management" element={<ProductCatalogManagement />} />
         
          </Route>
           <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;