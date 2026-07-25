import React, { useState } from 'react';
import { ColumnData, BuilderBlock } from './types';
import { BlockWrapper } from './BlockWrapper';
import { Plus } from 'lucide-react';

// Block Component Imports
import { HeadingBlock } from './blocks/HeadingBlock';
import { ParagraphBlock } from './blocks/ParagraphBlock';
import { TextBlock } from './blocks/TextBlock';
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

// New Block Imports
import { LogoBlock } from './blocks/LogoBlock';
import { GreetingBlock } from './blocks/GreetingBlock';
import { HeroBannerBlock } from './blocks/HeroBannerBlock';
import { EmojiRowBlock } from './blocks/EmojiRowBlock';
import { CalloutBlock } from './blocks/CalloutBlock';
import { InfoCardBlock } from './blocks/InfoCardBlock';
import { FeatureCardBlock } from './blocks/FeatureCardBlock';
import { MultiFeatureBlock } from './blocks/MultiFeatureBlock';
import { BenefitsListBlock } from './blocks/BenefitsListBlock';
import { BulletListBlock } from './blocks/BulletListBlock';
import { NumberedStepsBlock } from './blocks/NumberedStepsBlock';
import { TimelineBlock } from './blocks/TimelineBlock';
import { QuoteBlock } from './blocks/QuoteBlock';
import { FaqBlock } from './blocks/FaqBlock';
import { DualButtonBlock } from './blocks/DualButtonBlock';
import { FooterBlock } from './blocks/FooterBlock';
import { SignatureBlock } from './blocks/SignatureBlock';
import { PricingCardBlock } from './blocks/PricingCardBlock';
import { ContainerBlock } from './blocks/ContainerBlock';
import { AlertBoxBlock } from './blocks/AlertBoxBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { VariableBlock } from './blocks/VariableBlock';
import { ButtonCardBlock } from './blocks/ButtonCardBlock';
import { HighlightBoxBlock } from './blocks/HighlightBoxBlock';
import { ChecklistBlock } from './blocks/ChecklistBlock';
import { IconTextBlock } from './blocks/IconTextBlock';
import { BadgeBlock } from './blocks/BadgeBlock';
import { StatisticsBlock } from './blocks/StatisticsBlock';
import { NewsletterHeaderBlock } from './blocks/NewsletterHeaderBlock';
import { BannerCtaBlock } from './blocks/BannerCtaBlock';

interface ColumnProps {
  sectionId: string;
  column: ColumnData;
  selectedId: { type: 'section' | 'column' | 'block'; id: string } | null;
  onSelectColumn: () => void;
  onSelectBlock: (blockId: string) => void;
  onUpdateBlock: (blockId: string, updatedContent: any) => void;
  onAddBlock: (sectionId: string, columnId: string, blockType: BuilderBlock['type'], targetIndex?: number) => void;
  onMoveBlockToColumn?: (blockId: string, targetSectionId: string, targetColumnId: string, targetIndex?: number) => void;
  onSplitSectionWithBlock?: (sectionId: string, targetColumnId: string, position: 'left' | 'right', blockType?: BuilderBlock['type'], blockId?: string) => void;
  onMoveBlock: (blockId: string, direction: 'up' | 'down') => void;
  onDuplicateBlock: (blockId: string) => void;
  onToggleLockBlock?: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
}

