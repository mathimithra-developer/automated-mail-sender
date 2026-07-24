import React, { useState } from 'react';
import { ColumnData, BuilderBlock } from './types';
import { BlockPicker } from './BlockPicker';
import { BlockWrapper } from './BlockWrapper';
import { Plus } from 'lucide-react';

// Block Component Imports
import { HeadingBlock } from './blocks/HeadingBlock';
import { ParagraphBlock } from './blocks/ParagraphBlock';
import { ButtonBlock } from './blocks/ButtonBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { DividerBlock } from './blocks/DividerBlock';
import { SpacerBlock } from './blocks/SpacerBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { SocialBlock } from './blocks/SocialBlock';
import { HtmlBlock } from './blocks/HtmlBlock';
import { MenuBlock } from './blocks/MenuBlock';
import { TableBlock } from './blocks/TableBlock';
import { IconsBlock } from './blocks/IconsBlock';
import { RatingBlock } from './blocks/RatingBlock';
import { ProductCardBlock } from './blocks/ProductCardBlock';
import { ProductGridBlock } from './blocks/ProductGridBlock';
import { CouponBlock } from './blocks/CouponBlock';
import { CountdownBlock } from './blocks/CountdownBlock';
import { QrCodeBlock } from './blocks/QrCodeBlock';
import { PollBlock } from './blocks/PollBlock';
import { ConditionalBlock } from './blocks/ConditionalBlock';

interface ColumnProps {
  sectionId: string;
  column: ColumnData;
  selectedId: { type: 'section' | 'column' | 'block'; id: string } | null;
  onSelectColumn: () => void;
  onSelectBlock: (blockId: string) => void;
  onUpdateBlock: (blockId: string, updatedContent: any) => void;
  onAddBlock: (sectionId: string, columnId: string, blockType: BuilderBlock['type']) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onDuplicateBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
}

function getBlockLabel(type: BuilderBlock['type']): string {
  switch (type) {
    case 'heading': return 'Heading';
    case 'paragraph': return 'Paragraph';
    case 'button': return 'Button';
    case 'image': return 'Image';
    case 'divider': return 'Divider';
    case 'spacer': return 'Spacer';
    case 'video': return 'Video';
    case 'social': return 'Social';
    case 'html': return 'HTML';
    case 'menu': return 'Menu';
    case 'table': return 'Table';
    case 'icons': return 'Icons';
    case 'rating': return 'Rating';
    case 'productCard': return 'Product Card';
    case 'productGrid': return 'Product Grid';
    case 'coupon': return 'Coupon';
    case 'countdown': return 'Countdown';
    case 'qrCode': return 'QR Code';
    case 'poll': return 'Poll';
    case 'conditional': return 'Conditional';
    default: return 'Block';
  }
}

export const Column: React.FC<ColumnProps> = ({
  sectionId,
  column,
  selectedId,
  onSelectColumn,
  onSelectBlock,
  onUpdateBlock,
  onAddBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const isSelected = selectedId?.type === 'column' && selectedId.id === column.id;

  const colStyle: React.CSSProperties = {
    width: column.width || '100%',
    padding: column.styles?.padding || '0px',
    backgroundColor: column.styles?.backgroundColor || 'transparent',
    verticalAlign: column.styles?.verticalAlign || 'top',
    boxSizing: 'border-box',
    border: isDragOver ? '2px dashed #2563eb' : isSelected ? '1px dashed #3b82f6' : '1px dashed transparent',
    borderRadius: 6,
    transition: 'border-color 0.15s, background-color 0.15s',
    background: isDragOver ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    try {
      const rawData = e.dataTransfer.getData('text/plain');
      if (rawData) {
        const parsed = JSON.parse(rawData);
        if (parsed?.type === 'block' && parsed?.blockType) {
          onAddBlock(sectionId, column.id, parsed.blockType);
        }
      }
    } catch (err) {
      // Ignore invalid drag payload
    }
  };

  const renderBlockContent = (comp: BuilderBlock, isCompSelected: boolean, onSelect: () => void, onChange: (updatedContent: any) => void) => {
    switch (comp.type) {
      case 'heading':
        return <HeadingBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} onChange={onChange} />;
      case 'paragraph':
        return <ParagraphBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} onChange={onChange} />;
      case 'button':
        return <ButtonBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} onChange={onChange} />;
      case 'image':
        return <ImageBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'divider':
        return <DividerBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'spacer':
        return <SpacerBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'video':
        return <VideoBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'social':
        return <SocialBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'html':
        return <HtmlBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'menu':
        return <MenuBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'table':
        return <TableBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'icons':
        return <IconsBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'rating':
        return <RatingBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'productCard':
        return <ProductCardBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'productGrid':
        return <ProductGridBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'coupon':
        return <CouponBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'countdown':
        return <CountdownBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'qrCode':
        return <QrCodeBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'poll':
        return <PollBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'conditional':
        return <ConditionalBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      default:
        return null;
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectColumn();
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={colStyle}
    >
      {column.components.length === 0 ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsPickerOpen(true);
          }}
          style={{
            padding: '24px 16px',
            margin: '8px 0',
            border: '2px dashed #cbd5e1',
            borderRadius: 6,
            background: 'rgba(241, 245, 249, 0.5)',
            textAlign: 'center',
            cursor: 'pointer',
            color: '#64748b',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Plus size={16} /> Add Block to Column
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {column.components.map((comp: BuilderBlock, idx: number) => {
            const isCompSelected = selectedId?.type === 'block' && selectedId.id === comp.id;
            const onSelect = () => onSelectBlock(comp.id);
            const onChange = (updatedContent: any) => onUpdateBlock(comp.id, updatedContent);

            const canMoveUp = idx > 0;
            const canMoveDown = idx < column.components.length - 1;

            return (
              <BlockWrapper
                key={comp.id}
                blockId={comp.id}
                blockTypeLabel={getBlockLabel(comp.type)}
                isSelected={isCompSelected}
                canMoveUp={canMoveUp}
                canMoveDown={canMoveDown}
                onSelect={onSelect}
                onMoveUp={() => onMoveBlock(comp.id, 'up')}
                onMoveDown={() => onMoveBlock(comp.id, 'down')}
                onDuplicate={() => onDuplicateBlock(comp.id)}
                onDelete={() => onDeleteBlock(comp.id)}
              >
                {renderBlockContent(comp, isCompSelected, onSelect, onChange)}
              </BlockWrapper>
            );
          })}

          {/* Add Block trigger below existing blocks */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPickerOpen(true);
            }}
            style={{
              margin: '8px 0',
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px dashed #cbd5e1',
              background: '#ffffff',
              color: '#3b82f6',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Plus size={14} /> Add Block
          </button>
        </div>
      )}

      {/* Searchable Block Picker Modal */}
      <BlockPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectBlock={(blockType) => onAddBlock(sectionId, column.id, blockType)}
      />
    </div>
  );
};
