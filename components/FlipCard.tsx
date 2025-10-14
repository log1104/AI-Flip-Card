import React, { useState } from 'react';

interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  onDelete: () => void;
  onEdit: () => void;
  // Optional controlled flipping support
  flipped?: boolean; // when provided, controls the flip state
  onFlip?: () => void; // called whenever a flip is requested
  // Presentation options
  showActions?: boolean; // show edit/delete on back face, default true
  showFlipHint?: boolean; // show finger + "Flip" on front face, default true
  className?: string; // allow parent to override size for special contexts
}

const FlipCard: React.FC<FlipCardProps> = ({
  frontContent,
  backContent,
  onDelete,
  onEdit,
  flipped,
  onFlip,
  showActions = true,
  showFlipHint = true,
  className,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isControlled = flipped !== undefined;
  const isFlipped = isControlled ? !!flipped : internalFlipped;

  const handleFlip = () => {
    if (isControlled) {
      onFlip?.();
    } else {
      setInternalFlipped((prev) => !prev);
      onFlip?.();
    }
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={`w-full max-w-xs h-56 [perspective:1200px] cursor-pointer group ${className ?? ''}`}
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
        <div className="flip-front-surface absolute w-full h-full [backface-visibility:hidden] rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-100 p-4">
          {frontContent}
          {showFlipHint && (
            <div className="absolute bottom-4 right-4 flex items-center text-gray-400 dark:text-gray-500">
              <span className="material-icons text-base">touch_app</span>
              <span className="ml-1 text-xs font-medium">Flip</span>
            </div>
          )}
        </div>

  {/* Back Face */}
  <div className="flip-back-surface absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl shadow-md bg-blue-600 text-white p-4 flex flex-col">
          <div className="flex-grow">
            {backContent}
          </div>
          {showActions && (
            <div className="flex justify-end items-center gap-2 -mr-1 -mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleEdit}
                className="inline-flex items-center justify-center rounded-full p-2 text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/80"
                aria-label="Edit card"
              >
                <span className="material-icons text-lg">edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center justify-center rounded-full p-2 text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/80"
                aria-label="Delete card"
              >
                <span className="material-icons text-lg">delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
