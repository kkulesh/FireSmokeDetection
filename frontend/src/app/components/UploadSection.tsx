import { Upload, Link, Camera } from 'lucide-react';
import { useRef, useState } from 'react';

interface UploadSectionProps {
  onImageSelect: (url: string) => void;
  onFileSelect: (file: File) => void;
  onVideoFileSelect: (file: File) => void;
  onVideoStreamStart: (stream: MediaStream) => void;
  onVideoStreamStop: () => void;
  isCameraActive: boolean;
}

export function UploadSection({ onImageSelect, onFileSelect, onVideoFileSelect, onVideoStreamStart, onVideoStreamStop, isCameraActive }: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file.type.startsWith('video/')) {
      onVideoFileSelect(file);
    } else {
      onFileSelect(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      onImageSelect(imageUrl);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      onVideoStreamStart(stream);

      await fetch('http://127.0.0.1:8000/video/start-webcam', {
        method: 'POST',
      });

      setStatus('Camera connected and detection started');
    } catch (error) {
      console.error(error);
      setStatus('Camera Access Denied');
    }
  };

  const stopWebcam = () => {
    onVideoStreamStop();
    setStatus('Camera stopped');
  };

  return (
    <div className="space-y-4">
      {/* Upload File */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 border border-red-500/20 shadow-lg shadow-red-500/5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
          Upload Image or Video File
        </h3>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
            ${isDragging
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-neutral-700 hover:border-orange-500/50 bg-neutral-800/30 hover:bg-neutral-800/50'
            }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600/20 to-orange-600/20 flex items-center justify-center border border-orange-500/30">
              <Upload className={`w-6 h-6 ${isDragging ? 'text-orange-400' : 'text-orange-500'}`} />
            </div>
            <p className="text-neutral-400">
              {isDragging ? 'Drop to upload' : 'Drop file here or'}
            </p>
            {!isDragging && (
              <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors border border-neutral-600 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Select File
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* Image URL */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 border border-red-500/20 shadow-lg shadow-red-500/5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
          Image URL
        </h3>
        <form onSubmit={handleUrlSubmit} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste a link..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-10 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        </form>
      </div>

      {/* Webcam */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 border border-red-500/20 shadow-lg shadow-red-500/5">
        <button
          onClick={isCameraActive ? stopWebcam : startWebcam}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40 flex items-center justify-center gap-2 font-semibold"
        >
          <Camera className="w-5 h-5" />
          {isCameraActive ? 'Stop Camera' : 'Try With Webcam'}
        </button>

        <p className="text-sm text-red-400 mt-3 text-center">
          {status || (isCameraActive ? 'Camera active' : 'Click to start webcam')}
        </p>
      </div>
    </div>
  );
}