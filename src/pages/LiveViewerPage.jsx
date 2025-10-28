// Simple Live Stream Viewer using Cloudflare Stream Player
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';

const LiveViewerPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [streamData, setStreamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    if (productId) {
      fetchStreamData();
    }
  }, [productId]);

  const fetchStreamData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/livestream/${productId}`);
      
      if (response.data.success) {
        setStreamData(response.data.data);
      } else {
        setError('Stream not found');
      }
    } catch (err) {
      console.error('Error fetching stream data:', err);
      setError(err.response?.data?.error || 'Failed to load stream');
    } finally {
      setIsLoading(false);
    }
  };

  const copyStreamUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Stream URL copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error || !streamData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <Icon name="AlertCircle" size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Stream Unavailable</h2>
          <p className="text-gray-400 mb-4">{error || 'Stream not found'}</p>
          <Button onClick={() => navigate('/')} className="bg-red-500 hover:bg-red-600">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!streamData.isLive) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <Icon name="VideoOff" size={64} className="text-gray-500 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Stream Offline</h2>
          <p className="text-gray-400 mb-4">This stream is not currently live</p>
          <Button onClick={() => navigate('/')} className="bg-red-500 hover:bg-red-600">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Use the live input ID for the Cloudflare Stream Player
  const streamId = streamData.liveInputId;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-gray-800"
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-xl font-semibold text-white">LIVE</h2>
              <span className="text-sm text-gray-400">{streamData.productName}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyStreamUrl}
            className="text-white hover:bg-gray-800"
          >
            <Icon name="Share2" size={20} className="mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Video Player */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-black rounded-lg overflow-hidden">
          {/* Cloudflare Stream Player */}
          <div className="relative" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={`https://customer-8b22bbe360edacd5c4351c60c8c04b39.cloudflarestream.com/${streamId}/iframe?preload=true&autoplay=true&muted=false`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
            />
          </div>

          {/* Stream Info */}
          <div className="bg-gray-900 p-6">
            <h3 className="text-white text-2xl font-bold mb-2">{streamData.productName}</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {streamData.startingPrice && (
                <div>
                  <p className="text-gray-400 text-sm">Starting Price</p>
                  <p className="text-green-400 text-xl font-semibold">₹{streamData.startingPrice}</p>
                </div>
              )}
              {streamData.currentBid && (
                <div>
                  <p className="text-gray-400 text-sm">Current Bid</p>
                  <p className="text-yellow-400 text-xl font-semibold">₹{streamData.currentBid}</p>
                </div>
              )}
            </div>

            {/* Stream URLs for debugging */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">Stream URLs:</p>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-500">HLS:</span>
                  <a 
                    href={streamData.hlsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 ml-2 break-all"
                  >
                    {streamData.hlsUrl}
                  </a>
                </div>
                <div>
                  <span className="text-gray-500">DASH:</span>
                  <a 
                    href={streamData.dashUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 ml-2 break-all"
                  >
                    {streamData.dashUrl}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveViewerPage;
