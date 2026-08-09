import React from 'react';
import { Chip } from '../../ui/Chip';

const GOALS = [
  { id: 'weight_loss',    title: 'Weight Loss',    desc: 'Caloric deficit diet for fat loss',              emoji: '⚖️' },
  { id: 'manage_disease', title: 'Manage Disease',  desc: 'Ayurvedic therapeutic condition diet',           emoji: '🩺' },
  { id: 'muscle_gain',    title: 'Muscle Gain',     desc: 'Protein-dense surplus diet',                     emoji: '💪' },
  { id: 'maintenance',    title: 'Maintenance',     desc: 'Balanced lifestyle & vitals',                    emoji: '🌿' }
];

const CONDITIONS = [
  'Type 2 Diabetes',
  'Hypertension',
  'PCOS / PCOD',
  'Thyroid (Hypo)',
  'High Cholesterol',
  'Fatty Liver',
  'Acid Reflux / GERD',
  'Lactose Intolerance'
];

export const StepGoal = ({ data, onChange }) => {
  const selectedGoal = data.goal || '';
  const selectedConditions = data.conditions || [];

  const handleGoalSelect = (goalId) => {
    onChange({ goal: goalId });
  };

  const toggleCondition = (cond) => {
    if (selectedConditions.includes(cond)) {
      onChange({ conditions: selectedConditions.filter((c) => c !== cond) });
    } else {
      onChange({ conditions: [...selectedConditions, cond] });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h3 className="font-serif text-[24px] text-black font-bold mb-1">Primary Objective</h3>
        <p className="font-sans text-xs text-muted">What is your primary health goal for NutriVedic?</p>
      </div>

      {/* Goal Selection Grid */}
      <div className="grid grid-cols-2 gap-3">
        {GOALS.map((g) => {
          const isSelected = selectedGoal === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => handleGoalSelect(g.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-150 focus:outline-none ${
                isSelected
                  ? 'border-black bg-black text-white shadow-md scale-[1.02]'
                  : 'border-border bg-white text-black hover:border-black/50 hover:bg-surface'
              }`}
            >
              <div className="text-lg mb-1">{g.emoji}</div>
              <h4 className={`font-sans font-semibold text-sm mb-0.5 ${isSelected ? 'text-white' : 'text-black'}`}>
                {g.title}
              </h4>
              <p className={`font-sans text-xs leading-relaxed ${isSelected ? 'text-white/75' : 'text-muted'}`}>
                {g.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Health Conditions */}
      <div className="flex flex-col gap-3 pt-4 border-t border-border">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          SELECT HEALTH CONDITIONS TO THERAPEUTICALLY TARGET
        </span>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((cond) => (
            <Chip
              key={cond}
              label={cond}
              active={selectedConditions.includes(cond)}
              onClick={() => toggleCondition(cond)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
