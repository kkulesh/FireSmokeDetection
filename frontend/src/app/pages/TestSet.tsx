import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Download, Eye, Flame, Droplets, Image as ImageIcon, Video as VideoIcon, Play } from 'lucide-react';
import { useState } from 'react';

const testMedia = [
  {
    id: 1,
    url: '/test_set/test_img_1.jpg',
    name: 'test_001.jpg',
    type: 'smoke',
    mediaType: 'image',
    detections: 2,
    confidence: 0.92
  },
  {
    id: 2,
    url: 'test_set/test_img_2.jpg',
    name: 'test_002.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 3,
    confidence: 0.89
  },
  {
    id: 3,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1771217731629-4d2f7f4d9e43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxmaXJlJTIwc21va2UlMjB2aWRlbyUyMHN1cnZlaWxsYW5jZXxlbnwxfHx8fDE3NzYxNTAwNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'surveillance_001.mp4',
    type: 'fire',
    mediaType: 'video',
    detections: 5,
    confidence: 0.91,
    duration: '00:12'
  },
  {
    id: 4,
    url: 'test_set/test_img_3.jpg',
    name: 'test_003.jpg',
    type: 'smoke',
    mediaType: 'image',
    detections: 1,
    confidence: 0.95
  },
  {
    id: 5,
    url: 'test_set/test_img_4.jpg',
    name: 'test_004.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 4,
    confidence: 0.87
  },
  {
    id: 6,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1726004500553-dd7bd1921731?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxmaXJlJTIwc21va2UlMjB2aWRlbyUyMHN1cnZlaWxsYW5jZXxlbnwxfHx8fDE3NzYxNTAwNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'surveillance_002.mp4',
    type: 'smoke',
    mediaType: 'video',
    detections: 3,
    confidence: 0.88,
    duration: '00:15'
  },
  {
    id: 7,
    url: 'test_set/test_img_5.jpg',
    name: 'test_005.jpg',
    type: 'smoke',
    mediaType: 'image',
    detections: 2,
    confidence: 0.91
  },
  {
    id: 8,
    url: 'test_set/test_img_6.png',
    name: 'test_006.jpg',
    type: 'smoke',
    mediaType: 'image',
    detections: 1,
    confidence: 0.88
  },
  {
    id: 9,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1658870185241-0a4e1e77d709?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxmaXJlJTIwc21va2UlMjB2aWRlbyUyMHN1cnZlaWxsYW5jZXxlbnwxfHx8fDE3NzYxNTAwNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'surveillance_003.mp4',
    type: 'fire',
    mediaType: 'video',
    detections: 6,
    confidence: 0.94,
    duration: '00:18'
  },
  {
    id: 10,
    url: 'test_set/test_img_7.webp',
    name: 'test_007.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 2,
    confidence: 0.93
  },
  {
    id: 11,
    url: 'test_set/test_img_8.jpg',
    name: 'test_008.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 5,
    confidence: 0.86
  },
  {
    id: 12,
    url: 'test_vid_1.mp4',
    thumbnail: 'test_vid_1.mp4',
    name: 'surveillance_004.mp4',
    type: 'smoke',
    mediaType: 'video',
    detections: 4,
    confidence: 0.90,
    duration: '00:20'
  },
  {
    id: 13,
    url: 'test_set/test_img_9.webp',
    name: 'test_09.png',
    type: 'fire',
    mediaType: 'image',
    detections: 2,
    confidence: 0.94
  },
  {
    id: 14,
    url: 'test_set/test_img_10.jpg',
    name: 'test_010.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 3,
    confidence: 0.85
  },
  {
    id: 15,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket//ForBiggerMeltdowns.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1611459000593-15257647a0fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbGFtZXMlMjBidXJuaW5nJTIwb3JhbmdlfGVufDF8fHx8MTc3Mzg4ODg1OHww&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'surveillance_005.mp4',
    type: 'fire',
    mediaType: 'video',
    detections: 7,
    confidence: 0.92,
    duration: '00:22'
  },
  {
    id: 16,
    url: 'test_set/test_img_11.webp',
    name: 'test_011.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 4,
    confidence: 0.92
  },
  {
    id: 17,
    url: 'test_set/test_img_12.jpg',
    name: 'test_012.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 4,
    confidence: 0.92
  },
  {
    id: 18,
    url: 'test_set/test_img_13.jpg',
    name: 'test_013.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 4,
    confidence: 0.92
  },
  {
    id: 19,
    url: 'test_set/test_img_14.jpg',
    name: 'test_014.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 4,
    confidence: 0.92
  },
  {
    id: 20,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1611459000593-15257647a0fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbGFtZXMlMjBidXJuaW5nJTIwb3JhbmdlfGVufDF8fHx8MTc3Mzg4ODg1OHww&ixlib=rb-4.1.0&q=80&w=1080',
    name: 'surveillance_005.mp4',
    type: 'fire',
    mediaType: 'video',
    detections: 7,
    confidence: 0.92,
    duration: '00:22'
  },
  {
    id: 21,
    url: 'test_set/test_img_15.jpg',
    name: 'test_015.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 4,
    confidence: 0.92
  },
  {
    id: 22,
    url: 'test_set/test_img_16.jpg',
    name: 'test_016.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 4,
    confidence: 0.92
  },
  {
    id: 23,
    url: 'test_set/test_img_17.jpg',
    name: 'test_017.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 4,
    confidence: 0.92
  },
  {
    id: 24,
    url: 'test_set/test_img_18.jpeg',
    name: 'test_018.jpg',
    type: 'fire',
    mediaType: 'image',
    detections: 4,
    confidence: 0.92
  },
];

