import React from 'react';
import { ProgressBar } from './ProgressBar';

export const MacroBar = ({ label, current = 0, target = 100, unit = 'g' }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="font-sans font-medium text-black">{label}</span>
        <span className="font-mono text-muted text-[12px]">
          {current} / {target} {unit}
        </span>
      </div>
      <ProgressBar value={current} max={target} />
    </div>
  );
};
