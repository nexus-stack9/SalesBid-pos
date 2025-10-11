// utils/streamingService.js
class StreamingService {
    constructor() {
      this.peerConnection = null;
      this.localStream = null;
      this.remoteStream = null;
      this.configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
    }
  
    async initializeStream(constraints) {
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
        return { success: true, stream: this.localStream };
      } catch (error) {
        console.error('Failed to initialize stream:', error);
        return { success: false, error };
      }
    }
  
    async createPeerConnection() {
      try {
        this.peerConnection = new RTCPeerConnection(this.configuration);
        
        // Add local stream tracks to peer connection
        if (this.localStream) {
          this.localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.localStream);
          });
        }
  
        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            this.handleIceCandidate(event.candidate);
          }
        };
  
        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
          this.remoteStream = event.streams[0];
        };
  
        return { success: true, peerConnection: this.peerConnection };
      } catch (error) {
        console.error('Failed to create peer connection:', error);
        return { success: false, error };
      }
    }
  
    async createOffer() {
      try {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        return { success: true, offer };
      } catch (error) {
        console.error('Failed to create offer:', error);
        return { success: false, error };
      }
    }
  
    async handleAnswer(answer) {
      try {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        return { success: true };
      } catch (error) {
        console.error('Failed to handle answer:', error);
        return { success: false, error };
      }
    }
  
    handleIceCandidate(candidate) {
      // Send ICE candidate to signaling server
      // This would be implemented based on your backend
      console.log('ICE Candidate:', candidate);
    }
  
    async addIceCandidate(candidate) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        return { success: true };
      } catch (error) {
        console.error('Failed to add ICE candidate:', error);
        return { success: false, error };
      }
    }
  
    getStreamStats() {
      if (!this.peerConnection) return null;
  
      return this.peerConnection.getStats().then(stats => {
        const statsReport = {};
        stats.forEach(report => {
          statsReport[report.type] = report;
        });
        return statsReport;
      });
    }
  
    stopStream() {
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
  
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
  
      this.remoteStream = null;
    }
  
    toggleAudio(enabled) {
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach(track => {
          track.enabled = enabled;
        });
      }
    }
  
    toggleVideo(enabled) {
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = enabled;
        });
      }
    }
  
    async switchCamera() {
      if (!this.localStream) return { success: false };
  
      const videoTrack = this.localStream.getVideoTracks()[0];
      const currentFacingMode = videoTrack.getSettings().facingMode;
  
      try {
        // Stop current video track
        videoTrack.stop();
  
        // Get new video stream
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: currentFacingMode === 'user' ? 'environment' : 'user'
          }
        });
  
        const newVideoTrack = newStream.getVideoTracks()[0];
  
        // Replace track in peer connection
        if (this.peerConnection) {
          const sender = this.peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(newVideoTrack);
          }
        }
  
        // Update local stream
        this.localStream.removeTrack(videoTrack);
        this.localStream.addTrack(newVideoTrack);
  
        return { success: true, stream: this.localStream };
      } catch (error) {
        console.error('Failed to switch camera:', error);
        return { success: false, error };
      }
    }
  }
  
  export default new StreamingService();