// src/components/ui/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './../ui/Header'; // Same folder

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 min-h-screen transition-all duration-300">
        <div className="p-4 md:p-6 pt-16 md:pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;