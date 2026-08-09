import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

export const NotesCard = ({ notes, conditions = [] }) => {
  return (
    <Card className="w-full">
      <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label block mb-2">
        AYURVEDIC GUIDANCE & NOTES
      </span>

      <p className="font-sans text-[14px] text-muted leading-relaxed mb-4">
        {notes || 'Ensure 3 liters of warm water intake throughout the day. Avoid refined sugar and excessive salt after 8 PM.'}
      </p>

      {conditions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-border">
          <span className="font-mono text-[10px] text-label uppercase">Tailored for:</span>
          {conditions.map((cond) => (
            <Badge key={cond} variant="dark">
              {cond}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
};