export default function TestSet() {
  const [detectionFilter, setDetectionFilter] = useState<'all' | 'fire' | 'smoke'>('all');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const navigate = useNavigate();

  const filteredMedia = testMedia.filter(item => {
    const matchesDetection = detectionFilter === 'all' || item.type === detectionFilter;
    const matchesMediaType = mediaFilter === 'all' || item.mediaType === mediaFilter;
    return matchesDetection && matchesMediaType;
  });

  const handleMediaClick = (item: typeof testMedia[0]) => {
    // For images, navigate to home with the image
    if (item.mediaType === 'image') {
      // Convert relative URLs to absolute URLs
      const absoluteUrl = item.url.startsWith('http') 
        ? item.url 
        : `${window.location.origin}${item.url.startsWith('/') ? '' : '/'}${item.url}`;
      navigate('/', { state: { selectedImage: absoluteUrl } });
    } else {
      // For videos, use the thumbnail (already absolute URL)
      navigate('/', { state: { selectedImage: item.thumbnail } });
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

          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40">
            <Download className="w-5 h-5" />
            Download Dataset
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Detection Type Filter */}
        <div className="flex items-center gap-4">
          <span className="text-neutral-400 text-sm font-semibold w-32">Detection Type:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setDetectionFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                detectionFilter === 'all'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              All ({testMedia.length})
            </button>
            <button
              onClick={() => setDetectionFilter('fire')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                detectionFilter === 'fire'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              <Flame className="w-4 h-4" />
              Fire ({testMedia.filter(m => m.type === 'fire').length})
            </button>
            <button
              onClick={() => setDetectionFilter('smoke')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                detectionFilter === 'smoke'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              <Droplets className="w-4 h-4" />
              Smoke ({testMedia.filter(m => m.type === 'smoke').length})
            </button>
          </div>
        </div>

        {/* Media Type Filter */}
        <div className="flex items-center gap-4">
          <span className="text-neutral-400 text-sm font-semibold w-32">Media Type:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setMediaFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                mediaFilter === 'all'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              All ({testMedia.length})
            </button>
            <button
              onClick={() => setMediaFilter('image')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                mediaFilter === 'image'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Images ({testMedia.filter(m => m.mediaType === 'image').length})
            </button>
            <button
              onClick={() => setMediaFilter('video')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                mediaFilter === 'video'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/20'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
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
          <div
            key={item.id}
            className="group relative bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl overflow-hidden border border-neutral-800 hover:border-orange-500/50 transition-all cursor-pointer"
            onClick={() => handleMediaClick(item)}
          >
            <div className="aspect-video overflow-hidden relative">
              {item.mediaType === 'image' ? (
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <>
                  <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Video indicator */}
                  <div className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded flex items-center gap-1.5">
                    <VideoIcon className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-white font-semibold">{item.duration}</span>
                  </div>
                  {/* Play icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 rounded-full p-4 group-hover:bg-orange-600/90 transition-colors">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-center">
                <Eye className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <span className="text-white text-sm font-semibold">Click to Analyze</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {item.mediaType === 'video' && (
                    <VideoIcon className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  )}
                  <span className="text-white font-semibold text-sm truncate">{item.name}</span>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ml-2 ${
                  item.type === 'fire'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-neutral-700/50 text-neutral-300 border border-neutral-600'
                }`}>
                  {item.type}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>{item.detections} detection{item.detections > 1 ? 's' : ''}</span>
                <span className="text-green-400 font-semibold">{Math.round(item.confidence * 100)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}