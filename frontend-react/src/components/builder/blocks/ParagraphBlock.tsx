import React, { useState, useRef, useEffect } from 'react';
import { ParagraphBlockData } from '../types';

interface ParagraphBlockProps {
  block: ParagraphBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
  onChange: (updatedContent: ParagraphBlockData['content']) => void;
  onDelete?: () => void;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
  block,
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
    if (onSelect) onSelect();
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
      onDoubleClick={handleDoubleClick}
      style={{ padding: '4px 0', width: '100%', boxSizing: 'border-box' }}
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
    </div>
  );
};
