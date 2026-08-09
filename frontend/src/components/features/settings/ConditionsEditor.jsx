import React, { useState } from 'react';
import { Chip } from '../../ui/Chip';
import { Button } from '../../ui/Button';

export const ConditionsEditor = ({ initialConditions = [], onSave }) => {
  const [conditions, setConditions] = useState(initialConditions);
  const [customInput, setCustomInput] = useState('');

  const defaultAvailable = [
    'Type 2 Diabetes',
    'Hypertension',
    'PCOS / PCOD',
    'Thyroid (Hypo)',
    'High Cholesterol',
    'Fatty Liver',
    'Acid Reflux / GERD',
    'Lactose Intolerance'
  ];

  // Combine default conditions and current active custom ones
  const available = Array.from(new Set([...defaultAvailable, ...conditions]));

  const toggle = (cond) => {
    if (conditions.includes(cond)) {
      setConditions(conditions.filter((c) => c !== cond));
    } else {
      setConditions([...conditions, cond]);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;

    // Title-case the input
    const formatted = trimmed
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    if (!conditions.includes(formatted)) {
      setConditions([...conditions, formatted]);
    }
    setCustomInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustom();
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h3 className="font-serif text-[22px] text-black font-bold mb-1">Health Conditions</h3>
        <p className="font-sans text-xs text-muted">Select active medical conditions or search and add custom diseases to personalize your AI diet plan.</p>
      </div>

      {/* Custom Search/Add Input Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 bg-surface border border-border rounded-lg px-4 py-2.5 font-sans text-sm text-black placeholder:text-muted focus:outline-none focus:border-black transition-colors"
          placeholder="Search or add custom condition (e.g. Arthritis, IBS, Gout)..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddCustom}
          className="whitespace-nowrap px-5"
        >
          + Add
        </Button>
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
