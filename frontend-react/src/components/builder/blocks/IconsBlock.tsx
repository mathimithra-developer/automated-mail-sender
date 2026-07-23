import React from 'react';
import { IconsBlockData, IconItem } from '../types';
import {
  Star,
  Heart,
  CheckCircle,
  Mail,
  Phone,
  Gift,
  Truck,
  Shield,
  Clock,
  ThumbsUp,
  CircleHelp,
} from 'lucide-react';

interface IconsBlockProps {
  block: IconsBlockData;
  isSelected: boolean;
  onSelect: () => void;
}

export const IconsBlock: React.FC<IconsBlockProps> = ({
  block,
  isSelected,
  onSelect,
}) => {
  const {
    iconSize = 24,
    align = 'center',
    iconColor = '#2563eb',
    icons = [
      { name: 'shield' },
      { name: 'truck' },
      { name: 'gift' },
    ],
  } = block.content;

  const renderIconComponent = (name: IconItem['name']) => {
    switch (name) {
      case 'star':
        return <Star size={iconSize} />;
      case 'heart':
        return <Heart size={iconSize} />;
      case 'check-circle':
        return <CheckCircle size={iconSize} />;
      case 'mail':
        return <Mail size={iconSize} />;
      case 'phone':
        return <Phone size={iconSize} />;
      case 'gift':
        return <Gift size={iconSize} />;
      case 'truck':
        return <Truck size={iconSize} />;
      case 'shield':
        return <Shield size={iconSize} />;
      case 'clock':
        return <Clock size={iconSize} />;
      case 'thumbs-up':
        return <ThumbsUp size={iconSize} />;
      default:
        return <CircleHelp size={iconSize} />;
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
          gap: 16,
          flexWrap: 'wrap',
          color: iconColor,
        }}
      >
        {icons.map((item, idx) => (
          <div key={idx} style={{ display: 'inline-flex', alignItems: 'center' }}>
            {renderIconComponent(item.name)}
          </div>
        ))}
      </div>

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
          Icons ({icons.length})
        </div>
      )}
    </div>
  );
};
