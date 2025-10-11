// components/ui/GoLiveModalAdvanced.jsx
import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const GoLiveModalAdvanced = ({ isOpen, onClose, product, onGoLive }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [streamDuration, setStreamDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const streamStartTime = useRef(null);
  const durationInterval = useRef(null);
  const viewerInterval = useRef(null);

  useEffect(() => {
    if (product) {
      setStreamTitle(`Live Auction: ${product?.name}`);
      setStreamDescription(`Showcasing ${product?.name} - Starting price: ₹${product?.starting_price}`);
    }
  }, [product]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    if (viewerInterval.current) {
      clearInterval(viewerInterval.current);
    }
  };

  const startStream = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setIsStreaming(true);
      streamStartTime.current = Date.now();
      
      // Start duration counter
      durationInterval.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - streamStartTime.current) / 1000);
        setStreamDuration(elapsed);
      }, 1000);

      // Simulate viewer count updates
      viewerInterval.current = setInterval(() => {
        setViewerCount(prev => Math.max(0, prev + Math.floor(Math.random() * 10) - 3));
      }, 5000);

      // Simulate incoming comments
      setTimeout(() => {
        addSystemComment('Stream started successfully!');
      }, 1000);

      // Call parent callback
      onGoLive({
        productId: product?.product_id,
        title: streamTitle,
        description: streamDescription,
        startTime: new Date().toISOString()
      });

      // Monitor connection quality
      monitorStreamQuality();

    } catch (error) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Could not access camera and microphone.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera and microphone access denied. Please grant permissions.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found on this device.';
      }
      
      alert(errorMessage);
    }
  };

  const stopStream = () => {
    cleanup();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setViewerCount(0);
    setStreamDuration(0);
    addSystemComment('Stream ended');
  };

  const pauseStream = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = false;
      });
      setIsPaused(true);
    }
  };

  const resumeStream = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = true;
      });
      setIsPaused(false);
    }
  };

  const toggleMicrophone = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicMuted(!isMicMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const switchCamera = async () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const currentFacingMode = videoTrack.getSettings().facingMode;
      
      // Stop current stream
      streamRef.current.getTracks().forEach(track => track.stop());
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: currentFacingMode === 'user' ? 'environment' : 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (error) {
        console.error('Error switching camera:', error);
        alert('Could not switch camera');
      }
    }
  };

  const monitorStreamQuality = () => {
    // Simulate connection quality monitoring
    setInterval(() => {
      const random = Math.random();
      if (random > 0.8) {
        setConnectionQuality('excellent');
      } else if (random > 0.5) {
        setConnectionQuality('good');
      } else if (random > 0.3) {
        setConnectionQuality('fair');
      } else {
        setConnectionQuality('poor');
      }
    }, 10000);
  };

  const handleClose = () => {
    if (isStreaming) {
      const confirmClose = window.confirm('Are you sure you want to end the live stream?');
      if (!confirmClose) return;
      stopStream();
    }
    onClose();
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        user: 'Host',
        message: newComment,
        timestamp: new Date().toLocaleTimeString(),
        isHost: true
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  const addSystemComment = (message) => {
    const comment = {
      id: Date.now(),
      user: 'System',
      message,
      timestamp: new Date().toLocaleTimeString(),
      isSystem: true
    };
    setComments(prev => [...prev, comment]);
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="bg-card rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
              <h2 className="text-xl font-semibold text-foreground">
                {isStreaming ? (isPaused ? 'PAUSED' : 'LIVE') : 'Go Live'}
              </h2>
            </div>
            
            {isStreaming && (
              <>
                <span className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Icon name="Users" size={16} />
                  <span className="font-medium">{viewerCount}</span>
                </span>
                
                <span className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Icon name="Clock" size={16} />
                  <span className="font-mono">{formatDuration(streamDuration)}</span>
                </span>
                
                <span className={`flex items-center space-x-1 text-sm ${getQualityColor()}`}>
                  <Icon name="Wifi" size={16} />
                  <span className="capitalize">{connectionQuality}</span>
                </span>
              </>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="hover:bg-destructive/10"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Video Section */}
          <div className="flex-1 bg-black relative">
            {!isStreaming ? (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="text-center space-y-6 max-w-2xl">
                  <div className="w-24 h-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                    <Icon name="Video" size={48} className="text-red-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Ready to showcase your product?</h3>
                    <p className="text-gray-400">Start your live stream and connect with potential buyers</p>
                  </div>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                      placeholder="Stream Title"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <textarea
                      value={streamDescription}
                      onChange={(e) => setStreamDescription(e.target.value)}
                      placeholder="Stream Description"
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-left space-y-2">
                    <h4 className="font-medium text-white mb-3">Product Details</h4>
                    <div className="flex items-center space-x-3">
                      <img
                        src={product?.image_path}
                        alt={product?.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-white">{product?.name}</p>
                        <p className="text-sm text-gray-400">SKU: {product?.sku}</p>
                        <p className="text-sm text-green-400">Starting: ₹{product?.starting_price}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={startStream}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg"
                    iconName="Video"
                    iconPosition="left"
                  >
                    Start Live Stream
                  </Button>

                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Icon name="Check" size={16} className="text-green-500" />
                      <span>HD Quality</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Check" size={16} className="text-green-500" />
                      <span>Live Chat</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Check" size={16} className="text-green-500" />
                      <span>Real-time Bids</span>
                    </div>
                  </div>
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
                
                {isVideoOff && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Icon name="VideoOff" size={48} className="text-gray-400 mx-auto" />
                      <p className="text-white">Camera is off</p>
                    </div>
                  </div>
                )}

                {isPaused && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Icon name="Pause" size={64} className="text-white mx-auto" />
                      <p className="text-white text-xl font-medium">Stream Paused</p>
                    </div>
                  </div>
                )}
                
                {/* Stream Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMicrophone}
                        className={`bg-white/10 hover:bg-white/20 text-white ${isMicMuted ? 'bg-red-500/50' : ''}`}
                        title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                      >
                        <Icon name={isMicMuted ? "MicOff" : "Mic"} size={20} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleVideo}
                        className={`bg-white/10 hover:bg-white/20 text-white ${isVideoOff ? 'bg-red-500/50' : ''}`}
                        title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
                      >
                        <Icon name={isVideoOff ? "VideoOff" : "Video"} size={20} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={switchCamera}
                        className="bg-white/10 hover:bg-white/20 text-white"
                        title="Switch Camera"
                      >
                        <Icon name="RefreshCw" size={20} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={isPaused ? resumeStream : pauseStream}
                        className="bg-white/10 hover:bg-white/20 text-white"
                        title={isPaused ? 'Resume Stream' : 'Pause Stream'}
                      >
                        <Icon name={isPaused ? "Play" : "Pause"} size={20} />
                      </Button>
                    </div>
                    
                    <Button
                      onClick={stopStream}
                      className="bg-red-500 hover:bg-red-600 text-white px-6"
                      iconName="StopCircle"
                      iconPosition="left"
                    >
                      End Stream
                    </Button>
                  </div>
                </div>

                {/* Stream Info Overlay */}
                <div className="absolute top-4 left-4 right-4 lg:right-auto lg:max-w-md">
                  <div className="bg-black/70 backdrop-blur-md rounded-lg p-4 space-y-2 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg">{streamTitle}</h3>
                        <p className="text-sm text-gray-300 mt-1">{streamDescription}</p>
                      </div>
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">
                        LIVE
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 pt-2 border-t border-white/10">
                      <div className="flex items-center space-x-1 text-white">
                        <Icon name="Eye" size={14} />
                        <span className="text-sm font-medium">{viewerCount}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-white">
                        <Icon name="MessageCircle" size={14} />
                        <span className="text-sm font-medium">{comments.length}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-white">
                        <Icon name="Clock" size={14} />
                        <span className="text-sm font-mono">{formatDuration(streamDuration)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Chat/Info Sidebar */}
          <div className="w-full lg:w-96 bg-background border-t lg:border-t-0 lg:border-l border-border flex flex-col max-h-96 lg:max-h-full">
            {/* Product Info */}
            <div className="p-4 border-b border-border bg-muted/30">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Product Details</h4>
              <div className="flex items-center space-x-3">
                <img
                  src={product?.image_path}
                  alt={product?.name}
                  className="w-20 h-20 rounded-lg object-cover border border-border"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{product?.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">SKU: {product?.sku}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Starting: <span className="font-medium text-foreground">₹{product?.starting_price}</span>
                    </p>
                    {product?.bid_amount && (
                      <p className="text-sm text-muted-foreground">
                        Current Bid: <span className="font-bold text-success">₹{product?.bid_amount}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Auction Timer */}
            {product?.auction_end && (
              <div className="p-4 border-b border-border bg-warning/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Clock" size={16} className="text-warning" />
                    <span className="text-sm font-medium text-foreground">Auction Ends</span>
                  </div>
                  <span className="text-sm font-mono text-warning">
                    {new Date(product.auction_end).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            {/* Live Comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground flex items-center space-x-2">
                  <Icon name="MessageCircle" size={16} />
                  <span>Live Chat</span>
                </h4>
                <span className="text-xs text-muted-foreground">{comments.length} messages</span>
              </div>
              
              {comments.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-12">
                  <Icon name="MessageCircle" size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No messages yet</p>
                  <p className="text-xs mt-1">Be the first to start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className={`rounded-lg p-3 ${
                        comment.isSystem 
                          ? 'bg-blue-500/10 border border-blue-500/20' 
                          : comment.isHost 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-background border border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium text-sm ${
                            comment.isSystem 
                              ? 'text-blue-500' 
                              : comment.isHost 
                              ? 'text-primary' 
                              : 'text-foreground'
                          }`}>
                            {comment.user}
                          </span>
                          {comment.isHost && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                              Host
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-foreground">{comment.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-border bg-background">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                  placeholder={isStreaming ? "Send a message..." : "Start streaming to chat"}
                  className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={!isStreaming}
                />
                <Button
                  onClick={handleSendComment}
                  disabled={!isStreaming || !newComment.trim()}
                  size="sm"
                  className="px-4"
                >
                  <Icon name="Send" size={16} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>

        {/* Stream Stats Footer */}
        {isStreaming && (
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Icon name="Users" size={16} className="text-primary" />
                  <p className="text-2xl font-bold text-foreground">{viewerCount}</p>
                </div>
                <p className="text-xs text-muted-foreground">Live Viewers</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Icon name="MessageCircle" size={16} className="text-blue-500" />
                  <p className="text-2xl font-bold text-foreground">{comments.length}</p>
                </div>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Icon name="DollarSign" size={16} className="text-success" />
                  <p className="text-2xl font-bold text-success">
                    {product?.bid_amount ? `₹${product.bid_amount}` : '₹0'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Current Bid</p>
                
                </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Icon name="Clock" size={16} className="text-orange-500" />
                  <p className="text-2xl font-bold text-foreground font-mono">
                    {formatDuration(streamDuration)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Icon name="Wifi" size={16} className={getQualityColor()} />
                  <p className={`text-2xl font-bold capitalize ${getQualityColor()}`}>
                    {connectionQuality}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Connection</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoLiveModalAdvanced;
