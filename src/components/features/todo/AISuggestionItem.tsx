import React, { useRef, useEffect } from 'react';
import { AISuggestionItemProps } from './types';

/**
 * AISuggestionItem component - Represents a single AI-generated todo suggestion
 * @component
 * @param {AISuggestionItemProps} props - The component props
 * @returns {React.ReactElement} An editable AI suggestion with approve/delete actions
 */
export const AISuggestionItem: React.FC<AISuggestionItemProps> = ({ 
  suggestion, 
  onUpdate, 
  onApprove, 
  onDelete 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [suggestion.text]);

  return (
    <div className="flex items-center mb-2 relative group">
      <div className="flex-1 flex items-center gap-2">
        <textarea
          ref={textareaRef}
          value={suggestion.text}
          onChange={(e) => onUpdate(suggestion.id, e.target.value)}
          className="flex-1 px-0 py-0 border-none rounded bg-transparent text-white text-lg resize-none w-full focus:outline-none"
          style={{
            lineHeight: '1.5',
            overflow: 'hidden',
            height: 'auto',
          }}
          rows={1}
          aria-label="AI suggestion text"
        />
        <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap">
          <span className="text-sm">✨</span> AI
        </span>
        <div className="flex items-center gap-2">
          <button
            className="text-green-400 hover:text-green-300 transition-colors"
            onClick={() => onApprove(suggestion.id, 'today')}
            title="Approve"
            aria-label="Approve suggestion"
          >
            ✓
          </button>
          <button
            className="text-red-400 hover:text-red-300 transition-colors"
            onClick={() => onDelete(suggestion.id)}
            title="Remove"
            aria-label="Delete suggestion"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};
