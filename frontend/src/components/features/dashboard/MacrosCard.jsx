import React from 'react';
import { Card } from '../../ui/Card';
import { MacroBar } from '../../ui/MacroBar';

export const MacrosCard = ({
  protein = { current: 0, target: 0 },
  carbs = { current: 0, target: 0 },
  fat = { current: 0, target: 0 },
  fiber = { current: 0, target: 0 }
}) => {
  return (
    <Card className="flex flex-col justify-between">
      <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label mb-4">
        MACRONUTRIENT SPLIT
      </span>

      <div className="flex flex-col gap-4">
        <MacroBar label="Protein" current={protein.current} target={protein.target} unit="g" />
        <MacroBar label="Carbohydrates" current={carbs.current} target={carbs.target} unit="g" />
        <MacroBar label="Fats" current={fat.current} target={fat.target} unit="g" />
        <MacroBar label="Fiber" current={fiber.current} target={fiber.target} unit="g" />
      </div>
    </Card>
  );
};
