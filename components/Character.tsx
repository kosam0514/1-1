import React, { useEffect } from 'react';
import { CharacterMood } from '../types';
import { getCharacterImageUrl, getCharacterImageDescription } from '../constants';

interface CharacterProps {
  mood: CharacterMood;
  isSpeaking: boolean;
  onImageDisplayed: (imageId: number) => void;
  imageId?: number; // Added prop for explicit image ID
}

const Character: React.FC<CharacterProps> = ({ isSpeaking, onImageDisplayed, imageId }) => {
  // If no imageId provided, default to 1
  const activeId = imageId || 1;
  const imageUrl = getCharacterImageUrl(activeId);
  const desc = getCharacterImageDescription(activeId);

  useEffect(() => {
    onImageDisplayed(activeId);
  }, [activeId, onImageDisplayed]);
  
  // Subtle breathing animation for liveliness
  const bounceClass = isSpeaking ? "scale-[1.02]" : "scale-100";
  
  return (
    <div className={`transition-all duration-500 transform ${bounceClass} flex flex-col items-center justify-end h-full w-full z-10 pointer-events-none`}>
       <div className="relative h-full max-h-[90vh] w-full flex items-end justify-center">
            <img 
                src={imageUrl} 
                alt={desc}
                title={desc}
                className="h-full w-auto object-contain drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.3))' }}
            />
       </div>
    </div>
  );
};

export default Character;