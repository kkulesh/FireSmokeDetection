import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { SampleImages } from '../components/SampleImages';
import { UploadSection } from '../components/UploadSection';
import { DetectionCanvas, type DetectionCanvasHandle } from '../components/DetectionCanvas';
import { ControlPanel } from '../components/ControlPanel';

interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id: number;
  detection_id: string;
}

export default function Home() {
  const location = useLocation();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(false);

  const [confidenceThreshold, setConfidenceThreshold] = useState(20);
  const [overlapThreshold, setOverlapThreshold] = useState(73);
  const [opacityThreshold, setOpacityThreshold] = useState(100);
  const [labelDisplayMode, setLabelDisplayMode] = useState('Draw Confidence');

  const canvasRef = useRef<DetectionCanvasHandle>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const frameLoopRef = useRef<number | null>(null);
  const processingRef = useRef<boolean>(false);

  // 🔥 API for image detection
  const detectImage = async (imageUrl: string) => {
    try {
      setLoading(true);
      setDetections([]);

      const response = await fetch('http://localhost:8000/detect/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          overlap_threshold: overlapThreshold,
          confidence_threshold: confidenceThreshold,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Detection error:', data.detail);
        setLoading(false);
        return;
      }
      setDetections(data.detections || []);
    } catch (err) {
      console.error('Image detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 API for file detection
  const detectFile = async (file: File) => {
    try {
      setLoading(true);
      setDetections([]);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('overlap_threshold', String(overlapThreshold));
      formData.append('confidence_threshold', String(confidenceThreshold));

      const response = await fetch('http://localhost:8000/detect/file', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setDetections(data.detections || []);
    } catch (err) {
      console.error('File detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 WebSocket connect
  const connectWebSocket = () => {
    if (wsRef.current) return;

    const ws = new WebSocket('ws://localhost:8000/ws/detect');

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setDetections(data.detections || []);
        processingRef.current = false; // Mark frame as processed
      } catch (err) {
        console.error('WS parse error:', err);
        processingRef.current = false;
      }
    };

    ws.onerror = (err) => {
      console.error('❌ WebSocket error:', err);
      processingRef.current = false;
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket closed');
      wsRef.current = null;
      processingRef.current = false;
    };

    wsRef.current = ws;
  };

  // 🔥 Send frames loop with throttling
  const startFrameLoop = (video: HTMLVideoElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frameInterval = 100; // Send frames every 100ms (~10 fps)
    let lastFrameTime = 0;

    const sendFrame = () => {
      const currentTime = Date.now();
      
      if (currentTime - lastFrameTime < frameInterval) {
        frameLoopRef.current = setTimeout(sendFrame, frameInterval - (currentTime - lastFrameTime));
        return;
      }

      if (!video || video.readyState < 2) {
        frameLoopRef.current = setTimeout(sendFrame, 50); // Retry faster if video not ready
        return;
      }

      try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (canvas.width === 0 || canvas.height === 0) {
          frameLoopRef.current = setTimeout(sendFrame, 50); // Video dimensions not ready yet
          return;
        }

        ctx?.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.6);

        if (wsRef.current?.readyState === WebSocket.OPEN && !processingRef.current) {
          processingRef.current = true;
          lastFrameTime = currentTime;

          const payload = {
            frame: base64,
            overlap_threshold: overlapThreshold,
            confidence_threshold: confidenceThreshold,
          };
          wsRef.current.send(JSON.stringify(payload));
        }
      } catch (err) {
        console.error('Frame capture error:', err);
      }

      frameLoopRef.current = setTimeout(sendFrame, frameInterval);
    };

    sendFrame();
  };

  // 🔥 Stop everything
  const stopVideoStream = (stream: MediaStream | null) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
  };

  const stopWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (frameLoopRef.current) {
      clearTimeout(frameLoopRef.current as unknown as number);
      frameLoopRef.current = null;
    }

    processingRef.current = false;
  };

  // Handle navigation image
  useEffect(() => {
    if (location.state?.selectedImage) {
      handleImageSelect(location.state.selectedImage);
    }
  }, [location.state]);

  // 🔥 IMAGE FLOW
  const handleImageSelect = (url: string) => {
    stopWebSocket();
    stopVideoStream(videoStream);

    setVideoStream(null);
    setUploadedFile(null);
    setSelectedImage(url);

    detectImage(url);
  };

  const handleFileUpload = async (file: File) => {
    stopWebSocket();
    stopVideoStream(videoStream);

    setVideoStream(null);
    setUploadedFile(file);
    setSelectedImage(URL.createObjectURL(file));

    await detectFile(file);
  };

  // 🔥 Re-run detection when thresholds change
  useEffect(() => {
    if (selectedImage && !loading && !videoStream) {
      if (uploadedFile) {
        detectFile(uploadedFile);
      } else {
        detectImage(selectedImage);
      }
    }
  }, [confidenceThreshold, overlapThreshold]);

  // 🔥 VIDEO FLOW (REAL-TIME)
  const handleVideoStreamStart = (stream: MediaStream) => {
    stopWebSocket();
    stopVideoStream(videoStream);

    setSelectedImage(null);
    setVideoStream(stream);
    setDetections([]);

    connectWebSocket();

    // wait until video element is ready and has srcObject
    setTimeout(() => {
      const video = canvasRef.current?.videoElement;
      if (video instanceof HTMLVideoElement) {
        console.log('Starting frame loop with video element:', video);
        startFrameLoop(video);
      } else {
        console.error('Video element not found or not ready');
      }
    }, 500);
  };

  const handleVideoStreamStop = () => {
    stopVideoStream(videoStream);
    stopWebSocket();
    setVideoStream(null);
    setDetections([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebSocket();
      stopVideoStream(videoStream);
    };
  }, []);

  const filteredDetections = detections;

  return (
    <div className="grid grid-cols-[320px_1fr_380px] gap-6 p-6 h-[calc(100vh-73px)]">
      {/* Left Sidebar */}
      <div className="space-y-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
            <div className="w-1.5 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
            Detection Model
          </h2>
          <SampleImages onSelectImage={handleImageSelect} />
        </div>
        

        <UploadSection
          onImageSelect={handleImageSelect}
          onFileSelect={handleFileUpload}
          onVideoStreamStart={handleVideoStreamStart}
          onVideoStreamStop={handleVideoStreamStop}
          isCameraActive={!!videoStream}
        />
      </div>

      {/* Center Canvas */}
      <div className="rounded-xl overflow-hidden border-2 border-neutral-800 shadow-2xl shadow-black/50 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 min-w-[400px] min-h-[500px] relative">
        <DetectionCanvas
          ref={canvasRef}
          imageUrl={selectedImage}
          videoStream={videoStream}
          detections={filteredDetections}
          opacityThreshold={opacityThreshold}
          labelDisplayMode={labelDisplayMode}
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-white text-lg animate-pulse">
              Detecting...
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
            <div className="w-1.5 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
            Detection Settings
          </h2>
        <ControlPanel
          confidenceThreshold={confidenceThreshold}
          overlapThreshold={overlapThreshold}
          opacityThreshold={opacityThreshold}
          labelDisplayMode={labelDisplayMode}
          detections={filteredDetections}
          onConfidenceChange={(v) => setConfidenceThreshold(v[0])}
          onOverlapChange={(v) => setOverlapThreshold(v[0])}
          onOpacityChange={(v) => setOpacityThreshold(v[0])}
          onLabelModeChange={setLabelDisplayMode}
        />
        </div>
      </div>
    </div>
  );
}