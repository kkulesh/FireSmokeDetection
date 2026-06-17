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

  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(false);

  const normalizeUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const [videoFileUrl, setVideoFileUrl] = useState<string | null>(null);
  const videoFileRef = useRef<HTMLVideoElement>(null);
  const videoFileIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const revokeObjectUrl = (url: string | null) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const [confidenceThreshold, setConfidenceThreshold] = useState(20);
  const [overlapThreshold, setOverlapThreshold] = useState(73);
  const [opacityThreshold, setOpacityThreshold] = useState(100);
  const [labelDisplayMode, setLabelDisplayMode] = useState('Draw Confidence');

  const canvasRef = useRef<DetectionCanvasHandle>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const frameLoopRef = useRef<number | null>(null);
  const processingRef = useRef<boolean>(false);

  // API for image detection
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

  // API for image file detection
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

  // WebSocket connect (for webcam)
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
        processingRef.current = false;
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

  // Send frames loop for webcam (WebSocket)
  const startFrameLoop = (video: HTMLVideoElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const frameInterval = 100;
    let lastFrameTime = 0;

    const sendFrame = () => {
      const currentTime = Date.now();

      if (currentTime - lastFrameTime < frameInterval) {
        frameLoopRef.current = setTimeout(sendFrame, frameInterval - (currentTime - lastFrameTime)) as unknown as number;
        return;
      }

      if (!video || video.readyState < 2) {
        frameLoopRef.current = setTimeout(sendFrame, 50) as unknown as number;
        return;
      }

      try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (canvas.width === 0 || canvas.height === 0) {
          frameLoopRef.current = setTimeout(sendFrame, 50) as unknown as number;
          return;
        }

        ctx?.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.6);

        if (wsRef.current?.readyState === WebSocket.OPEN && !processingRef.current) {
          processingRef.current = true;
          lastFrameTime = currentTime;
          wsRef.current.send(JSON.stringify({
            frame: base64,
            overlap_threshold: overlapThreshold,
            confidence_threshold: confidenceThreshold,
          }));
        }
      } catch (err) {
        console.error('Frame capture error:', err);
      }

      frameLoopRef.current = setTimeout(sendFrame, frameInterval) as unknown as number;
    };

    sendFrame();
  };

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

  // Video file detection via /detect/frame polling
  const startVideoFileDetection = (file: File) => {
    stopVideoFileDetection();
    stopWebSocket();
    stopVideoStream(videoStream);

    setVideoStream(null);
    setUploadedFile(file);
    setDetections([]);

    const url = URL.createObjectURL(file);
    setActiveMedia({ type: 'video', url });
    setVideoFileUrl(url);

    // Give the <video> element time to load the src
    setTimeout(() => {
      const video = videoFileRef.current;
      if (!video) return;

      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.play().catch(() => {});

      const captureCanvas = document.createElement('canvas');
      const ctx = captureCanvas.getContext('2d');

      videoFileIntervalRef.current = setInterval(async () => {
        if (!video || video.paused || video.ended || video.readyState < 2) return;
        if (!ctx) return;

        captureCanvas.width = video.videoWidth;
        captureCanvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const frameData = captureCanvas.toDataURL('image/jpeg', 0.8);

        try {
          const response = await fetch('http://localhost:8000/detect/frame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              frame_data: frameData,
              overlap_threshold: overlapThreshold,
              confidence_threshold: confidenceThreshold,
            }),
          });
          const data = await response.json();
          if (data.detections) {
            setDetections(data.detections);
          }
        } catch (err) {
          console.error('Video frame detection error:', err);
        }
      }, 100); // ~107 fps for detection; canvas renders at full speed
    }, 100);
  };

  const stopVideoFileDetection = () => {
    if (videoFileIntervalRef.current) {
      clearInterval(videoFileIntervalRef.current);
      videoFileIntervalRef.current = null;
    }
    if (videoFileRef.current) {
      videoFileRef.current.pause();
      videoFileRef.current.src = '';
    }
    revokeObjectUrl(videoFileUrl);
    setVideoFileUrl(null);
    if (activeMedia?.type === 'video') {
      setActiveMedia(null);
    }
    setDetections([]);
  };

  // Handle navigation media state
  useEffect(() => {
    if (location.state?.selectedImage) {
      handleImageSelect(location.state.selectedImage);
    } else if (location.state?.selectedVideo) {
      handleVideoSelection(location.state.selectedVideo);
    }
  }, [location.state]);

  // IMAGE FLOW
  const handleImageSelect = (url: string) => {
    stopWebSocket();
    stopVideoStream(videoStream);
    stopVideoFileDetection();

    setVideoStream(null);
    setUploadedFile(null);
    setDetections([]);

    const imageUrl = normalizeUrl(url);
    setActiveMedia({ type: 'image', url: imageUrl });

    detectImage(imageUrl);
  };

  const handleVideoSelection = (url: string) => {
    stopWebSocket();
    stopVideoStream(videoStream);
    stopVideoFileDetection();

    setUploadedFile(null);
    setDetections([]);

    const videoUrl = normalizeUrl(url);
    setActiveMedia({ type: 'video', url: videoUrl });
    setVideoFileUrl(videoUrl);

    if (videoFileRef.current) {
      const video = videoFileRef.current;
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;
      video.play().catch(() => {});
    }

    setTimeout(() => {
      const video = videoFileRef.current;
      if (!video) return;

      const captureCanvas = document.createElement('canvas');
      const ctx = captureCanvas.getContext('2d');

      videoFileIntervalRef.current = setInterval(async () => {
        if (!video || video.paused || video.ended || video.readyState < 2) return;
        if (!ctx) return;

        captureCanvas.width = video.videoWidth;
        captureCanvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
        const frameData = captureCanvas.toDataURL('image/jpeg', 0.8);

        try {
          const response = await fetch('http://localhost:8000/detect/frame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              frame_data: frameData,
              overlap_threshold: overlapThreshold,
              confidence_threshold: confidenceThreshold,
            }),
          });
          const data = await response.json();
          if (data.detections) {
            setDetections(data.detections);
          }
        } catch (err) {
          console.error('Video frame detection error:', err);
        }
      }, 150);
    }, 150);
  };

  const handleFileUpload = async (file: File) => {
    stopWebSocket();
    stopVideoStream(videoStream);
    stopVideoFileDetection();

    setVideoStream(null);
    const objectUrl = URL.createObjectURL(file);
    setActiveMedia({ type: 'image', url: objectUrl });
    setUploadedFile(file);

    await detectFile(file);
  };

  // VIDEO FILE FLOW
  const handleVideoFileSelect = (file: File) => {
    startVideoFileDetection(file);
  };

  // Re-run detection when thresholds change (images only)
  useEffect(() => {
    if (activeMedia?.type === 'image' && !loading && !videoStream && !videoFileUrl) {
      if (uploadedFile) {
        detectFile(uploadedFile);
      } else {
        detectImage(activeMedia.url);
      }
    }
  }, [confidenceThreshold, overlapThreshold]);

  // WEBCAM FLOW
  const handleVideoStreamStart = (stream: MediaStream) => {
    stopWebSocket();
    stopVideoStream(videoStream);
    stopVideoFileDetection();

    setActiveMedia(null);
    setVideoFileUrl(null);
    setVideoStream(stream);
    setDetections([]);

    connectWebSocket();

    setTimeout(() => {
      const video = canvasRef.current?.videoElement;
      if (video instanceof HTMLVideoElement) {
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
      stopVideoFileDetection();
    };
  }, []);

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
          onVideoFileSelect={handleVideoFileSelect}
          onVideoStreamStart={handleVideoStreamStart}
          onVideoStreamStop={handleVideoStreamStop}
          isCameraActive={!!videoStream}
        />
      </div>

      {/* Center Canvas */}
      <div className="rounded-xl overflow-hidden border-2 border-neutral-800 shadow-2xl shadow-black/50 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 min-w-[400px] min-h-[500px] relative">
        <DetectionCanvas
          ref={canvasRef}
          imageUrl={activeMedia?.type === 'image' ? activeMedia.url : null}
          videoStream={videoStream}
          videoFileUrl={activeMedia?.type === 'video' ? videoFileUrl : null}
          videoFileRef={videoFileRef}
          detections={detections}
          opacityThreshold={opacityThreshold}
          labelDisplayMode={labelDisplayMode}
        />

        {/* Hidden video element used for uploaded file playback (frames are captured from this) */}
        <video ref={videoFileRef} className="hidden" />

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
            detections={detections}
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