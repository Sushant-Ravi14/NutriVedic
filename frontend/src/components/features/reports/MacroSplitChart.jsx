import React from 'react';
import { Card } from '../../ui/Card';

export const MacroSplitChart = ({ split = { carbsPct: 54, proteinPct: 22, fatPct: 24 } }) => {
  return (
    <Card className="flex flex-col justify-between w-full h-full min-h-[260px]">
      <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label mb-4">
        MACRO RATIO DISTRIBUTION
      </span>

      {/* Stacked Horizontal Bar */}
      <div className="my-6">
        <div className="w-full h-6 rounded-lg overflow-hidden flex border border-border">
          <div
            className="h-full bg-black flex items-center justify-center font-mono text-[10px] text-white"
            style={{ width: `${split.carbsPct}%` }}
            title={`Carbs ${split.carbsPct}%`}
          >
            {split.carbsPct}%
          </div>
          <div
            className="h-full bg-[#6b6b6b] flex items-center justify-center font-mono text-[10px] text-white"
            style={{ width: `${split.proteinPct}%` }}
            title={`Protein ${split.proteinPct}%`}
          >
            {split.proteinPct}%
          </div>
          <div
            className="h-full bg-[#9e9e9e] flex items-center justify-center font-mono text-[10px] text-white"
            style={{ width: `${split.fatPct}%` }}
            title={`Fat ${split.fatPct}%`}
          >
            {split.fatPct}%
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-black" />
          <span>Carbs ({split.carbsPct}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-[#6b6b6b]" />
          <span>Protein ({split.proteinPct}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-[#9e9e9e]" />
          <span>Fat ({split.fatPct}%)</span>
        </div>
      </div>
    </Card>
  );
};
