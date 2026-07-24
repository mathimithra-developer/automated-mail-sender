import React from 'react';
import { ArrowUp, ArrowDown, Copy, Trash2, GripVertical } from 'lucide-react';

export interface BlockActionToolbarProps {
  isSelected: boolean;
  isHovered?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const BlockActionToolbar: React.FC<BlockActionToolbarProps> = ({
  isSelected,
  isHovered,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}) => {
  if (!isSelected && !isHovered) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: -14,
        right: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        background: '#ffffff',
        padding: '3px 6px',
        borderRadius: 20,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.08)',
        zIndex: 30,
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      {/* Drag Handle Icon */}
      <div
        title="Drag Handle"
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          cursor: 'grab',
        }}
      >
        <GripVertical size={13} />
      </div>

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
          background: canMoveUp ? '#eff6ff' : '#f1f5f9',
          color: canMoveUp ? '#2563eb' : '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canMoveUp ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s',
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
          background: canMoveDown ? '#eff6ff' : '#f1f5f9',
          color: canMoveDown ? '#2563eb' : '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canMoveDown ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s',
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
          background: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s',
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
          background: '#fef2f2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};
