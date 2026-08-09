import React from 'react';
import { Button } from './Button';

export const EmptyState = ({
  message = 'No data available at the moment.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-card bg-surface ${className}`}>
      {/* Abstract lines geometric SVG */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-4 text-border">
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <rect x="22" y="22" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M26 32H38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="font-sans text-[15px] text-muted max-w-sm mb-6">{message}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
