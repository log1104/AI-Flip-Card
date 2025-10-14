
import React, { useState, useImperativeHandle, forwardRef } from 'react';

interface StudyCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  initialFlipped?: boolean;
}

export interface StudyCardHandle {
  flip: () => void;
}

const StudyCard = forwardRef<StudyCardHandle, StudyCardProps>(({ frontContent, backContent, initialFlipped }, ref) => {
  const [isFlipped, setIsFlipped] = useState(initialFlipped ?? false);

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  useImperativeHandle(ref, () => ({
    flip: () => {
      handleFlip();
    },
  }));

  return (
    <div
      className="w-full max-w-2xl h-[50vh] [perspective:1000px] cursor-pointer group"
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleFlip()}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front Face */}
        <div className="flip-front-surface absolute w-full h-full [backface-visibility:hidden] rounded-xl shadow-2xl bg-white p-6 overflow-y-auto">
          {frontContent}
        </div>

        {/* Back Face */}
        <div className="flip-back-surface absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl shadow-2xl bg-blue-600 text-white p-6 overflow-y-auto">
          {backContent}
        </div>
      </div>
    </div>
  );
});

export default StudyCard;
