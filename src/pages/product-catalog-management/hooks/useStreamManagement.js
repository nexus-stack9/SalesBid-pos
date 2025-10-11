// hooks/useStreamManagement.js
import { useState, useRef, useCallback, useEffect } from 'react';

export const useStreamManagement = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [streamDuration, setStreamDuration] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState('good');
  
  const streamRef = useRef(null);
  const startTimeRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const viewerIntervalRef = useRef(null);

  const startStream = useCallback(async (constraints = {}) => {
    try {
      const defaultConstraints = {
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
        },
        ...constraints
      };

      const stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
      streamRef.current = stream;
      startTimeRef.current = Date.now();
      setIsStreaming(true);

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setStreamDuration(elapsed);
      }, 1000);

      // Simulate viewer count
      viewerIntervalRef.current = setInterval(() => {
        setViewerCount(prev => Math.max(0, prev + Math.floor(Math.random() * 10) - 3));
      }, 5000);

      return { success: true, stream };
    } catch (error) {
      console.error('Stream start error:', error);
      return { success: false, error };
    }
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }

    if (viewerIntervalRef.current) {
      clearInterval(viewerIntervalRef.current);
    }

    setIsStreaming(false);
    setIsPaused(false);
    setStreamDuration(0);
    setViewerCount(0);
  }, []);

  const pauseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = false;
      });
      setIsPaused(true);
    }
  }, []);

  const resumeStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = true;
      });
      setIsPaused(false);
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      return streamRef.current.getAudioTracks()[0]?.enabled;
    }
    return false;
  }, []);

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      return streamRef.current.getVideoTracks()[0]?.enabled;
    }
    return false;
  }, []);

  const switchCamera = useCallback(async () => {
    if (!streamRef.current) return { success: false };

    const videoTrack = streamRef.current.getVideoTracks()[0];
    const currentFacingMode = videoTrack.getSettings().facingMode;

    try {
      // Stop current tracks
      streamRef.current.getTracks().forEach(track => track.stop());

      // Get new stream with switched camera
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

      streamRef.current = stream;
      return { success: true, stream };
    } catch (error) {
      console.error('Camera switch error:', error);
      return { success: false, error };
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    isStreaming,
    isPaused,
    streamDuration,
    viewerCount,
    connectionQuality,
    streamRef,
    startStream,
    stopStream,
    pauseStream,
    resumeStream,
    toggleAudio,
    toggleVideo,
    switchCamera
  };
};