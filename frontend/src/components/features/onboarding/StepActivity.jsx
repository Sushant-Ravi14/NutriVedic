import React from 'react';
import { Card } from '../../ui/Card';
import { calculateTDEE } from '../../../utils/calculations';

export const StepActivity = ({ data, onChange }) => {
  const activities = [
    { id: 'sedentary', title: 'Sedentary', desc: 'Little to no exercise, desk-based work' },
    { id: 'moderate', title: 'Moderate Activity', desc: 'Exercise 3–5 days per week, moderate movement' },
    { id: 'active', title: 'Active Lifestyle', desc: 'Daily intense workouts or active manual job' }
  ];

  const currentTDEE = calculateTDEE({
    weight: data.weight || 70,
    height: data.height || 170,
    age: data.age || 25,
    sex: data.sex || 'male',
    activityLevel: data.activityLevel || 'moderate'
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h3 className="font-serif text-[24px] text-black font-bold mb-1">Activity Level</h3>
        <p className="font-sans text-xs text-muted">Select your daily physical activity pattern.</p>
      </div>

      <div className="flex flex-col gap-3">
        {activities.map((act) => {
          const isSelected = data.activityLevel === act.id;
          return (
            <Card
              key={act.id}
              onClick={() => onChange({ activityLevel: act.id })}
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'border-black bg-surface'
                  : 'border-border bg-white hover:border-black/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-sans font-semibold text-sm text-black">{act.title}</h4>
                  <p className="font-sans text-xs text-muted mt-0.5">{act.desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-black bg-black' : 'border-border'
                }`}>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="p-3 bg-white border border-border rounded-lg flex items-center justify-between">
        <span className="font-mono text-xs text-muted uppercase">ESTIMATED DAILY TDEE</span>
        <span className="font-mono text-sm font-semibold text-black">{currentTDEE} kcal / day</span>
      </div>
    </div>
  );
};
