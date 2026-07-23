import React from 'react';
import { RatingBlockData } from '../types';
import { Star } from 'lucide-react';

interface RatingBlockProps {
  block: RatingBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const RatingBlock: React.FC<RatingBlockProps> = ({ block }) => {
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
    <div style={{ padding: '4px 0', width: '100%', boxSizing: 'border-box' }}>
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
    </div>
  );
};
