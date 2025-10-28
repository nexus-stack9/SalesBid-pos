/**
 * WebRTC Streaming Utility for Cloudflare Stream
 * Handles browser-based live streaming using WebRTC
 */

class WebRTCStreamer {
    constructor() {
        this.peerConnection = null;
        this.localStream = null;
        this.sessionUrl = null;
    }

    /**
     * Initialize WebRTC connection with Cloudflare Stream using WHIP protocol
     * @param {string} whipUrl - WHIP URL from Cloudflare Stream
     * @param {MediaStream} stream - Local media stream from getUserMedia
     */
    async connect(whipUrl, stream) {
        try {
            this.sessionUrl = whipUrl;
            this.localStream = stream;

            // Create RTCPeerConnection with Cloudflare STUN servers
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: 'stun:stun.cloudflare.com:3478',
                    },
                ],
                bundlePolicy: 'max-bundle',
            });

            // Add local stream tracks to peer connection
            stream.getTracks().forEach((track) => {
                this.peerConnection.addTrack(track, stream);
            });

            // Handle ICE connection state changes
            this.peerConnection.addEventListener('iceconnectionstatechange', () => {
                console.log('ICE connection state:', this.peerConnection.iceConnectionState);
            });

            // Handle connection state changes
            this.peerConnection.addEventListener('connectionstatechange', () => {
                console.log('Connection state:', this.peerConnection.connectionState);
            });

            // Create and set local description (SDP offer)
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            // Wait for ICE gathering to complete
            await new Promise((resolve) => {
                if (this.peerConnection.iceGatheringState === 'complete') {
                    resolve();
                } else {
                    this.peerConnection.addEventListener('icegatheringstatechange', () => {
                        if (this.peerConnection.iceGatheringState === 'complete') {
                            resolve();
                        }
                    });
                }
            });

            // Send SDP offer to Cloudflare Stream via WHIP
            const response = await fetch(whipUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/sdp',
                },
                body: this.peerConnection.localDescription.sdp,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`WHIP connection failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            // Get SDP answer from Cloudflare
            const answerSdp = await response.text();

            // Set remote description from Cloudflare's answer
            await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription({
                    type: 'answer',
                    sdp: answerSdp,
                })
            );

            console.log('WebRTC (WHIP) connection established successfully');
            return true;
        } catch (error) {
            console.error('Error connecting to WebRTC:', error);
            throw error;
        }
    }

    /**
     * Get the current connection state
     */
    getConnectionState() {
        return this.peerConnection?.connectionState || 'disconnected';
    }

    /**
     * Get the current ICE connection state
     */
    getIceConnectionState() {
        return this.peerConnection?.iceConnectionState || 'disconnected';
    }

    /**
     * Check if the connection is active
     */
    isConnected() {
        const state = this.getConnectionState();
        return state === 'connected' || state === 'connecting';
    }

    /**
     * Disconnect and cleanup
     */
    disconnect() {
        try {
            // Stop all tracks in the local stream
            if (this.localStream) {
                this.localStream.getTracks().forEach((track) => {
                    track.stop();
                });
                this.localStream = null;
            }

            // Close peer connection
            if (this.peerConnection) {
                this.peerConnection.close();
                this.peerConnection = null;
            }

            console.log('WebRTC connection closed');
        } catch (error) {
            console.error('Error disconnecting WebRTC:', error);
        }
    }

    /**
     * Get statistics about the connection
     */
    async getStats() {
        if (!this.peerConnection) {
            return null;
        }

        try {
            const stats = await this.peerConnection.getStats();
            const statsReport = {};

            stats.forEach((report) => {
                if (report.type === 'outbound-rtp') {
                    statsReport[report.mediaType] = {
                        bytesSent: report.bytesSent,
                        packetsSent: report.packetsSent,
                        timestamp: report.timestamp,
                    };
                }
            });

            return statsReport;
        } catch (error) {
            console.error('Error getting stats:', error);
            return null;
        }
    }
}

/**
 * Helper function to get user media with optimal settings for streaming
 */
export async function getUserMediaForStreaming(constraints = {}) {
    const defaultConstraints = {
        video: {
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 30, max: 30 },
            facingMode: 'user',
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
        },
    };

    const finalConstraints = {
        video: { ...defaultConstraints.video, ...constraints.video },
        audio: constraints.audio !== false ? { ...defaultConstraints.audio, ...constraints.audio } : false,
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(finalConstraints);
        return stream;
    } catch (error) {
        console.error('Error accessing media devices:', error);
        throw error;
    }
}

/**
 * Check if browser supports WebRTC
 */
export function isWebRTCSupported() {
    return !!(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia &&
        window.RTCPeerConnection
    );
}

export default WebRTCStreamer;
