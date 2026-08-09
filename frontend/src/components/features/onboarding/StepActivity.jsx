import React from 'react';
import { calculateTDEE } from '../../../utils/calculations';

const ACTIVITIES = [
  { id: 'sedentary', title: 'Sedentary',         desc: 'Little to no exercise, desk-based work',              emoji: '🪑' },
  { id: 'moderate',  title: 'Moderate Activity',  desc: 'Exercise 3–5 days per week, moderate movement',        emoji: '🚶' },
  { id: 'active',    title: 'Active Lifestyle',   desc: 'Daily intense workouts or active manual job',          emoji: '🏃' }
];

export const StepActivity = ({ data, onChange }) => {
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
        {ACTIVITIES.map((act) => {
          const isSelected = data.activityLevel === act.id;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onChange({ activityLevel: act.id })}
              className={`text-left w-full px-4 py-4 rounded-xl border-2 transition-all duration-150 focus:outline-none flex items-center justify-between gap-4 ${
                isSelected
                  ? 'border-black bg-black text-white shadow-md'
                  : 'border-border bg-white hover:border-black/50 hover:bg-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{act.emoji}</span>
                <div>
                  <h4 className={`font-sans font-semibold text-sm ${isSelected ? 'text-white' : 'text-black'}`}>
                    {act.title}
                  </h4>
                  <p className={`font-sans text-xs mt-0.5 ${isSelected ? 'text-white/75' : 'text-muted'}`}>
                    {act.desc}
                  </p>
                </div>
              </div>
              {/* Radio indicator */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                isSelected ? 'border-white bg-white' : 'border-border bg-white'
              }`}>
                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-black" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Live TDEE Preview */}
      <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between">
        <span className="font-mono text-xs text-muted uppercase">Estimated Daily TDEE</span>
        <span className="font-mono text-sm font-semibold text-black">{currentTDEE} kcal / day</span>
      </div>
    </div>
  );
};
