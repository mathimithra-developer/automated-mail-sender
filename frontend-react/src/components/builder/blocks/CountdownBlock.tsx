import React, { useState, useEffect } from 'react';
import { CountdownBlockData } from '../types';

interface CountdownBlockProps {
  block: CountdownBlockData;
  isSelected: boolean;
  onSelect: () => void;
}

export const CountdownBlock: React.FC<CountdownBlockProps> = ({
  block,
  isSelected,
  onSelect,
}) => {
  const {
    deadline = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
    label = 'Limited Time Offer Ends In:',
    backgroundColor = '#0f172a',
    accentColor = '#3b82f6',
  } = block.content;

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(deadline).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const intervalId = setInterval(calculateTimeLeft, 1000);

    // Clean up interval on unmount to prevent memory leaks
    return () => clearInterval(intervalId);
  }, [deadline]);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`builder-block-wrapper ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'relative',
        padding: '20px',
        margin: '4px 0',
        borderRadius: '8px',
        cursor: 'pointer',
        background: backgroundColor,
        color: '#ffffff',
        textAlign: 'center',
        border: isSelected ? '2px solid #3b82f6' : '1px dashed transparent',
        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none',
        transition: 'all 0.15s',
      }}
    >
      <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
        {label}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        {[
          { label: 'DAYS', val: timeLeft.days },
          { label: 'HOURS', val: timeLeft.hours },
          { label: 'MINS', val: timeLeft.minutes },
          { label: 'SECS', val: timeLeft.seconds },
        ].map((unit, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '10px 14px',
              borderRadius: 6,
              minWidth: 54,
              border: `1px solid ${accentColor}`,
            }}
          >
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
              {String(unit.val).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: accentColor, marginTop: 4 }}>
              {unit.label}
            </div>
          </div>
        ))}
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
          Countdown
        </div>
      )}
    </div>
  );
};
