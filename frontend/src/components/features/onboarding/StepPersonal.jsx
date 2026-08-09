import React from 'react';
import { Input } from '../../ui/Input';
import { Chip } from '../../ui/Chip';

export const StepPersonal = ({ data, onChange }) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h3 className="font-serif text-[24px] text-black font-bold mb-1">Personal Metrics</h3>
        <p className="font-sans text-xs text-muted">Enter your basic physical measurements to calculate your baseline energy requirements.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="AGE (YEARS)"
          type="number"
          placeholder="e.g. 28"
          value={data.age || ''}
          onChange={(e) => onChange({ age: e.target.value })}
          required
        />
        <Input
          label="WEIGHT (KG)"
          type="number"
          placeholder="e.g. 72"
          value={data.weight || ''}
          onChange={(e) => onChange({ weight: e.target.value })}
          required
        />
        <Input
          label="HEIGHT (CM)"
          type="number"
          placeholder="e.g. 175"
          value={data.height || ''}
          onChange={(e) => onChange({ height: e.target.value })}
          required
        />
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">BIOLOGICAL SEX</span>
          <div className="flex items-center gap-2 h-[42px]">
            <Chip
              label="Male"
              active={data.sex === 'male'}
              onClick={() => onChange({ sex: 'male' })}
            />
            <Chip
              label="Female"
              active={data.sex === 'female'}
              onClick={() => onChange({ sex: 'female' })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
