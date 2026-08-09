import React from 'react';
import { Card } from '../../ui/Card';

export const BarChart = ({ data = [] }) => {
  const maxKcal = 2400;

  return (
    <Card className="flex flex-col justify-between w-full h-full min-h-[260px]">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          WEEKLY INTAKE VS TARGET
        </span>
        <span className="font-mono text-[11px] text-muted">Target: 1,950 kcal</span>
      </div>

      {/* Chart container */}
      <div className="relative flex-1 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-border">
        {/* Dashed Target Line */}
        <div
          className="absolute left-0 right-0 border-b border-dashed border-black/40 z-10 flex items-center justify-end"
          style={{ bottom: `${(1950 / maxKcal) * 100}%` }}
        >
          <span className="font-mono text-[9px] bg-black text-white px-1.5 py-0.5 rounded -mr-2">
            Target
          </span>
        </div>

        {data.map((item) => {
          const heightPct = Math.min((item.kcal / maxKcal) * 100, 100);
          const isTargetMet = item.kcal >= item.target * 0.9 && item.kcal <= item.target * 1.1;

          return (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="font-mono text-[10px] text-black opacity-0 group-hover:opacity-100 transition-opacity">
                {item.kcal}
              </span>
              <div
                className={`w-full max-w-[28px] rounded-t transition-all duration-500 ${
                  isTargetMet ? 'bg-black' : 'bg-[#e0e0e0]'
                }`}
                style={{ height: `${heightPct}%` }}
              />
              <span className="font-mono text-[11px] text-muted">{item.day}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
