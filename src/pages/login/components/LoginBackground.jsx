import React from 'react';
import Image from '../../../components/AppImage';

const LoginBackground = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1926&q=80"
          alt="Modern office workspace with computers and business documents"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/80"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col justify-center p-12 text-white">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-6">Streamline Your Vendor Management</h2>
          <p className="text-lg mb-8 text-white/90">
            Comprehensive platform for vendor onboarding, product catalog management, and order processing with real-time analytics.
          </p>
          
          {/* Feature Highlights */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">✓</span>
              </div>
              <span className="text-white/90">Automated vendor verification</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">✓</span>
              </div>
              <span className="text-white/90">Real-time auction management</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">✓</span>
              </div>
              <span className="text-white/90">Comprehensive order tracking</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mt-12 pt-8 border-t border-white/20">
            <div>
              <div className="text-2xl font-bold">10,000+</div>
              <div className="text-sm text-white/80">Active Vendors</div>
            </div>
            <div>
              <div className="text-2xl font-bold">500K+</div>
              <div className="text-sm text-white/80">Products Managed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginBackground;