import React from 'react';
import { Card } from '../../ui/Card';
import { MacroBar } from '../../ui/MacroBar';

export const DailyTotals = ({ totals }) => {
  const current = totals || {
    kcal: 1850,
    targetKcal: 1950,
    carbs: 220,
    targetCarbs: 240,
    protein: 80,
    targetProtein: 95,
    fat: 50,
    targetFat: 55
  };

  return (
    <Card className="w-full">
      <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label block mb-4">
        DAILY PLANNED MACRO TOTALS
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MacroBar label="Total Energy" current={current.kcal} target={current.targetKcal} unit="kcal" />
        <MacroBar label="Carbohydrates" current={current.carbs} target={current.targetCarbs} unit="g" />
        <MacroBar label="Protein" current={current.protein} target={current.targetProtein} unit="g" />
        <MacroBar label="Fat" current={current.fat} target={current.targetFat} unit="g" />
      </div>
    </Card>
  );
};
