import React, { useState } from 'react';
import { BlockActionToolbar } from './BlockActionToolbar';
import { Lock } from 'lucide-react';

export interface BlockWrapperProps {
  blockId: string;
  blockTypeLabel?: string;
  isSelected: boolean;
  isLocked?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onToggleLock?: () => void;
  onDelete: () => void;
  children: React.ReactNode;
  sectionId?: string;
  columnId?: string;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  blockId,
  blockTypeLabel,
  isSelected,
  isLocked = false,
  canMoveUp,
  canMoveDown,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onToggleLock,
  onDelete,
  children,
  sectionId,
  columnId,
}) => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      id={`builder-item-${blockId}`}
      draggable={!isLocked}
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData('text/plain', JSON.stringify({
          type: 'canvas-move-block',
          blockId,
          sourceSectionId: sectionId,
          sourceColumnId: columnId,
        }));
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`builder-block-wrapper ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'relative',
        padding: '8px 12px',
        margin: '4px 0',
        borderRadius: '8px',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        border: isSelected ? '2px solid #2563eb' : isHovered ? '1px dashed #93c5fd' : '1px dashed transparent',
        boxShadow: isSelected ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : isHovered ? '0 2px 8px rgba(37, 99, 235, 0.08)' : 'none',
        pointerEvents: 'auto',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Status Indicators Badges (Top-Left) */}
      {(isSelected || isHovered || isLocked) && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            left: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            zIndex: 10,
          }}
        >
          {blockTypeLabel && (
            <span
              style={{
                background: isSelected ? '#2563eb' : '#64748b',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                pointerEvents: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {blockTypeLabel}
            </span>
          )}
          {isLocked && (
            <span
              style={{
                background: '#f59e0b',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
              }}
              title="Locked Block"
            >
              <Lock size={10} /> Locked
            </span>
          )}
        </div>
      )}

      {/* Floating Quick Action Toolbar (Top-Right) */}
      <BlockActionToolbar
        isSelected={isSelected}
        isHovered={isHovered}
        isLocked={isLocked}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onToggleLock={onToggleLock}
        onDelete={() => setIsDeleteConfirmOpen(true)}
      />

      {isDeleteConfirmOpen && (
        <div
          style={{
            position: 'absolute',
            top: -38,
            right: 12,
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: 8,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '6px 10px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: 170,
            animation: 'scaleIn 0.1s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>Delete?</span>
          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(false)}
            style={{
              padding: '2px 6px',
              fontSize: 10,
              fontWeight: 700,
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              background: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            No
          </button>
          <button
            type="button"
            onClick={() => {
              setIsDeleteConfirmOpen(false);
              onDelete();
            }}
            style={{
              padding: '2px 6px',
              fontSize: 10,
              fontWeight: 700,
              border: 'none',
              borderRadius: 4,
              background: '#ef4444',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            Yes
          </button>
        </div>
      )}

      {/* Block Content Container */}
      <div style={{ pointerEvents: isLocked ? 'none' : 'auto' }}>
        {children}
      </div>
    </div>
  );
};
