
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export default Card;