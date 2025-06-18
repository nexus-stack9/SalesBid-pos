import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
}

const LiveStreamModal = ({
  isOpen,
  onClose,
  productId,
  productName,
}: LiveStreamModalProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up function to stop all tracks when component unmounts or modal closes
  const stopVideoStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  // Start the camera stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera. Please check permissions.");
    }
  };

  // Start or stop the live stream
  const toggleStream = () => {
    if (isStreaming) {
      // Stop streaming
      stopVideoStream();
      toast.info("Live stream ended");
    } else {
      // Start streaming
      setIsStreaming(true);
      toast.success(`Live stream started for ${productName}`);
    }
  };

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    }

    // Clean up when modal closes
    return () => {
      stopVideoStream();
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Live Stream - {productName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          <div className="relative bg-black rounded-md overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {!streamRef.current && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                Loading camera...
              </div>
            )}

            {isStreaming && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="animate-pulse h-3 w-3 rounded-full bg-red-500"></span>
                <span className="text-white text-sm font-medium">LIVE</span>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Product ID: {productId}</p>
            <p>Stream Status: {isStreaming ? "Active" : "Ready"}</p>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={toggleStream}
            variant={isStreaming ? "destructive" : "default"}
            className={
              isStreaming
                ? ""
                : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-purple-600 hover:to-blue-600"
            }
          >
            {isStreaming ? "End Stream" : "Start Stream"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LiveStreamModal;