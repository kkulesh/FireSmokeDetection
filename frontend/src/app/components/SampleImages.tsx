import { Link } from 'react-router';

interface SampleImagesProps {
  onSelectImage: (url: string) => void;
}

const samples = [
  {
    url: '/test_set/test_img_1.jpg',
    label: 'Sample 1'
  },
  {
    url: '/test_set/test_img_2.jpg',
    label: 'Sample 2'
  },
  {
    url: '/test_set/test_img_3.jpg',
    label: 'Sample 3'
  },
  {
    url: '/test_set/test_img_4.webp',
    label: 'Sample 4'
  },
];

export function SampleImages({ onSelectImage }: SampleImagesProps) {
  return (
    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-5 border border-red-500/20 shadow-lg shadow-red-500/5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <div className="w-1 h-5 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
        Samples from Test Set
      </h3>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {samples.map((sample, index) => (
          <button
            key={index}
            onClick={() => onSelectImage(sample.url)}
            className="aspect-square rounded-lg overflow-hidden border-2 border-neutral-700 hover:border-orange-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 group"
          >
            <img 
              src={sample.url} 
              alt={sample.label}
              className="w-full h-full object-cover group-hover:brightness-110"
            />
          </button>
        ))}
      </div>
      <Link 
        to="/test-set"
        className="text-sm text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1 group"
      >
        View Test Set 
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}