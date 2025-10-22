// pages/LiveStreamPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LiveStreamViewer from '../components/ui/LiveStreamViewer';

/**
 * Live Stream Page Component
 * 
 * This page displays a live stream for a specific product.
 * Access via URL: /live/:productId
 * 
 * Example usage:
 * - Add to your router: <Route path="/live/:productId" element={<LiveStreamPage />} />
 * - Navigate to: /live/123 (where 123 is the product ID)
 */
const LiveStreamPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const handleClose = () => {
    // Navigate back to previous page or home
    navigate(-1);
  };

  if (!productId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Invalid Stream</h2>
          <p className="text-gray-400 mb-4">No product ID provided</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <LiveStreamViewer productId={productId} onClose={handleClose} />;
};

export default LiveStreamPage;
