import React from 'react';
import { motion } from 'framer-motion';

export const Toast = ({ toast, onClose }) => {
  const borderColors = {
    success: 'border-l-[3px] border-l-positive',
    error: 'border-l-[3px] border-l-negative',
    info: 'border-l-[3px] border-l-muted',
    warning: 'border-l-[3px] border-l-amber-500'
  };

  return (
    <motion.div
      role="alert"
      aria-live="polite"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -10, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-white border border-border rounded-card px-4 py-3.5 shadow-sm font-mono text-[12px] text-black flex items-center justify-between gap-4 min-w-[280px] max-w-[380px] ${
        borderColors[toast.type] || borderColors.info
      }`}
    >
      <span>{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        aria-label="Close notification"
        className="text-muted hover:text-black font-sans text-xs ml-2"
      >
        ✕
      </button>
    </motion.div>
  );
};
