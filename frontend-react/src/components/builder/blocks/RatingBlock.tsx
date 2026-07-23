import React from 'react';
import { RatingBlockData } from '../types';
import { Star } from 'lucide-react';

interface RatingBlockProps {
  block: RatingBlockData;
  isSelected: boolean;
  onSelect: () => void;
}

export const RatingBlock: React.FC<RatingBlockProps> = ({
  block,
  isSelected,
  onSelect,
}) => {
  const {
    maxStars = 5,
    ratingValue = 4.5,
    url = '#',
    color = '#f59e0b',
    size = 24,
    align = 'center',
  } = block.content;

  const starsArray = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`builder-block-wrapper ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'relative',
        padding: '12px 16px',
        margin: '4px 0',
        borderRadius: '6px',
        cursor: 'pointer',
        border: isSelected ? '2px solid #3b82f6' : '1px dashed transparent',
        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <div style={{ textAlign: align }}>
        <a
          href={url || '#'}
          onClick={(e) => e.preventDefault()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            textDecoration: 'none',
            pointerEvents: 'none',
          }}
        >
          {starsArray.map((num) => {
            const isFilled = num <= Math.floor(ratingValue);
            const isHalf = !isFilled && num - 0.5 <= ratingValue;

            return (
              <Star
                key={num}
                size={size}
                style={{
                  color: color,
                  fill: isFilled ? color : isHalf ? 'url(#halfGrad)' : 'transparent',
                }}
              />
            );
          })}
        </a>
      </div>

      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: 12,
            background: '#3b82f6',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
          }}
        >
          Rating ({ratingValue}/{maxStars})
        </div>
      )}
    </div>
  );
};
