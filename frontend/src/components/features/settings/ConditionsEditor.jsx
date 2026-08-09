import React, { useState } from 'react';
import { Chip } from '../../ui/Chip';
import { Button } from '../../ui/Button';

export const ConditionsEditor = ({ initialConditions = [], onSave }) => {
  const [conditions, setConditions] = useState(initialConditions);

  const available = [
    'Type 2 Diabetes',
    'Hypertension',
    'PCOS / PCOD',
    'Thyroid (Hypo)',
    'High Cholesterol',
    'Fatty Liver',
    'Acid Reflux / GERD',
    'Lactose Intolerance'
  ];

  const toggle = (cond) => {
    if (conditions.includes(cond)) {
      setConditions(conditions.filter((c) => c !== cond));
    } else {
      setConditions([...conditions, cond]);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h3 className="font-serif text-[22px] text-black font-bold mb-1">Health Conditions</h3>
        <p className="font-sans text-xs text-muted">Select active medical conditions to enable personalized therapeutic diet rules.</p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {available.map((cond) => (
          <Chip
            key={cond}
            label={cond}
            active={conditions.includes(cond)}
            onClick={() => toggle(cond)}
          />
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="primary" onClick={() => onSave && onSave(conditions)}>
          Save Health Conditions
        </Button>
      </div>
    </div>
  );
};
