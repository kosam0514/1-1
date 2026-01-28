import React, { useEffect, useState } from 'react';

interface DialogueBoxProps {
  speaker: string;
  text: string;
  narrative: string;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ speaker, text, narrative }) => {
  const [displayedText, setDisplayedText] = useState('');
  const cleanText = text ? text.trim() : '';
  
  const isHeroine = speaker.includes('루루') || speaker === 'Ruru';
  const nameTagColor = isHeroine ? 'text-pink-400' : 'text-blue-400';

  useEffect(() => {
    setDisplayedText('');
    
    if (!cleanText) return;

    let i = 0;
    const speed = 20; 
    
    const interval = setInterval(() => {
      i++;
      setDisplayedText(cleanText.slice(0, i));
      
      if (i >= cleanText.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [cleanText]);

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-8">
        {/* Speaker Name */}
        <div className={`text-2xl font-bold mb-3 ${nameTagColor} drop-shadow-md`}>
             {speaker}
        </div>

        {/* Main Dialogue Text */}
        <div className="flex-grow text-white text-xl md:text-2xl font-medium leading-relaxed overflow-y-auto custom-scrollbar">
          {displayedText}
          <span className="animate-pulse inline-block w-2 h-5 bg-pink-400 ml-1 align-middle"></span>
        </div>

        {/* Narrative Section (Info) */}
        {narrative && (
          <div className="mt-4 pt-3 border-t border-white/10 text-gray-400 text-sm md:text-base italic flex items-start gap-2">
            <span className="text-pink-500 font-bold shrink-0">INFO</span>
            <span>{narrative}</span>
          </div>
        )}
    </div>
  );
};

export default DialogueBox;