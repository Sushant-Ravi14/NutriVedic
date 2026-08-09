import React from 'react';

export const Badge = ({ children, variant = 'dark', className = '' }) => {
  const variants = {
    dark: 'bg-black text-white',
    positive: 'bg-positive/10 text-positive border border-positive/20',
    negative: 'bg-negative/10 text-negative border border-negative/20',
    surface: 'bg-surface text-black border border-border',
    label: 'bg-[#efefef] text-muted'
  };

  return (
    <span className={`inline-flex items-center font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-[10px] ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
