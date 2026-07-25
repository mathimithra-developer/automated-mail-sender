import React, { useState, useRef, useEffect } from 'react';
import { TextBlockData } from '../types';

interface TextBlockProps {
  block: TextBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
  onChange: (updatedContent: TextBlockData['content']) => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({
  block,
  onSelect,
  onChange,
}) => {
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    text = 'Enter simple text here...',
    fontSize = 14,
    color = '#334155',
    align = 'left',
    fontFamily = 'inherit',
    fontWeight = '400',
    lineHeight = 1.5,
  } = block.content;

  const textStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    color,
    textAlign: align,
    fontFamily,
    fontWeight,
    lineHeight,
    display: 'inline-block',
    width: '100%',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    margin: 0,
    padding: 0,
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
            ...textStyle,
            display: 'block',
            padding: '4px 6px',
            outline: 'none',
            border: '1px solid #3b82f6',
            borderRadius: '4px',
            background: '#ffffff',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
          rows={Math.max(2, text.split('\n').length)}
        />
      ) : (
        <span style={textStyle}>
          {text || 'Enter simple text here...'}
        </span>
      )}
    </div>
  );
};
