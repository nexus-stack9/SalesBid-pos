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
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [streamData, setStreamData] = useState(null);
  const [playbackUrl, setPlaybackUrl] = useState('');
  const [streamStartTime, setStreamStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const webrtcStreamerRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    if (product) {
      setStreamTitle(`Live Auction: ${product?.name}`);
    }
  }, [product]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (webrtcStreamerRef.current) {
        webrtcStreamerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!webrtcStreamerRef.current) return;

    const interval = setInterval(() => {
      const state = webrtcStreamerRef.current.getConnectionState();
      setConnectionStatus(state);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  useEffect(() => {
    if (!isStreaming || !streamStartTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - streamStartTime;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, streamStartTime]);

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
      toast.loading('Setting up live stream...', { id: 'setup' });
      
      // First, try to create the live stream
      let createResponse;
      try {
        createResponse = await axios.post(`${API_BASE_URL}/livestream/create`, {
          productId: product.product_id,
          productName: streamTitle || product.name
        });
      } catch (error) {
        // If we get an error about existing stream, delete it and retry
        if (error.response?.data?.error === 'Product already has an active live stream') {
          const liveInputId = error.response.data.liveInputId;
          toast.loading('Cleaning up existing stream...', { id: 'cleanup' });
          
          // Delete the existing live input
          await axios.delete(`${API_BASE_URL}/livestream/delete/${liveInputId}`);
          toast.dismiss('cleanup');
          
          // Retry creating the live stream
          toast.loading('Setting up new live stream...', { id: 'setup' });
          createResponse = await axios.post(`${API_BASE_URL}/livestream/create`, {
            productId: product.product_id,
            productName: streamTitle || product.name
          });
        } else {
          throw error; // Re-throw if it's a different error
        }
      }

      if (!createResponse.data.success) {
        throw new Error('Failed to create live stream');
      }

      const liveStreamData = createResponse.data.data;
      setStreamData(liveStreamData);
      setPlaybackUrl(liveStreamData.playbackUrl);
      toast.success('Live stream created', { id: 'setup' });

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

      toast.loading('Connecting to stream server...', { id: 'connect' });
      const webrtcResponse = await axios.get(
        `${API_BASE_URL}/livestream/${product.product_id}/webrtc`
      );

      if (!webrtcResponse.data.success) {
        throw new Error('Failed to get WebRTC URL');
      }

      const webrtcUrl = webrtcResponse.data.data.webRTCUrl;

      if (!webrtcUrl) {
        toast.dismiss('connect');
        toast.error(
          'WebRTC streaming is not available. Please use OBS or similar software with RTMP.',
          { duration: 6000 }
        );
        
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

      webrtcStreamerRef.current = new WebRTCStreamer();
      await webrtcStreamerRef.current.connect(webrtcUrl, stream);
      toast.success('Connected to stream server', { id: 'connect' });

      await axios.post(`${API_BASE_URL}/livestream/start`, {
        productId: product.product_id
      });

      setIsStreaming(true);
      setStreamStartTime(Date.now());
      setConnectionStatus('connected');
      
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

      const viewerInterval = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 5));
      }, 3000);

      return () => clearInterval(viewerInterval);
    } catch (error) {
      console.error('Error starting stream:', error);
      
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

      if (webrtcStreamerRef.current) {
        webrtcStreamerRef.current.disconnect();
        webrtcStreamerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

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
      setStreamStartTime(null);
      setElapsedTime('00:00:00');
      
      toast.success('Stream stopped', { id: 'stop' });
    } catch (error) {
      console.error('Error stopping stream:', error);
      toast.error('Error stopping stream', { id: 'stop' });
    }
  };

  const handleClose = () => {
    if (isStreaming) {
      if (window.confirm('Are you sure you want to end the live stream?')) {
        stopStream();
        onClose();
      }
    } else {
      onClose();
    }
  };

  const switchCamera = async () => {
    if (!streamRef.current || !webrtcStreamerRef.current) return;

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const currentFacingMode = videoTrack.getSettings().facingMode;
      
      streamRef.current.getTracks().forEach(track => track.stop());
      
      const newStream = await getUserMediaForStreaming({
        video: {
          facingMode: currentFacingMode === 'user' ? 'environment' : 'user'
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        streamRef.current = newStream;
      }

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
      const viewerUrl = `${window.location.origin}/live/${product.product_id}`;
      navigator.clipboard.writeText(viewerUrl);
      toast.success('Viewer URL copied! Share this link with your audience.', { duration: 4000 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="w-full h-full md:w-[90vw] md:max-w-6xl md:h-[85vh] bg-background md:rounded-xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
            <h2 className="text-lg font-semibold text-foreground">
              {isStreaming ? 'LIVE' : 'Go Live'}
            </h2>
            {/* {isStreaming && (
              <span className="flex items-center space-x-1.5 text-sm text-muted-foreground">
                <Icon name="Users" size={14} />
                <span className="font-medium">{viewerCount}</span>
              </span>
            )} */}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <Icon name="X" size={18} />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Video Section */}
          <div className="flex-1 bg-black relative flex items-center justify-center">
            {/* Video element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-contain ${!isStreaming ? 'hidden' : ''}`}
              style={{ transform: 'scaleX(-1)' }}
            />
            
            {/* Pre-stream Setup */}
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-center space-y-6 max-w-md w-full">
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                      <Icon name="Video" size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Ready to go live?</h3>
                    <p className="text-sm text-gray-400">Start streaming {product?.name}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                      placeholder="Stream Title"
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <textarea
                      value={streamDescription}
                      onChange={(e) => setStreamDescription(e.target.value)}
                      placeholder="Stream Description (optional)"
                      rows={2}
                      className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <Button
                    onClick={startStream}
                    disabled={isConnecting}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isConnecting ? (
                      <>
                        <Icon name="Loader" size={18} className="mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Icon name="Video" size={18} className="mr-2" />
                        Start Live Stream
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Stream Controls Overlay */}
            {isStreaming && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/50 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 md:invisible">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={switchCamera}
                      className="h-10 w-10 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                    >
                      <Icon name="RefreshCw" size={18} />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-md">
                      <span className="text-white text-sm font-mono">{elapsedTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Connection Status Indicator */}
            {isStreaming && (
              <div className="absolute top-4 left-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <span className="text-xs text-white uppercase font-medium">{connectionStatus}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Product Info & Actions */}
          {isStreaming && (
            <div className="w-full md:w-80 md:max-w-sm bg-card border-t md:border-t-0 md:border-l border-border flex flex-col overflow-y-auto">
              {/* Product Details */}
              <div className="p-4 space-y-4">
                <div className="flex items-start space-x-3">
                  <img
                    src={product?.image_path}
                    alt={product?.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">{product?.name}</h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Starting</span>
                        <span className="font-medium text-foreground">₹{product?.starting_price}</span>
                      </div>
                      {product?.bid_amount && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Current Bid</span>
                          <span className="font-semibold text-green-500">₹{product?.bid_amount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Current Bid Highlight */}
                {product?.bid_amount && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Current Highest Bid</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{product?.bid_amount}</p>
                      </div>
                      <Icon name="TrendingUp" size={32} className="text-green-500/50" />
                    </div>
                  </div>
                )}

                {/* End Stream Button */}
                <Button
                  onClick={stopStream}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 transition-all"
                >
                  <Icon name="StopCircle" size={18} className="mr-2" />
                  End Live Stream
                </Button>

                {/* Stream Info */}
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Stream Details</p>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Icon name="Radio" size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-foreground line-clamp-1">{streamTitle}</p>
                    </div>
                    {streamDescription && (
                      <div className="flex items-start space-x-2">
                        <Icon name="FileText" size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground line-clamp-2">{streamDescription}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoLiveModal;