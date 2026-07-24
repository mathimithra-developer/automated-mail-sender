import React, { useState } from 'react';
import { SectionData, ColumnData, BuilderBlock } from './types';
import { Column } from './Column';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ArrowUp, ArrowDown, Copy, Trash2, LayoutGrid } from 'lucide-react';

interface SectionProps {
  section: SectionData;
  selectedId: { type: 'section' | 'column' | 'block'; id: string } | null;
  onSelectSection: () => void;
  onSelectColumn: (columnId: string) => void;
  onSelectBlock: (blockId: string) => void;
  onUpdateBlock: (blockId: string, updatedContent: any) => void;
  onAddBlock: (sectionId: string, columnId: string, blockType: BuilderBlock['type']) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onDuplicateBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveSection: (direction: 'up' | 'down') => void;
  onDuplicateSection: () => void;
  onDeleteSection: () => void;
}

export const Section: React.FC<SectionProps> = ({
  section,
  selectedId,
  onSelectSection,
  onSelectColumn,
  onSelectBlock,
  onUpdateBlock,
  onAddBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
}) => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const isSelected = selectedId?.type === 'section' && selectedId.id === section.id;

  const sectionStyle: React.CSSProperties = {
    position: 'relative',
    backgroundColor: section.background || '#ffffff',
    padding: section.padding || '24px 20px',
    border: isSelected ? '2px solid #2563eb' : '1px dashed #e2e8f0',
    borderRadius: 8,
    margin: '8px 0',
    boxShadow: isSelected ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <div
      id={`builder-item-${section.id}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelectSection();
      }}
      className={`builder-section-wrapper ${isSelected ? 'selected' : ''}`}
      style={sectionStyle}
    >
      {/* Columns Row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          gap: 16,
          width: '100%',
        }}
      >
        {section.columns.map((col: ColumnData) => (
          <Column
            key={col.id}
            sectionId={section.id}
            column={col}
            selectedId={selectedId}
            onSelectColumn={() => onSelectColumn(col.id)}
            onSelectBlock={onSelectBlock}
            onUpdateBlock={onUpdateBlock}
            onAddBlock={onAddBlock}
            onMoveBlock={onMoveBlock}
            onDuplicateBlock={onDuplicateBlock}
            onDeleteBlock={onDeleteBlock}
          />
        ))}
      </div>

      {/* Floating Section Action Bar when selected */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: -14,
            left: 16,
            background: '#2563eb',
            color: '#ffffff',
            borderRadius: 6,
            padding: '2px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '11px',
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <LayoutGrid size={13} />
            <span>SECTION ({section.columns.length} Cols)</span>
          </div>

          <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.3)' }} />

          <button
            type="button"
            onClick={() => onMoveSection('up')}
            style={{ border: 'none', background: 'none', color: '#ffffff', cursor: 'pointer', padding: 2 }}
            title="Move Section Up"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={() => onMoveSection('down')}
            style={{ border: 'none', background: 'none', color: '#ffffff', cursor: 'pointer', padding: 2 }}
            title="Move Section Down"
          >
            <ArrowDown size={13} />
          </button>
          <button
            type="button"
            onClick={onDuplicateSection}
            style={{ border: 'none', background: 'none', color: '#ffffff', cursor: 'pointer', padding: 2 }}
            title="Duplicate Section"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            style={{ border: 'none', background: 'none', color: '#fca5a5', cursor: 'pointer', padding: 2 }}
            title="Delete Section"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      {/* Delete Section Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Section"
        message="Are you sure you want to delete this section and all contained blocks? This action cannot be undone."
        confirmLabel="Delete Section"
        variant="danger"
        onConfirm={onDeleteSection}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};
