import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Download, Eye, Flame, Droplets, Image as ImageIcon, Video as VideoIcon, Play, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';

const testMedia = [
  {
    id: 1,
    url: '/test_set/test_img_1.jpg',
    name: 'test_001.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 1,
    confidence: 0.8
  },
  {
    id: 2,
    url: 'test_set/test_img_2.jpg',
    name: 'test_002.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 1,
    confidence: 0.64
  },
  {
    id: 3,
    url: '/test_set/test_vid_1.mp4',
    name: 'surveillance_001.mp4',
    type: 'fire',
    mediaType: 'video',
    detections: 1,
    confidence: 0.75,
    duration: '00:19'
  },
  {
    id: 4,
    url: 'test_set/test_img_3.jpg',
    name: 'test_003.jpg',
    type: 'safe',
    mediaType: 'image',
    detections: 0,
    confidence: 1
  },
  {
    id: 5,
    url: 'test_set/test_img_4.webp',
    name: 'test_004.webp',
    type: 'safe',
    mediaType: 'image',
    detections: 0,
    confidence: 1
  },
  {
    id: 6,
    url: '/test_set/test_vid_2.mp4',
    name: 'surveillance_002.mp4',
    type: 'fire',
    mediaType: 'video',
    detections: 1,
    confidence: 0.9,
    duration: '00:27'
  },
  {
    id: 7,
    url: 'test_set/test_img_5.jpg',
    name: 'test_005.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 1,
    confidence: 0.98
  },
  {
    id: 8,
    url: 'test_set/test_img_6.webp',
    name: 'test_006.webp',
    type: 'safe',
    mediaType: 'image',
    detections: 0,
    confidence: 1
  },
  {
    id: 10,
    url: 'test_set/test_img_7.webp',
    name: 'test_007.webp',
    type: 'smoke',
    mediaType: 'image',
    detections: 1,
    confidence: 0.83
  },
  {
    id: 11,
    url: 'test_set/test_img_8.jpg',
    name: 'test_008.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 3,
    confidence: 0.59
  },
  {
    id: 13,
    url: 'test_set/test_img_9.webp',
    name: 'test_09.webp',
    type: 'fire',
    mediaType: 'image',
    detections: 2,
    confidence: 0.61
  },
  {
    id: 14,
    url: 'test_set/test_img_10.jpg',
    name: 'test_010.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 1,
    confidence: 0.26
  },
  {
    id: 16,
    url: 'test_set/test_img_11.webp',
    name: 'test_011.webp',
    type: 'fire',
    mediaType: 'image',
    detections: 1,
    confidence: 0.97
  },
  {
    id: 17,
    url: 'test_set/test_img_12.jpg',
    name: 'test_012.jpg',
    type: 'safe',
    mediaType: 'image',
    detections: 0,
    confidence: 1
  },
  {
    id: 18,
    url: 'test_set/test_img_13.jpg',
    name: 'test_013.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 1,
    confidence: 0.78
  },
  {
    id: 19,
    url: 'test_set/test_img_14.jpg',
    name: 'test_014.jpg',
    type: 'safe',
    mediaType: 'image',
    detections: 0,
    confidence: 1
  },
  {
    id: 21,
    url: 'test_set/test_img_15.jpeg',
    name: 'test_015.jpg',
    type: 'smoke',
    mediaType: 'image',
    detections: 1,
    confidence: 0.97
  },
  {
    id: 22,
    url: 'test_set/test_img_16.jpg',
    name: 'test_016.jpg',
    type: 'safe',
    mediaType: 'image',
    detections: 0,
    confidence: 1
  },
  {
    id: 23,
    url: 'test_set/test_img_17.jpg',
    name: 'test_017.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 1,
    confidence: 0.87
  },
  {
    id: 24,
    url: 'test_set/test_img_18.webp',
    name: 'test_018.webp',
    type: 'fire',
    mediaType: 'image',
    detections: 1,
    confidence: 0.9
  },
];

