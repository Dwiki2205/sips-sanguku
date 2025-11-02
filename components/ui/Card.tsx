import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn("bg-white shadow-sm rounded-lg border border-gray-200", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-200", className)} {...props}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardContentProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
};

// Export default untuk backward compatibility
const CardComponent: React.FC<CardProps> = (props) => <Card {...props} />;
export default CardComponent;