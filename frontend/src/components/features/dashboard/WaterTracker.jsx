import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';

export const WaterTracker = ({ glasses = 6, onToggleGlass }) => {
  const total = 8;
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('nutrivedic_water_count');
    return saved !== null ? parseInt(saved, 10) : glasses;
  });

  useEffect(() => {
    if (glasses !== undefined && localStorage.getItem('nutrivedic_water_count') === null) {
      setCount(glasses);
    }
  }, [glasses]);

  const handleIncrement = () => {
    const nextCount = count + 1;
    setCount(nextCount);
    localStorage.setItem('nutrivedic_water_count', nextCount.toString());
    if (onToggleGlass) {
      onToggleGlass(nextCount);
    }
  };

  const handleDecrement = () => {
    if (count > 0) {
      const nextCount = count - 1;
      setCount(nextCount);
      localStorage.setItem('nutrivedic_water_count', nextCount.toString());
      if (onToggleGlass) {
        onToggleGlass(nextCount);
      }
    }
  };

  const handleReset = () => {
    setCount(0);
    localStorage.setItem('nutrivedic_water_count', '0');
    if (onToggleGlass) {
      onToggleGlass(0);
    }
  };

  return (
    <Card className="flex flex-col justify-between">
      {/* Header Row with Reset Button Styled Exactly as + Add item */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          HYDRATION LOG
        </span>
        {count > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="font-mono text-[11px] text-muted hover:text-black transition-colors cursor-pointer"
          >
            Reset counter
          </button>
        )}
      </div>

      {/* Counter Widget Matching Reference Design */}
      <div className="bg-black text-white rounded-[20px] p-4 flex items-center justify-between relative overflow-hidden my-1 select-none">
        {/* Subtle background concentric circles */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        {/* Left: Label + Large Count Number */}
        <div className="flex flex-col z-10">
          <span className="font-sans text-xs text-[#9e9e9e] font-medium">Water</span>
          <span className="font-serif text-[38px] font-bold text-white leading-none mt-1">
            {count}
          </span>
        </div>

        {/* Right: Interactive +1 & Decrement Buttons */}
        <div className="flex items-center gap-2 z-10">
          {count > 0 && (
            <button
              type="button"
              onClick={handleDecrement}
              aria-label="Decrease water count"
              className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-mono text-xs hover:bg-white/20 active:scale-90 transition-all cursor-pointer"
            >
              -1
            </button>
          )}
          <button
            type="button"
            onClick={handleIncrement}
            aria-label="Add 1 glass of water"
            className="w-13 h-13 min-w-[52px] min-h-[52px] rounded-full bg-white text-black font-sans font-bold text-base flex items-center justify-center shadow hover:bg-surface active:scale-90 transition-all cursor-pointer"
          >
            +1
          </button>
        </div>
      </div>

      <span className="font-mono text-[12px] text-muted mt-2">
        {count} of {total} glasses ({(count * 250)} ml)
      </span>
    </Card>
  );
};
