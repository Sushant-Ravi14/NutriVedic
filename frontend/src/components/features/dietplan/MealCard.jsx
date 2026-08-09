import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

export const MealCard = ({ meal, onToggleEaten, onSwap }) => {
  if (!meal) return null;

  return (
    <Card className="flex flex-col justify-between h-full bg-white border border-border">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
          <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label font-medium">
            {meal.slot}
          </span>
          <span className="font-mono text-[12px] font-medium text-black">
            {meal.kcal} kcal
          </span>
        </div>

        <h4 className="font-sans font-semibold text-[15px] text-black mb-1.5 leading-snug">
          {meal.name}
        </h4>

        <p className="font-sans text-[12px] text-muted mb-4 line-clamp-2">
          {meal.description}
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted mb-4 flex-wrap">
          <span className="bg-surface px-2 py-0.5 rounded border border-border">C: {meal.carbs}g</span>
          <span className="bg-surface px-2 py-0.5 rounded border border-border">P: {meal.protein}g</span>
          <span className="bg-surface px-2 py-0.5 rounded border border-border">F: {meal.fat}g</span>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Button
            variant={meal.eaten ? 'primary' : 'secondary'}
            size="sm"
            className="flex-1"
            onClick={() => onToggleEaten && onToggleEaten(meal.id, !meal.eaten)}
          >
            {meal.eaten ? '✓ Eaten' : 'Mark eaten'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSwap && onSwap(meal.id)}
            title="Swap meal"
          >
            ↻ Swap
          </Button>
        </div>
      </div>
    </Card>
  );
};
