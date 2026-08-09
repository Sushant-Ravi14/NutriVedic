import React from 'react';

export const SkeletonLoader = ({
  variant = 'row',
  width,
  height,
  borderRadius = '8px',
  className = ''
}) => {
  if (variant === 'card') {
    return (
      <div className={`bg-white border border-border rounded-card p-6 flex flex-col gap-4 ${className}`}>
        <div className="h-5 bg-[#efefef] rounded w-1/3" />
        <div className="h-10 bg-[#efefef] rounded w-2/3" />
        <div className="h-4 bg-[#efefef] rounded w-full" />
      </div>
    );
  }

  if (variant === 'donut') {
    return (
      <div className={`w-[96px] h-[96px] rounded-full border-[9px] border-[#efefef] flex items-center justify-center ${className}`}>
        <div className="w-10 h-4 bg-[#efefef] rounded" />
      </div>
    );
  }

  return (
    <div
      className={`bg-[#efefef] ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius
      }}
    />
  );
};
