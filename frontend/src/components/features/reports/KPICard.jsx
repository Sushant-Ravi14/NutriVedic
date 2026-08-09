import React from 'react';
import { Card } from '../../ui/Card';

export const KPICard = ({ label, value, unit, delta, isPositive = true }) => {
  return (
    <Card className="flex flex-col justify-between">
      <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label mb-2">
        {label}
      </span>

      <div className="flex items-baseline gap-2 my-1">
        <span className="font-serif text-[36px] font-bold text-black leading-none">
          {value}
        </span>
        <span className="font-mono text-[13px] text-muted">{unit}</span>
      </div>

      <div className="flex items-center gap-1 font-mono text-[11px] mt-2">
        <span className={isPositive ? 'text-positive' : 'text-negative'}>
          {delta > 0 ? `▲ +${delta}` : `▼ ${delta}`}
        </span>
        <span className="text-muted">vs last period</span>
      </div>
    </Card>
  );
};
