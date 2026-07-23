import React from 'react';
import { ArrowUp, ArrowDown, Copy, Trash2 } from 'lucide-react';

export interface BlockActionToolbarProps {
  isSelected: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const BlockActionToolbar: React.FC<BlockActionToolbarProps> = ({
  isSelected,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}) => {
  if (!isSelected) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: -12,
        right: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        background: '#ffffff',
        padding: '3px 6px',
        borderRadius: 20,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        zIndex: 20,
      }}
    >
      {/* Move Up */}
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        title="Move Up"
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          background: '#2563eb',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canMoveUp ? 'pointer' : 'not-allowed',
          opacity: canMoveUp ? 1 : 0.35,
          pointerEvents: canMoveUp ? 'auto' : 'none',
          transition: 'background-color 0.15s, opacity 0.15s',
        }}
      >
        <ArrowUp size={13} />
      </button>

      {/* Move Down */}
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        title="Move Down"
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          background: '#2563eb',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canMoveDown ? 'pointer' : 'not-allowed',
          opacity: canMoveDown ? 1 : 0.35,
          pointerEvents: canMoveDown ? 'auto' : 'none',
          transition: 'background-color 0.15s, opacity 0.15s',
        }}
      >
        <ArrowDown size={13} />
      </button>

      {/* Duplicate */}
      <button
        type="button"
        onClick={onDuplicate}
        title="Duplicate Block"
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          background: '#2563eb',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background-color 0.15s',
        }}
      >
        <Copy size={13} />
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        title="Delete Block"
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          background: '#ef4444',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background-color 0.15s',
        }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};
