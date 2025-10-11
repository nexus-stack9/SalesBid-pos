// components/ui/GoLiveModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const GoLiveModal = ({ isOpen, onClose, product, onGoLive }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (product) {
      setStreamTitle(`Live Auction: ${product?.name}`);
      setStreamDescription(`Showcasing ${product?.name} - Starting price: ₹${product?.starting_price}`);
    }
  }, [product]);

  useEffect(() => {
    // Cleanup stream on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user'
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setIsStreaming(true);
      
      // Call parent callback
      onGoLive({
        productId: product?.product_id,
        title: streamTitle,
        description: streamDescription,
        startTime: new Date().toISOString()
      });

      // Simulate viewer count updates
      const viewerInterval = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 5));
      }, 3000);

      return () => clearInterval(viewerInterval);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setViewerCount(0);
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      setComments([...comments, {
        id: Date.now(),
        user: 'Host',
        message: newComment,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setNewComment('');
    }
  };

  const switchCamera = async () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const currentFacingMode = videoTrack.getSettings().facingMode;
      
      stopStream();
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode === 'user' ? 'environment' : 'user'
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-card rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
            <h2 className="text-xl font-semibold text-foreground">
              {isStreaming ? 'LIVE' : 'Go Live'}
            </h2>
            {isStreaming && (
              <span className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Icon name="Users" size={16} />
                <span>{viewerCount} viewers</span>
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Video Section */}
          <div className="flex-1 bg-black relative">
            {!isStreaming ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Icon name="Video" size={64} className="text-muted-foreground mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-white">Ready to go live?</h3>
                    <p className="text-sm text-gray-400">Start streaming to showcase {product?.name}</p>
                  </div>
                  
                  <div className="space-y-3 max-w-md mx-auto">
                    <input
                      type="text"
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                      placeholder="Stream Title"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                    <textarea
                      value={streamDescription}
                      onChange={(e) => setStreamDescription(e.target.value)}
                      placeholder="Stream Description"
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                    />
                  </div>

                  <Button
                    onClick={startStream}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    iconName="Video"
                    iconPosition="left"
                  >
                    Start Live Stream
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Stream Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={switchCamera}
                        className="bg-white/10 hover:bg-white/20 text-white"
                      >
                        <Icon name="RefreshCw" size={20} />
                      </Button>
                    </div>
                    
                    <Button
                      onClick={stopStream}
                      className="bg-red-500 hover:bg-red-600 text-white"
                      iconName="StopCircle"
                      iconPosition="left"
                    >
                      End Stream
                    </Button>
                  </div>
                </div>

                {/* Stream Info Overlay */}
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 space-y-2">
                    <h3 className="font-medium text-white">{streamTitle}</h3>
                    <p className="text-sm text-gray-300">{streamDescription}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Chat/Info Sidebar */}
          <div className="w-full lg:w-96 bg-muted/50 border-t lg:border-t-0 lg:border-l border-border flex flex-col max-h-96 lg:max-h-full">
            {/* Product Info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <img
                  src={product?.image_path}
                  alt={product?.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{product?.name}</h4>
                  <p className="text-sm text-muted-foreground">Starting: ₹{product?.starting_price}</p>
                  {product?.bid_amount && (
                    <p className="text-sm text-success font-medium">Current: ₹{product?.bid_amount}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Live Comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <h4 className="font-medium text-foreground mb-2">Live Chat</h4>
              
              {comments.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <Icon name="MessageCircle" size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No comments yet</p>
                  <p className="text-xs mt-1">Start the conversation!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-background rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-foreground">{comment.user}</span>
                      <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-foreground">{comment.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                  placeholder="Send a message..."
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!isStreaming}
                />
                <Button
                  onClick={handleSendComment}
                  disabled={!isStreaming || !newComment.trim()}
                  size="sm"
                >
                  <Icon name="Send" size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stream Stats Footer */}
        {isStreaming && (
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{viewerCount}</p>
                <p className="text-xs text-muted-foreground">Viewers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{comments.length}</p>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {product?.bid_amount ? `₹${product.bid_amount}` : '-'}
                </p>
                <p className="text-xs text-muted-foreground">Current Bid</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {new Date().toLocaleTimeString()}
                </p>
                <p className="text-xs text-muted-foreground">Stream Time</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoLiveModal;