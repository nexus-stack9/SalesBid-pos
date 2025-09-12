
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductEdit from "./pages/ProductEdit";
import ProductCreate from "./pages/ProductCreate";
import Stores from "./pages/Stores";
import StoreEdit from "./pages/StoreEdit";
import StoreCreate from "./pages/StoreCreate";
import Orders from "./pages/Orders";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Customers from "./pages/Customers";
import CustomerEdit from "./pages/CustomerEdit";
import CustomerCreate from "./pages/CustomerCreate";
import Coupons from "./pages/Coupons";
import CouponEdit from "./pages/CouponEdit";
import CouponCreate from "./pages/CouponCreate";
import Vendors from "./pages/Vendors";
import VendorEdit from "./pages/VendorEdit";
import VendorCreate from "./pages/VendorCreate";
import VendorApprovals from "./pages/VendorApprovals";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              
              {/* Vendor routes - Admin only */}
              <Route element={<ProtectedRoute adminOnly />}>
                {/* <Route path="/vendors" element={<Vendors />} /> */}
                <Route path="/vendors/create" element={<VendorCreate />} />
                <Route path="/vendors/:id" element={<VendorEdit />} />
                <Route path="/vendors" element={<VendorApprovals />} />
              </Route>
              
              <Route path="/products" element={<Products />} />
              <Route path="/products/create" element={<ProductCreate />} />
              <Route path="products/edit/:id" element={<ProductEdit />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/stores/create" element={<StoreCreate />} />
              <Route path="/stores/:id" element={<StoreEdit />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/create" element={<Orders />} />
              <Route path="/orders/:id" element={<Orders />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/create" element={<CustomerCreate />} />
              <Route path="/customers/:id" element={<CustomerEdit />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/coupons/create" element={<CouponCreate />} />
              <Route path="/coupons/:id" element={<CouponEdit />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Other routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
