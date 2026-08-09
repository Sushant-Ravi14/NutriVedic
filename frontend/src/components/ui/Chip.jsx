import React from 'react';

export const Chip = ({ label, active = false, onClick, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-4 py-1.5 rounded-pill font-mono text-[11px] uppercase tracking-wider transition-colors ${
        active
          ? 'bg-black text-white border border-black'
          : 'bg-white text-muted border border-border hover:border-black hover:text-black'
      } ${className}`}
    >
      {label}
    </button>
  );
};
