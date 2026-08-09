import React from 'react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

export const PlanBanner = ({ plan, onRegenerate, isRegenerating }) => {
  return (
    <div className="w-full bg-black text-white rounded-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="max-w-2xl">
        <span className="font-mono text-[10px] uppercase tracking-widest text-label block mb-1">
          CURRENT NUTRITION PLAN
        </span>
        <h2 className="font-serif text-[28px] font-bold leading-tight mb-2 text-white">
          {plan?.title || 'Ayurvedic Glycemic Balance Plan'}
        </h2>
        <p className="font-sans text-xs md:text-sm text-[#e0e0e0] leading-relaxed mb-4">
          {plan?.description}
        </p>

        {plan?.conditions && (
          <div className="flex items-center gap-2 flex-wrap">
            {plan.conditions.map((cond) => (
              <Badge key={cond} variant="surface">
                {cond}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="secondary"
        onClick={onRegenerate}
        disabled={isRegenerating}
        className="shrink-0 bg-white text-black border-white hover:bg-surface"
      >
        {isRegenerating ? 'Generating...' : '↻ Regenerate Plan'}
      </Button>
    </div>
  );
};
