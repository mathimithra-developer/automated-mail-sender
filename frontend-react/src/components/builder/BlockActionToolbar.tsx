import React from 'react';
import { ArrowUp, ArrowDown, Copy, Trash2, GripVertical, Lock, Unlock } from 'lucide-react';

export interface BlockActionToolbarProps {
  isSelected: boolean;
  isHovered?: boolean;
  isLocked?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onToggleLock?: () => void;
  onDelete: () => void;
}

export const BlockActionToolbar: React.FC<BlockActionToolbarProps> = ({
  isSelected,
  isHovered,
  isLocked = false,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onToggleLock,
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
        title={isLocked ? 'Locked Block (Cannot Drag)' : 'Drag Handle'}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isLocked ? '#cbd5e1' : '#94a3b8',
          cursor: isLocked ? 'not-allowed' : 'grab',
        }}
      >
        <GripVertical size={13} />
      </div>

      {/* Move Up */}
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!canMoveUp || isLocked}
        title={isLocked ? 'Block is locked' : 'Move Up'}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          background: canMoveUp && !isLocked ? '#eff6ff' : '#f1f5f9',
          color: canMoveUp && !isLocked ? '#2563eb' : '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canMoveUp && !isLocked ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s',
        }}
      >
        <ArrowUp size={13} />
      </button>

      {/* Move Down */}
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canMoveDown || isLocked}
        title={isLocked ? 'Block is locked' : 'Move Down'}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          background: canMoveDown && !isLocked ? '#eff6ff' : '#f1f5f9',
          color: canMoveDown && !isLocked ? '#2563eb' : '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: canMoveDown && !isLocked ? 'pointer' : 'not-allowed',
          transition: 'all 0.15s',
        }}
      >
        <ArrowDown size={13} />
      </button>

      {/* Lock Toggle Button (Functional on EVERY block) */}
      {onToggleLock && (
        <button
          type="button"
          onClick={onToggleLock}
          title={isLocked ? 'Click to Unlock Block' : 'Click to Lock Block'}
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: 'none',
            background: isLocked ? '#fef3c7' : '#eff6ff',
            color: isLocked ? '#d97706' : '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
      )}

      {/* Duplicate */}
      <button
        type="button"
        onClick={onDuplicate}
        disabled={isLocked}
        title={isLocked ? 'Block is locked' : 'Duplicate Block'}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          background: isLocked ? '#f1f5f9' : '#eff6ff',
          color: isLocked ? '#cbd5e1' : '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <Copy size={13} />
      </button>

      {/* Delete Icon (Fixed & Working on EVERY block) */}
      <button
        type="button"
        onClick={onDelete}
        disabled={isLocked}
        title={isLocked ? 'Block is locked' : 'Delete Block'}
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: 'none',
          background: isLocked ? '#f1f5f9' : '#fef2f2',
          color: isLocked ? '#cbd5e1' : '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};
