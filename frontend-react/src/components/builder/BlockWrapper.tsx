import React, { useState } from 'react';
import { BlockActionToolbar } from './BlockActionToolbar';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export interface BlockWrapperProps {
  blockId: string;
  blockTypeLabel?: string;
  isSelected: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  blockId,
  blockTypeLabel,
  isSelected,
  canMoveUp,
  canMoveDown,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  children,
}) => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      id={`builder-item-${blockId}`}
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
        cursor: 'pointer',
        border: isSelected ? '2px solid #2563eb' : isHovered ? '1px dashed #93c5fd' : '1px dashed transparent',
        boxShadow: isSelected ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : isHovered ? '0 2px 8px rgba(37, 99, 235, 0.08)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Selected Block Type Label Badge (Top-Left) */}
      {(isSelected || isHovered) && blockTypeLabel && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            left: 12,
            background: isSelected ? '#2563eb' : '#64748b',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {blockTypeLabel}
        </div>
      )}

      {/* Floating Quick Action Toolbar (Top-Right) */}
      <BlockActionToolbar
        isSelected={isSelected}
        isHovered={isHovered}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onDelete={() => setIsDeleteConfirmOpen(true)}
      />

      {/* Block Content */}
      {children}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Block"
        message="Are you sure you want to remove this block from the canvas?"
        confirmLabel="Delete Block"
        variant="danger"
        onConfirm={onDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};