// Extract first frame of a video as a data URL
function useVideoThumbnail(url: string) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    const capture = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 180;
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      // Short data URLs mean a blank/black frame — wait for seeked to try again
      if (dataUrl.length > 5000) {
        setThumbnail(dataUrl);
      }
    };

    const handleSeeked = () => capture();

    const handleLoadedMetadata = () => {
      // Seek into the video after we know its duration, avoids black frame at t=0
      video.currentTime = Math.min(0.5, video.duration / 4);
    };

    // Fallback for browsers that don't fire seeked reliably
    const handleLoadedData = () => {
      if (!thumbnail) capture();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('loadeddata', handleLoadedData, { once: true });

    video.src = url;
    video.load();

    return () => {
      cancelled = true;
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.src = '';
    };
  }, [url]);

  return thumbnail;
}

function VideoCard({ item, onClick }: { item: typeof testMedia[0]; onClick: () => void }) {
  const thumbnail = useVideoThumbnail(item.url.startsWith('http://') || item.url.startsWith('https://') ? item.url : `${window.location.origin}${item.url.startsWith('/') ? '' : '/'}${item.url}`);

  return (
    <div
      className="group relative bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl overflow-hidden border border-neutral-800 hover:border-orange-500/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-video overflow-hidden relative bg-neutral-800">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-neutral-600 animate-spin" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded flex items-center gap-1.5">
          <VideoIcon className="w-3 h-3 text-purple-400" />
          <span className="text-xs text-white font-semibold">{item.duration}</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/60 rounded-full p-4 group-hover:bg-orange-600/90 transition-colors">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="text-center">
          <Eye className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <span className="text-white text-sm font-semibold">Click to Analyze</span>
        </div>
      </div>

      <CardInfo item={item} />
    </div>
  );
}

function typeTagClass(type: string) {
  if (type === 'fire') return 'bg-red-500/20 text-red-400 border border-red-500/30';
  if (type === 'smoke') return 'bg-neutral-700/50 text-neutral-300 border border-neutral-600';
  if (type === 'safe') return 'bg-green-500/20 text-green-400 border border-green-500/30';
  return 'bg-neutral-700/50 text-neutral-300 border border-neutral-600';
}

