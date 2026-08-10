import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/Card';
import { Chip } from '../../ui/Chip';

export const StepGoal = ({ data, onChange }) => {
  const goals = [
    { id: 'weight_loss', title: 'Weight Loss', desc: 'Caloric deficit diet for fat loss' },
    { id: 'manage_disease', title: 'Manage Disease', desc: 'Ayurvedic therapeutic condition diet' },
    { id: 'muscle_gain', title: 'Muscle Gain', desc: 'Protein-dense surplus diet' },
    { id: 'maintenance', title: 'Maintenance', desc: 'Balanced lifestyle & vitals' }
  ];

  const availableConditions = [
    'Type 2 Diabetes',
    'Hypertension',
    'PCOS / PCOD',
    'Thyroid (Hypo)',
    'High Cholesterol',
    'Fatty Liver',
    'Acid Reflux / GERD',
    'Lactose Intolerance'
  ];

  const toggleCondition = (cond) => {
    const current = data.conditions || [];
    if (current.includes(cond)) {
      onChange({ conditions: current.filter((c) => c !== cond) });
    } else {
      onChange({ conditions: [...current, cond] });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h3 className="font-serif text-[24px] text-black font-bold mb-1">Primary Objective</h3>
        <p className="font-sans text-xs text-muted">What is your primary health goal for NutriVedic?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {goals.map((g) => {
          const isSelected = data.goal === g.id;
          return (
            <Card
              key={g.id}
              onClick={() => onChange({ goal: g.id })}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? '!border-black !bg-surface'
                  : 'hover:!border-black/50'
              }`}
            >
              <h4 className="font-sans font-semibold text-sm text-black mb-1">{g.title}</h4>
              <p className="font-sans text-xs text-muted">{g.desc}</p>
            </Card>
          );
        })}
      </div>

      {/* AnimatePresence for Condition Chips */}
      <AnimatePresence>
        {data.goal === 'manage_disease' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3 pt-2 border-t border-border"
          >
            <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
              SELECT HEALTH CONDITIONS TO THERAPEUTICALLY TARGET
            </span>
            <div className="flex flex-wrap gap-2">
              {availableConditions.map((cond) => {
                const isSelected = (data.conditions || []).includes(cond);
                return (
                  <Chip
                    key={cond}
                    label={cond}
                    active={isSelected}
                    onClick={() => toggleCondition(cond)}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
