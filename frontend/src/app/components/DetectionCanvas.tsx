import { useEffect, useRef, useState, forwardRef, useLayoutEffect } from 'react';

interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id: number;
}

interface DetectionCanvasProps {
  imageUrl: string | null;
  videoStream?: MediaStream | null;
  /** Blob URL from URL.createObjectURL(videoFile) — set by your video detection hook */
  videoFileUrl?: string | null;
  /** Ref to the <video> element inside your video detection hook that is playing the file */
  videoFileRef?: React.RefObject<HTMLVideoElement | null>;
  detections: Detection[];
  opacityThreshold: number;
  labelDisplayMode: string;
}

export interface DetectionCanvasHandle {
  videoElement: HTMLVideoElement | null;
}

export const DetectionCanvas = forwardRef<DetectionCanvasHandle, DetectionCanvasProps>(
  ({ imageUrl, videoStream, videoFileUrl, videoFileRef, detections, opacityThreshold, labelDisplayMode }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const webcamVideoRef = useRef<HTMLVideoElement>(null);
    const animationRef = useRef<number | null>(null);
    const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

    // Expose webcam video element to parent (existing behaviour)
    useLayoutEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref({ videoElement: webcamVideoRef.current });
        } else {
          ref.current = { videoElement: webcamVideoRef.current };
        }
      }
    });

    // Load image when imageUrl changes
    useEffect(() => {
      if (!imageUrl) {
        setLoadedImage(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      const handleLoad = () => setLoadedImage(img);
      const handleError = () => console.error('Failed to load image:', imageUrl);

      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
      img.src = imageUrl;

      return () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
      };
    }, [imageUrl]);

    const drawDetections = (ctx: CanvasRenderingContext2D) => {
      detections.forEach((detection) => {
        const opacity = opacityThreshold / 100;
        const color =
          detection.class === 'fire' ? '#ff4500' :
          detection.class === 'smoke' ? '#808080' :
          '#ff6b00';

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = opacity;
        ctx.strokeRect(detection.x, detection.y, detection.width, detection.height);
        ctx.globalAlpha = 1;

        if (labelDisplayMode === 'Draw Confidence') {
          const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`;
          ctx.font = 'bold 16px Arial';
          const textWidth = ctx.measureText(label).width;

          ctx.fillStyle = color;
          ctx.fillRect(detection.x, detection.y - 25, textWidth + 12, 25);

          ctx.fillStyle = '#fff';
          ctx.fillText(label, detection.x + 6, detection.y - 7);
        }
      });
    };

    // Main render loop
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const renderFrame = () => {
        // --- Branch 1: live webcam stream ---
        if (videoStream && webcamVideoRef.current) {
          const video = webcamVideoRef.current;
          if (video.readyState >= 2) {
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            drawDetections(ctx);
          }
          animationRef.current = requestAnimationFrame(renderFrame);

        // --- Branch 2: uploaded video file ---
        } else if (videoFileUrl && videoFileRef?.current) {
          const video = videoFileRef.current;
          if (video.readyState >= 2) {
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            drawDetections(ctx);
          }
          animationRef.current = requestAnimationFrame(renderFrame);

        // --- Branch 3: static image ---
        } else if (loadedImage) {
          canvas.width = loadedImage.width;
          canvas.height = loadedImage.height;
          ctx.drawImage(loadedImage, 0, 0);
          drawDetections(ctx);

        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      if (videoStream || videoFileUrl) {
        animationRef.current = requestAnimationFrame(renderFrame);
      } else {
        renderFrame();
      }

      return () => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [loadedImage, videoStream, videoFileUrl, videoFileRef, detections, opacityThreshold, labelDisplayMode]);

    // Wire webcam stream to the hidden <video> element
    useEffect(() => {
      const video = webcamVideoRef.current;
      if (!video || !videoStream) return;

      video.srcObject = videoStream;
      video.muted = true;
      video.playsInline = true;
      video.play().catch(() => {});

      return () => {
        if (video.srcObject === videoStream) {
          video.srcObject = null;
        }
      };
    }, [videoStream]);

    const hasContent = imageUrl || videoStream || videoFileUrl;

    if (!hasContent) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-600/20 to-orange-600/20 flex items-center justify-center border-2 border-red-500/30">
              <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-neutral-400">No image selected</p>
            <p className="text-sm text-neutral-500 mt-2">Upload an image or select from test samples</p>
          </div>
        </div>
      );
    }

    const hasFire = detections.some(d => d.class === 'fire');
    const hasSmoke = detections.some(d => d.class === 'smoke');

    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain"
        />
        {/* Hidden video element for webcam — video file element lives in the hook */}
        <video ref={webcamVideoRef} className="hidden" />

        {/* Status badge */}
        <div className="absolute bottom-4 right-4 bg-neutral-900/90 backdrop-blur-sm px-5 py-3 rounded-lg border border-red-500/30">
          {hasFire ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔴</span>
              <div>
                <div className="text-red-500 font-bold text-sm">Red Level</div>
                <div className="text-red-400 text-xs">Fire Detected</div>
              </div>
            </div>
          ) : hasSmoke ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟡</span>
              <div>
                <div className="text-yellow-500 font-bold text-sm">Yellow Level</div>
                <div className="text-yellow-400 text-xs">Smoke Detected</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟢</span>
              <div>
                <div className="text-green-500 font-bold text-sm">Green Level</div>
                <div className="text-green-400 text-xs">Safe</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);