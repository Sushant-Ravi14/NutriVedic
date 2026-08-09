import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useNavigate } from 'react-router-dom';

export const DietPlanPreview = ({ plan }) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-label block mb-1">
          ACTIVE AYURVEDIC PLAN
        </span>
        <h4 className="font-serif text-[20px] text-black font-semibold">
          {plan?.title || 'Ayurvedic Glycemic Balance Plan'}
        </h4>
        <p className="font-sans text-xs text-muted mt-1 max-w-xl">
          {plan?.description || 'Customized low-GI meal structure for stable blood sugar and optimal digestion.'}
        </p>
      </div>

      <Button variant="secondary" size="sm" onClick={() => navigate('/diet-plan')}>
        View Full Plan →
      </Button>
    </Card>
  );
};
