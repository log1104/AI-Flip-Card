import React, { useState, useImperativeHandle, forwardRef } from 'react';

interface StudyCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  initialFlipped?: boolean;
  onFlip?: () => void;
  className?: string;
}

export interface StudyCardHandle {
  flip: () => void;
}

const StudyCard = forwardRef<StudyCardHandle, StudyCardProps>(
  ({ frontContent, backContent, initialFlipped, onFlip, className }, ref) => {
    const [isFlipped, setIsFlipped] = useState(initialFlipped ?? false);

    const handleFlip = () => {
      setIsFlipped((prev) => {
        const next = !prev;
        onFlip?.();
        return next;
      });
    };

    useImperativeHandle(ref, () => ({
      flip: () => {
        handleFlip();
      },
    }));

    const containerClass = `${className ?? 'w-full max-w-2xl h-[60vh]'} [perspective:1000px] cursor-pointer group`;

    return (
      <div
        className={containerClass}
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
          <div className="flip-front-surface absolute w-full h-full [backface-visibility:hidden] rounded-3xl shadow-2xl bg-white p-8 overflow-y-auto">
            {frontContent}
          </div>
          <div className="flip-back-surface absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl shadow-2xl bg-blue-600 text-white p-8 overflow-y-auto">
            {backContent}
          </div>
        </div>
      </div>
    );
  }
);

export default StudyCard;

