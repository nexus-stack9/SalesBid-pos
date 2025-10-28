// src/components/ui/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './../ui/Header'; // Same folder

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 pt-16 md:pt-0 min-h-screen">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;