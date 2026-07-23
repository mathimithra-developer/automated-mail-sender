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
  isSelected?: boolean;
  onSelect?: () => void;
}

export const IconsBlock: React.FC<IconsBlockProps> = ({ block }) => {
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
    <div style={{ padding: '4px 0', width: '100%', boxSizing: 'border-box' }}>
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
    </div>
  );
};
