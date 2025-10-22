// components/ui/GoLiveModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import axios from 'axios';
import WebRTCStreamer, { getUserMediaForStreaming, isWebRTCSupported } from '../../utils/webrtcStreaming';
import toast from 'react-hot-toast';

const GoLiveModal = ({ isOpen, onClose, product, onGoLive }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [streamData, setStreamData] = useState(null);
  const [playbackUrl, setPlaybackUrl] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const webrtcStreamerRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
      if (webrtcStreamerRef.current) {
        webrtcStreamerRef.current.disconnect();
      }
    };
  }, []);

  // Monitor connection status
  useEffect(() => {
    if (!webrtcStreamerRef.current) return;

    const interval = setInterval(() => {
      const state = webrtcStreamerRef.current.getConnectionState();
      setConnectionStatus(state);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const startStream = async () => {
    if (!isWebRTCSupported()) {
      toast.error('Your browser does not support WebRTC streaming');
      return;
    }

    if (!product?.product_id) {
      toast.error('Product information is missing');
      return;
    }

    setIsConnecting(true);

    try {
      // Step 1: Create live stream on backend
      toast.loading('Setting up live stream...', { id: 'setup' });
      const createResponse = await axios.post(`${API_BASE_URL}/livestream/create`, {
        productId: product.product_id,
        productName: streamTitle || product.name
      });

      if (!createResponse.data.success) {
        throw new Error('Failed to create live stream');
      }

      const liveStreamData = createResponse.data.data;
      setStreamData(liveStreamData);
      setPlaybackUrl(liveStreamData.playbackUrl);
      toast.success('Live stream created', { id: 'setup' });

      // Step 2: Get user media
      toast.loading('Accessing camera...', { id: 'camera' });
      const stream = await getUserMediaForStreaming({
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
      toast.success('Camera ready', { id: 'camera' });

      // Step 3: Get WebRTC URL
      toast.loading('Connecting to stream server...', { id: 'connect' });
      const webrtcResponse = await axios.get(
        `${API_BASE_URL}/livestream/${product.product_id}/webrtc`
      );

      if (!webrtcResponse.data.success) {
        throw new Error('Failed to get WebRTC URL');
      }

      const webrtcUrl = webrtcResponse.data.data.webRTCUrl;

      // Check if WebRTC is available
      if (!webrtcUrl) {
        toast.dismiss('connect');
        toast.error(
          'WebRTC streaming is not available. Please use OBS or similar software with RTMP.',
          { duration: 6000 }
        );
        
        // Show RTMP details to user
        const rtmpUrl = webrtcResponse.data.data.rtmpUrl;
        const streamKey = webrtcResponse.data.data.streamKey;
        
        console.log('RTMP URL:', rtmpUrl);
        console.log('Stream Key:', streamKey);
        
        toast.error(
          `RTMP URL: ${rtmpUrl}\nStream Key: ${streamKey}`,
          { duration: 10000 }
        );
        
        throw new Error('WebRTC not available. Use RTMP streaming with OBS or similar software.');
      }

      // Step 4: Connect via WebRTC
      webrtcStreamerRef.current = new WebRTCStreamer();
      await webrtcStreamerRef.current.connect(webrtcUrl, stream);
      toast.success('Connected to stream server', { id: 'connect' });

      // Step 5: Mark stream as live
      await axios.post(`${API_BASE_URL}/livestream/start`, {
        productId: product.product_id
      });

      setIsStreaming(true);
      setConnectionStatus('connected');
      
      // Call parent callback
      if (onGoLive) {
        onGoLive({
          productId: product?.product_id,
          title: streamTitle,
          description: streamDescription,
          startTime: new Date().toISOString(),
          playbackUrl: liveStreamData.playbackUrl,
          hlsUrl: liveStreamData.hlsUrl
        });
      }

      toast.success('You are now LIVE! 🔴');

      // Simulate viewer count updates
      const viewerInterval = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 5));
      }, 3000);

      return () => clearInterval(viewerInterval);
    } catch (error) {
      console.error('Error starting stream:', error);
      
      // Cleanup on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (webrtcStreamerRef.current) {
        webrtcStreamerRef.current.disconnect();
        webrtcStreamerRef.current = null;
      }

      const errorMessage = error.response?.data?.message || error.message || 'Failed to start stream';
      toast.error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const stopStream = async () => {
    try {
      toast.loading('Stopping stream...', { id: 'stop' });

      // Stop WebRTC connection
      if (webrtcStreamerRef.current) {
        webrtcStreamerRef.current.disconnect();
        webrtcStreamerRef.current = null;
      }

      // Stop local media tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Mark stream as stopped on backend
      if (product?.product_id) {
        await axios.post(`${API_BASE_URL}/livestream/stop`, {
          productId: product.product_id
        });
      }

      setIsStreaming(false);
      setViewerCount(0);
      setConnectionStatus('disconnected');
      setStreamData(null);
      setPlaybackUrl('');
      
      toast.success('Stream stopped', { id: 'stop' });
    } catch (error) {
      console.error('Error stopping stream:', error);
      toast.error('Error stopping stream', { id: 'stop' });
    }
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
    if (!streamRef.current || !webrtcStreamerRef.current) return;

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const currentFacingMode = videoTrack.getSettings().facingMode;
      
      // Stop current tracks
      streamRef.current.getTracks().forEach(track => track.stop());
      
      // Get new stream with switched camera
      const newStream = await getUserMediaForStreaming({
        video: {
          facingMode: currentFacingMode === 'user' ? 'environment' : 'user'
        },
        audio: true
      });

      // Update video element
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        streamRef.current = newStream;
      }

      // Replace tracks in WebRTC connection
      const senders = webrtcStreamerRef.current.peerConnection.getSenders();
      const newVideoTrack = newStream.getVideoTracks()[0];
      const newAudioTrack = newStream.getAudioTracks()[0];

      senders.forEach(sender => {
        if (sender.track.kind === 'video' && newVideoTrack) {
          sender.replaceTrack(newVideoTrack);
        } else if (sender.track.kind === 'audio' && newAudioTrack) {
          sender.replaceTrack(newAudioTrack);
        }
      });

      toast.success('Camera switched');
    } catch (error) {
      console.error('Error switching camera:', error);
      toast.error('Failed to switch camera');
    }
  };

  const copyPlaybackUrl = () => {
    if (product?.product_id) {
      // Create shareable viewer URL
      const viewerUrl = `${window.location.origin}/live/${product.product_id}`;
      navigator.clipboard.writeText(viewerUrl);
      toast.success('Viewer URL copied! Share this link with your audience.', { duration: 4000 });
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
                    disabled={isConnecting}
                    className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                    iconName="Video"
                    iconPosition="left"
                  >
                    {isConnecting ? 'Connecting...' : 'Start Live Stream'}
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          connectionStatus === 'connected' ? 'bg-green-500' :
                          connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                          'bg-red-500'
                        }`} />
                        <span className="text-xs text-white uppercase">{connectionStatus}</span>
                      </div>
                      {isStreaming && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyPlaybackUrl}
                          className="bg-white/10 hover:bg-white/20 text-white text-xs"
                        >
                          <Icon name="Share2" size={14} className="mr-1" />
                          Share Link
                        </Button>
                      )}
                    </div>
                    <h3 className="font-medium text-white">{streamTitle}</h3>
                    <p className="text-sm text-gray-300">{streamDescription}</p>
                    {playbackUrl && (
                      <div className="text-xs text-gray-400 truncate">
                        Playback: {playbackUrl}
                      </div>
                    )}
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
