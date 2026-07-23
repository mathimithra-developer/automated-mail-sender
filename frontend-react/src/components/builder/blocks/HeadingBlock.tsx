import React, { useState, useRef, useEffect } from 'react';
import { HeadingBlockData } from '../types';

interface HeadingBlockProps {
  block: HeadingBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
  onChange: (updatedContent: HeadingBlockData['content']) => void;
  onDelete?: () => void;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
  block,
  onSelect,
  onChange,
}) => {
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    text,
    tag = 'h2',
    fontSize = 28,
    fontWeight = '700',
    color = '#18181b',
    align = 'center',
    letterSpacing = 0,
    lineHeight = 1.3,
  } = block.content;

  const validTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
  type ValidTag = typeof validTags[number];
  const Tag: ValidTag = validTags.includes(tag as ValidTag) ? (tag as ValidTag) : 'h2';

  const headingStyle: React.CSSProperties = {
    margin: 0,
    padding: 0,
    fontSize: `${fontSize}px`,
    fontWeight: fontWeight,
    color: color,
    textAlign: align,
    letterSpacing: `${letterSpacing}px`,
    lineHeight: lineHeight,
    outline: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    width: '100%',
    wordBreak: 'break-word',
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsInlineEditing(false);
    } else if (e.key === 'Escape') {
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
            ...headingStyle,
            border: '1px solid #3b82f6',
            borderRadius: '4px',
            background: '#ffffff',
            resize: 'none',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
          rows={Math.max(1, text.split('\n').length)}
        />
      ) : (
        <Tag style={headingStyle}>{text || 'Enter heading text...'}</Tag>
      )}
    </div>
  );
};
