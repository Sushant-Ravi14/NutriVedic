import React from 'react';
import { Card } from '../../ui/Card';
import { DonutRing } from '../../ui/DonutRing';
import { formatNumber } from '../../../utils/formatters';

export const CalorieCard = ({ consumed = 1450, target = 1950 }) => {
  const remaining = Math.max(target - consumed, 0);

  return (
    <Card className="flex flex-col items-center text-center justify-between">
      <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label mb-4 self-start">
        DAILY CALORIES
      </span>

      <div className="my-4 p-2">
        <DonutRing value={consumed} max={target} size={135} strokeWidth={9}>
          <span className="font-serif text-[30px] leading-none text-black font-bold tracking-tight py-1">
            {formatNumber(consumed)}
          </span>
          <span className="font-mono text-[10px] text-muted uppercase mt-2 tracking-widest block">kcal</span>
        </DonutRing>
      </div>

      <div className="mt-4 pt-3 border-t border-border w-full flex items-center justify-between">
        <div className="flex flex-col items-start">
          <span className="font-mono text-[10px] uppercase text-label">Target</span>
          <span className="font-mono text-[13px] font-medium text-black">{formatNumber(target)} kcal</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-mono text-[10px] uppercase text-label">Remaining</span>
          <span className="font-mono text-[13px] font-medium text-black">{formatNumber(remaining)} kcal</span>
        </div>
      </div>
    </Card>
  );
};
