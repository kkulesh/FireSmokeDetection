import { Link } from 'react-router';

interface SampleImagesProps {
  onSelectImage: (url: string) => void;
}

const samples = [
  {
    url: 'https://images.unsplash.com/photo-1767672857994-73a27b723506?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlJTIwc21va2UlMjBkZXRlY3RvcnxlbnwxfHx8fDE3NzM4ODcxNTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Sample 1'
  },
  {
    url: 'https://images.unsplash.com/photo-1648464676756-1ca51d0c4688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjBmaXJlJTIwZmxhbWVzfGVufDF8fHx8MTc3Mzg4NzE1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Sample 2'
  },
  {
    url: 'https://images.unsplash.com/photo-1764239651070-1ffc8f96a4ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWlsZGluZyUyMHNtb2tlJTIwZmlyZXxlbnwxfHx8fDE3NzM4ODcxNTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    label: 'Sample 3'
  },
  {
    url: 'https://images.unsplash.com/photo-1748260526738-056fceff3cfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkZmlyZSUyMG9yYW5nZSUyMGZsYW1lc3xlbnwxfHx8fDE3NzM4ODcxNTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
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