function getBlockLabel(type: BuilderBlock['type']): string {
  switch (type) {
    case 'logo': return 'Logo';
    case 'greeting': return 'Greeting';
    case 'heading': return 'Heading';
    case 'text': return 'Text';
    case 'paragraph': return 'Paragraph';
    case 'button': return 'Button';
    case 'dualButton': return 'Dual Buttons';
    case 'image': return 'Image';
    case 'heroBanner': return 'Hero Banner';
    case 'divider': return 'Divider';
    case 'spacer': return 'Spacer';
    case 'video': return 'Video';
    case 'emojiRow': return 'Emoji Button';
    case 'callout': return 'Callout Card';
    case 'infoCard': return 'Info Card';
    case 'featureCard': return 'Feature Card';
    case 'multiFeature': return 'Multi Features';
    case 'benefitsList': return 'Benefits List';
    case 'bulletList': return 'Bullet List';
    case 'numberedSteps': return 'Numbered Steps';
    case 'timeline': return 'Timeline';
    case 'quote': return 'Quote';
    case 'faqAccordion': return 'FAQ Accordion';
    case 'social': return 'Social Icons';
    case 'footer': return 'Footer';
    case 'signature': return 'Signature';
    case 'pricingCard': return 'Pricing Card';
    case 'container': return 'Container';
    case 'alertBox': return 'Alert Box';
    case 'code': return 'Code Box';
    case 'variable': return 'Variable';
    case 'buttonCard': return 'Button Card';
    case 'highlightBox': return 'Highlight Box';
    case 'checklist': return 'Checklist';
    case 'iconText': return 'Icon + Text';
    case 'badge': return 'Badge';
    case 'statistics': return 'Statistics';
    case 'newsletterHeader': return 'Newsletter Header';
    case 'bannerCta': return 'Banner CTA';
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
  onMoveBlockToColumn,
  onSplitSectionWithBlock,
  onMoveBlock,
  onDuplicateBlock,
  onToggleLockBlock,
  onDeleteBlock,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragPosition, setDragPosition] = useState<'left' | 'right' | 'center'>('center');
  const [showGuidance, setShowGuidance] = useState(false);
  const isSelected = selectedId?.type === 'column' && selectedId.id === column.id;

  // Hide guidance when components count changes
  React.useEffect(() => {
    setShowGuidance(false);
  }, [column.components.length]);

  const colStyle: React.CSSProperties = {
    width: column.width || '100%',
    padding: column.styles?.padding || '0px',
    backgroundColor: column.styles?.backgroundColor || 'transparent',
    verticalAlign: column.styles?.verticalAlign || 'top',
    boxSizing: 'border-box',
    border: isSelected ? '1px dashed #3b82f6' : '1px dashed transparent',
    borderLeft: isDragOver && dragPosition === 'left' ? '4px solid #2563eb' : isDragOver && dragPosition === 'center' ? '2px dashed #2563eb' : undefined,
    borderRight: isDragOver && dragPosition === 'right' ? '4px solid #2563eb' : isDragOver && dragPosition === 'center' ? '2px dashed #2563eb' : undefined,
    borderTop: isDragOver && dragPosition === 'center' ? '2px dashed #2563eb' : undefined,
    borderBottom: isDragOver && dragPosition === 'center' ? '2px dashed #2563eb' : undefined,
    borderRadius: 6,
    transition: 'border 0.15s, background-color 0.15s',
    background: isDragOver ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
    position: 'relative',
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const threshold = Math.min(80, width * 0.25); // Drag zone threshold (up to 80px or 25% of width)

    let position: 'left' | 'right' | 'center' = 'center';
    if (x < threshold) {
      position = 'left';
    } else if (x > width - threshold) {
      position = 'right';
    }

    if (dragPosition !== position) {
      setDragPosition(position);
    }
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragPosition('center');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const position = dragPosition;
    setDragPosition('center');

    try {
      const rawData = e.dataTransfer.getData('text/plain');
      if (rawData) {
        const parsed = JSON.parse(rawData);
        const blockType = parsed?.type === 'block' ? parsed?.blockType : undefined;
        const blockId = parsed?.type === 'canvas-move-block' ? parsed?.blockId : undefined;
        
        if (position === 'left' || position === 'right') {
          onSplitSectionWithBlock?.(sectionId, column.id, position, blockType, blockId);
        } else {
          // Calculate precise vertical drop index from mouse Y vs block midpoints
          const wrappers = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>('.builder-block-wrapper')
          );
          let targetIndex = wrappers.length;
          for (let i = 0; i < wrappers.length; i++) {
            const rect = wrappers[i].getBoundingClientRect();
            if (e.clientY < rect.top + rect.height / 2) {
              targetIndex = i;
              break;
            }
          }

          if (parsed?.type === 'block' && parsed?.blockType) {
            onAddBlock(sectionId, column.id, parsed.blockType, targetIndex);
          } else if (parsed?.type === 'canvas-move-block' && parsed?.blockId) {
            onMoveBlockToColumn?.(parsed.blockId, sectionId, column.id, targetIndex);
          }
        }
      }
    } catch (err) {
      // Ignore invalid drag payload
    }
  };

  const renderBlockContent = (comp: BuilderBlock, isCompSelected: boolean, onSelect: () => void, onChange: (updatedContent: any) => void) => {
    switch (comp.type) {
      case 'logo': return <LogoBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'greeting': return <GreetingBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'heading': return <HeadingBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} onChange={onChange} />;
      case 'text': return <TextBlock block={comp as any} isSelected={isCompSelected} onSelect={onSelect} onChange={onChange} />;
      case 'paragraph': return <ParagraphBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} onChange={onChange} />;
      case 'button': return <ButtonBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} onChange={onChange} />;
      case 'dualButton': return <DualButtonBlock block={comp} />;
      case 'image': return <ImageBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'heroBanner': return <HeroBannerBlock block={comp} />;
      case 'divider': return <DividerBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'spacer': return <SpacerBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'video': return <VideoBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'emojiRow': return <EmojiRowBlock block={comp} />;
      case 'callout': return <CalloutBlock block={comp} />;
      case 'infoCard': return <InfoCardBlock block={comp} />;
      case 'featureCard': return <FeatureCardBlock block={comp} />;
      case 'multiFeature': return <MultiFeatureBlock block={comp} />;
      case 'benefitsList': return <BenefitsListBlock block={comp} />;
      case 'bulletList': return <BulletListBlock block={comp} />;
      case 'numberedSteps': return <NumberedStepsBlock block={comp} />;
      case 'timeline': return <TimelineBlock block={comp} />;
      case 'quote': return <QuoteBlock block={comp} />;
      case 'faqAccordion': return <FaqBlock block={comp} />;
      case 'social': return <SocialBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'footer': return <FooterBlock block={comp} />;
      case 'signature': return <SignatureBlock block={comp} />;
      case 'pricingCard': return <PricingCardBlock block={comp} />;
      case 'container': return <ContainerBlock block={comp} />;
      case 'alertBox': return <AlertBoxBlock block={comp} />;
      case 'code': return <CodeBlock block={comp} />;
      case 'variable': return <VariableBlock block={comp} />;
      case 'buttonCard': return <ButtonCardBlock block={comp} />;
      case 'highlightBox': return <HighlightBoxBlock block={comp} />;
      case 'checklist': return <ChecklistBlock block={comp} />;
      case 'iconText': return <IconTextBlock block={comp} />;
      case 'badge': return <BadgeBlock block={comp} />;
      case 'statistics': return <StatisticsBlock block={comp} />;
      case 'newsletterHeader': return <NewsletterHeaderBlock block={comp} />;
      case 'bannerCta': return <BannerCtaBlock block={comp} />;
      case 'html': return <HtmlBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'menu': return <MenuBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'table': return <TableBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'icons': return <IconsBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'rating': return <RatingBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'productCard': return <ProductCardBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'productGrid': return <ProductGridBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'coupon': return <CouponBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'countdown': return <CountdownBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'qrCode': return <QrCodeBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'poll': return <PollBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      case 'conditional': return <ConditionalBlock block={comp} isSelected={isCompSelected} onSelect={onSelect} />;
      default: return null;
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
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 6 }}>
          <div
            onClick={() => {
              setShowGuidance(true);
              window.dispatchEvent(new CustomEvent('highlight-block-catalog', {
                detail: { sectionId, columnId: column.id }
              }));
            }}
            style={{
              padding: '24px 16px',
              margin: '8px 0 0 0',
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
          {showGuidance && (
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#2563eb',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 6,
              padding: '6px 10px',
              textAlign: 'center',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              👈 Select a block from the Block Catalog to add it here
            </div>
          )}
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
                isLocked={comp.isLocked}
                canMoveUp={canMoveUp}
                canMoveDown={canMoveDown}
                onSelect={onSelect}
                onMoveUp={() => onMoveBlock(comp.id, 'up')}
                onMoveDown={() => onMoveBlock(comp.id, 'down')}
                onDuplicate={() => onDuplicateBlock(comp.id)}
                onToggleLock={() => onToggleLockBlock?.(comp.id)}
                onDelete={() => onDeleteBlock(comp.id)}
                sectionId={sectionId}
                columnId={column.id}
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
              setShowGuidance(true);
              window.dispatchEvent(new CustomEvent('highlight-block-catalog', {
                detail: { sectionId, columnId: column.id }
              }));
            }}
            style={{
              margin: '8px 0 0 0',
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
          {showGuidance && (
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#2563eb',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 6,
              padding: '6px 10px',
              marginTop: 6,
              textAlign: 'center',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              👈 Select a block from the Block Catalog to add it here
            </div>
          )}
        </div>
      )}
    </div>
  );
};
