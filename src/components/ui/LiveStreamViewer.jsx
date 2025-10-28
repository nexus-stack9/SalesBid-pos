// components/ui/LiveStreamViewer.jsx
import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import axios from 'axios';
import toast from 'react-hot-toast';

const LiveStreamViewer = ({ productId, onClose }) => {
  const [streamData, setStreamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const videoRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    if (productId) {
      fetchStreamData();
    }
  }, [productId]);

  useEffect(() => {
    // Simulate viewer count updates
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchStreamData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/livestream/${productId}`);
      
      if (response.data.success) {
        setStreamData(response.data.data);
        setViewerCount(Math.floor(Math.random() * 50) + 10);
        
        // Initialize video player with HLS
        if (videoRef.current && response.data.data.hlsUrl) {
          initializePlayer(response.data.data.hlsUrl);
        }
      } else {
        setError('Stream not found');
      }
    } catch (err) {
      console.error('Error fetching stream data:', err);
      setError(err.response?.data?.error || 'Failed to load stream');
      toast.error('Failed to load stream');
    } finally {
      setIsLoading(false);
    }
  };

  const initializePlayer = (hlsUrl) => {
    // Check if HLS is natively supported
    if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = hlsUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      // Use HLS.js for browsers that don't support HLS natively
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      });
    } else {
      // Fallback to iframe embed
      console.warn('HLS not supported, using iframe embed');
    }
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      setComments([...comments, {
        id: Date.now(),
        user: 'Viewer',
        message: newComment,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setNewComment('');
    }
  };

  const copyStreamUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Stream URL copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-white text-lg">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center space-y-4 p-8">
          <Icon name="AlertCircle" size={64} className="text-red-500 mx-auto" />
          <h2 className="text-white text-2xl font-bold">Stream Unavailable</h2>
          <p className="text-gray-400">{error}</p>
          <Button onClick={onClose} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!streamData?.isLive) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center space-y-4 p-8">
          <Icon name="VideoOff" size={64} className="text-gray-500 mx-auto" />
          <h2 className="text-white text-2xl font-bold">Stream Offline</h2>
          <p className="text-gray-400">This stream is not currently live</p>
          <Button onClick={onClose} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-gray-800"
              >
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-xl font-semibold text-white">LIVE</h2>
                <span className="flex items-center space-x-1 text-sm text-gray-400">
                  <Icon name="Users" size={16} />
                  <span>{viewerCount} viewers</span>
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyStreamUrl}
              className="text-white hover:bg-gray-800"
            >
              <Icon name="Share2" size={20} />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Video Player */}
          <div className="flex-1 bg-black relative">
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            
            {/* Stream Info Overlay */}
            <div className="absolute top-4 left-4 right-4 lg:right-auto lg:max-w-md">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-white text-lg">{streamData?.productName}</h3>
                {streamData?.startingPrice && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Starting Price:</span>
                    <span className="text-green-400 font-semibold">₹{streamData.startingPrice}</span>
                  </div>
                )}
                {streamData?.currentBid && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Current Bid:</span>
                    <span className="text-yellow-400 font-semibold">₹{streamData.currentBid}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="w-full lg:w-96 bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col max-h-96 lg:max-h-full">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800">
              <h4 className="font-medium text-white flex items-center">
                <Icon name="MessageCircle" size={20} className="mr-2" />
                Live Chat
              </h4>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {comments.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  <Icon name="MessageCircle" size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No comments yet</p>
                  <p className="text-xs mt-1">Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-800 rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-white">{comment.user}</span>
                      <span className="text-xs text-gray-400">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-300">{comment.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                  placeholder="Send a message..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <Button
                  onClick={handleSendComment}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Icon name="Send" size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamViewer;
