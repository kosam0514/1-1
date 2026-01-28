import React from 'react';

interface ChoiceOverlayProps {
  choices: string[];
  onSelect: (choice: string) => void;
  visible: boolean;
}

const ChoiceOverlay: React.FC<ChoiceOverlayProps> = ({ choices, onSelect, visible }) => {
  if (!visible) return null;

  return (
    <div className="w-full h-full flex flex-col justify-center p-4 md:p-6 bg-black/20 md:bg-transparent">
        <div className="text-pink-400/80 text-xs font-bold uppercase tracking-widest mb-2 pl-1">
          Make a Choice
        </div>
        
        <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar max-h-full pr-2">
          {choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(choice)}
              className="group relative w-full text-left bg-white/5 hover:bg-pink-600 text-gray-200 hover:text-white font-medium py-3 px-5 rounded-lg border border-white/10 hover:border-pink-400 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm md:text-lg">{choice}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">◀</span>
              </div>
            </button>
          ))}
        </div>
    </div>
  );
};

export default ChoiceOverlay;