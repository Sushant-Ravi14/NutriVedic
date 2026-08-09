import React from 'react';
import { motion } from 'framer-motion';

export const DonutRing = ({
  value = 0,
  max = 2000,
  size = 96,
  strokeWidth = 9,
  children,
  className = ''
}) => {
  const center = size / 2;
  const radius = center - strokeWidth - 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / (max || 1), 0), 1);
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#efefef"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#0a0a0a"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      {children && <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">{children}</div>}
    </div>
  );
};
