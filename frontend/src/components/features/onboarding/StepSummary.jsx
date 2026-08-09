import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { calculateBMI, getBMICategory, calculateTDEE, calculateTargetCalories } from '../../../utils/calculations';

export const StepSummary = ({ data }) => {
  const bmi = calculateBMI(data.weight, data.height);
  const bmiInfo = getBMICategory(bmi);
  const tdee = calculateTDEE(data);
  const targetCalories = calculateTargetCalories({ tdee, goal: data.goal });

  const summaryRows = [
    { label: 'Body Mass Index', value: `${bmi} kg/m²`, badge: bmiInfo.category },
    { label: 'Biological Metrics', value: `${data.age} yrs • ${data.sex} • ${data.weight} kg • ${data.height} cm` },
    { label: 'Activity Level', value: data.activityLevel?.toUpperCase() },
    { label: 'Target Daily Calories', value: `${targetCalories} kcal / day` },
    { label: 'Primary Goal', value: data.goal?.replace('_', ' ').toUpperCase() },
    { label: 'Selected Conditions', value: data.conditions?.length ? data.conditions.join(', ') : 'None' }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div>
        <h3 className="font-serif text-[24px] text-black font-bold mb-1">Profile Summary</h3>
        <p className="font-sans text-xs text-muted">Review your nutrition profile before finalizing setup.</p>
      </div>

      <Card className="flex flex-col gap-3 bg-white border border-border">
        {summaryRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2 border-b border-[#f0f0f0] last:border-0">
            <span className="font-mono text-xs text-muted uppercase">{row.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs font-semibold text-black">{row.value}</span>
              {row.badge && (
                <span className="bg-black text-white font-mono text-[10px] uppercase px-2 py-0.5 rounded-[10px]">
                  {row.badge}
                </span>
              )}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};