function CardInfo({ item }: { item: typeof testMedia[0] }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {item.mediaType === 'video' && (
            <VideoIcon className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          )}
          <span className="text-white font-semibold text-sm truncate">{item.name}</span>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ml-2 ${typeTagClass(item.type)}`}>
          {item.type}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>{item.detections} detection{item.detections !== 1 ? 's' : ''}</span>
        <span className="text-green-400 font-semibold">{Math.round(item.confidence * 100)}%</span>
      </div>
    </div>
  );
}

const localFiles = testMedia.filter(item => !item.url.startsWith('http'));

export default function TestSet() {
  const [detectionFilter, setDetectionFilter] = useState<'all' | 'fire' | 'smoke'>('all');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const navigate = useNavigate();

  const filteredMedia = testMedia.filter(item => {
    const matchesDetection = detectionFilter === 'all' || item.type === detectionFilter;
    const matchesMediaType = mediaFilter === 'all' || item.mediaType === mediaFilter;
    return matchesDetection && matchesMediaType;
  });

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadProgress(0);

    try {
      const zip = new JSZip();
      const folder = zip.folder('test_set')!;

      for (let i = 0; i < localFiles.length; i++) {
        const item = localFiles[i];
        const url = item.url.startsWith('/') ? item.url : `/${item.url}`;

        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch ${url}`);
          const blob = await response.blob();
          folder.file(item.name, blob);
        } catch (err) {
          console.warn(`Skipping ${item.name}:`, err);
        }

        setDownloadProgress(Math.round(((i + 1) / localFiles.length) * 100));
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = 'test_set.zip';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const normalizeUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleMediaClick = (item: typeof testMedia[0]) => {
    const absoluteUrl = normalizeUrl(item.url);
    if (item.mediaType === 'image') {
      navigate('/', { state: { selectedImage: absoluteUrl } });
    } else {
      navigate('/', { state: { selectedVideo: absoluteUrl } });
    }
  };

  return (
    <div className="p-6 min-h-[calc(100vh-73px)]">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-orange-500 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Detection
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
              Test Set Dataset
            </h1>
            <p className="text-neutral-400">
              {filteredMedia.length} items ({testMedia.filter(m => m.mediaType === 'image').length} images, {testMedia.filter(m => m.mediaType === 'video').length} videos) • Fire & Smoke Detection Training Data
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40 min-w-[180px] justify-center"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {downloadProgress}%
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download Dataset
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-neutral-400 text-sm font-semibold w-32">Detection Type:</span>
          <div className="flex gap-2">
            <button onClick={() => setDetectionFilter('all')} className={`px-4 py-2 rounded-lg transition-all ${detectionFilter === 'all' ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
              All ({testMedia.length})
            </button>
            <button onClick={() => setDetectionFilter('fire')} className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${detectionFilter === 'fire' ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
              <Flame className="w-4 h-4" />
              Fire ({testMedia.filter(m => m.type === 'fire').length})
            </button>
            <button onClick={() => setDetectionFilter('smoke')} className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${detectionFilter === 'smoke' ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
              <Droplets className="w-4 h-4" />
              Smoke ({testMedia.filter(m => m.type === 'smoke').length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-neutral-400 text-sm font-semibold w-32">Media Type:</span>
          <div className="flex gap-2">
            <button onClick={() => setMediaFilter('all')} className={`px-4 py-2 rounded-lg transition-all ${mediaFilter === 'all' ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
              All ({testMedia.length})
            </button>
            <button onClick={() => setMediaFilter('image')} className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${mediaFilter === 'image' ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
              <ImageIcon className="w-4 h-4" />
              Images ({testMedia.filter(m => m.mediaType === 'image').length})
            </button>
            <button onClick={() => setMediaFilter('video')} className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${mediaFilter === 'video' ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>
              <VideoIcon className="w-4 h-4" />
              Videos ({testMedia.filter(m => m.mediaType === 'video').length})
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 border border-red-500/20">
          <div className="text-neutral-400 text-sm mb-1">Total Items</div>
          <div className="text-3xl font-bold text-white">{testMedia.length}</div>
        </div>
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 border border-red-500/20">
          <div className="text-neutral-400 text-sm mb-1">Images</div>
          <div className="text-3xl font-bold text-blue-400">{testMedia.filter(m => m.mediaType === 'image').length}</div>
        </div>
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 border border-red-500/20">
          <div className="text-neutral-400 text-sm mb-1">Videos</div>
          <div className="text-3xl font-bold text-purple-400">{testMedia.filter(m => m.mediaType === 'video').length}</div>
        </div>
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 border border-red-500/20">
          <div className="text-neutral-400 text-sm mb-1">Fire / Smoke</div>
          <div className="text-3xl font-bold text-orange-500">{testMedia.filter(m => m.type === 'fire').length} / {testMedia.filter(m => m.type === 'smoke').length}</div>
        </div>
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 border border-red-500/20">
          <div className="text-neutral-400 text-sm mb-1">Avg Confidence</div>
          <div className="text-3xl font-bold text-green-500">
            {Math.round(testMedia.reduce((acc, m) => acc + m.confidence, 0) / testMedia.length * 100)}%
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-4 gap-4">
        {filteredMedia.map((item) => (
          item.mediaType === 'video' ? (
            <VideoCard key={item.id} item={item} onClick={() => handleMediaClick(item)} />
          ) : (
            <div
              key={item.id}
              className="group relative bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl overflow-hidden border border-neutral-800 hover:border-orange-500/50 transition-all cursor-pointer"
              onClick={() => handleMediaClick(item)}
            >
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <span className="text-white text-sm font-semibold">Click to Analyze</span>
                </div>
              </div>

              <CardInfo item={item} />
            </div>
          )
        ))}
      </div>
    </div>
  );
}