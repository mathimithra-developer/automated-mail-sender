import React, { useState, useRef, useEffect } from 'react';
import { ParagraphBlockData } from '../types';

interface ParagraphBlockProps {
  block: ParagraphBlockData;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updatedContent: ParagraphBlockData['content']) => void;
  onDelete?: () => void;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
  block,
  isSelected,
  onSelect,
  onChange,
}) => {
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    text = 'Write your content here...',
    fontSize = 15,
    color = '#334155',
    align = 'left',
    lineHeight = 1.6,
  } = block.content;

  const paragraphStyle: React.CSSProperties = {
    margin: 0,
    padding: 0,
    fontSize: `${fontSize}px`,
    color: color,
    textAlign: align,
    lineHeight: lineHeight,
    outline: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    width: '100%',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  };

  useEffect(() => {
    if (isInlineEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isInlineEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    setIsInlineEditing(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...block.content,
      text: e.target.value,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsInlineEditing(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={handleDoubleClick}
      className={`builder-block-wrapper ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'relative',
        padding: '12px 16px',
        margin: '4px 0',
        borderRadius: '6px',
        cursor: 'pointer',
        border: isSelected ? '2px solid #3b82f6' : '1px dashed transparent',
        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {isInlineEditing ? (
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleTextChange}
          onBlur={() => setIsInlineEditing(false)}
          onKeyDown={handleKeyDown}
          style={{
            ...paragraphStyle,
            border: '1px solid #3b82f6',
            borderRadius: '4px',
            background: '#ffffff',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
          rows={Math.max(2, text.split('\n').length)}
        />
      ) : (
        <p style={paragraphStyle}>{text || 'Enter paragraph text...'}</p>
      )}

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
          Paragraph
        </div>
      )}
    </div>
  );
};
