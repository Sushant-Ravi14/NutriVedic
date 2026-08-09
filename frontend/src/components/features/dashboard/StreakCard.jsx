import React from 'react';
import { Card } from '../../ui/Card';

export const StreakCard = ({ streak = 12 }) => {
  return (
    <Card className="flex flex-col justify-between">
      <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label mb-2">
        CONSISTENCY
      </span>

      <div className="flex items-baseline gap-2">
        <span className="font-serif text-[48px] font-bold text-black leading-none">
          {streak}
        </span>
        <span className="font-sans text-[14px] text-muted font-normal">
          day logging streak
        </span>
      </div>

      <span className="font-mono text-[11px] text-positive mt-2">
        ▲ Top 5% active users this month
      </span>
    </Card>
  );
};
