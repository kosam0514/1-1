import React from 'react';
import { getCharacterImageUrl, getCharacterImageDescription } from '../constants';

interface GalleryProps {
  collectedIds: Set<number>;
  onClose: () => void;
  totalImages: number;
}

const Gallery: React.FC<GalleryProps> = ({ collectedIds, onClose, totalImages }) => {
  // Generate array of IDs from 1 to totalImages
  const allIds = Array.from({ length: totalImages }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-pink-400 tracking-wider">PHOTO COLLECTION</h2>
        <button 
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-10">
          {allIds.map((id) => {
            const isUnlocked = collectedIds.has(id);
            const description = getCharacterImageDescription(id);
            
            return (
              <div key={id} className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 bg-gray-800 shadow-lg">
                {isUnlocked ? (
                  <>
                    <img 
                      src={getCharacterImageUrl(id)}
                      alt={description}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <p className="text-white text-sm font-medium leading-snug drop-shadow-md">
                        {description}
                      </p>
                      <p className="text-pink-400 text-xs font-bold mt-1">#{id.toString().padStart(2, '0')}</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2 bg-gray-900">
                    <span className="text-4xl opacity-50">🔒</span>
                    <span className="text-xs font-mono opacity-50">LOCKED</span>
                    <span className="absolute bottom-2 right-2 text-gray-700 text-xs">#{id.toString().padStart(2, '0')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 text-center text-gray-400 bg-black/50 p-2 rounded-lg backdrop-blur">
        Collected: <span className="text-pink-400 font-bold">{collectedIds.size}</span> / {totalImages}
      </div>
    </div>
  );
};

export default Gallery;