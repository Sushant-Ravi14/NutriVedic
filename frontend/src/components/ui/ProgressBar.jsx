import React from 'react';

export const ProgressBar = ({ value = 0, max = 100, variant = 'dark', className = '' }) => {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  const fillColors = {
    dark: 'bg-black',
    green: 'bg-positive',
    danger: 'bg-negative'
  };

  return (
    <div className={`w-full h-[5px] bg-[#efefef] rounded-[3px] overflow-hidden ${className}`}>
      <div
        className={`h-full transition-all duration-500 ease-out ${fillColors[variant] || 'bg-black'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};
