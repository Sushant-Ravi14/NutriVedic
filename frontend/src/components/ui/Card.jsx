import React from 'react';

export const Card = ({ children, className = '', padding = '24px', onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-border rounded-card p-[24px] shadow-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
