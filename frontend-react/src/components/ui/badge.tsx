import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'green' | 'blue' | 'purple';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  const badgeClasses = {
    default: 'badge badge-blue',
    secondary: 'badge badge-gray',
    destructive: 'badge badge-red',
    outline: 'badge badge-gray',
    green: 'badge badge-green',
    blue: 'badge badge-blue',
    purple: 'badge badge-purple',
  };

  return <div className={cn('badge', badgeClasses[variant], className)} {...props} />;
};
