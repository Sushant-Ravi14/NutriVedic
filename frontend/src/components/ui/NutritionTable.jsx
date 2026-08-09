import React from 'react';

export const NutritionTable = ({ data = {} }) => {
  const rows = [
    { label: 'Calories', value: `${data.calories || 0} kcal` },
    { label: 'Protein', value: `${data.protein || 0} g` },
    { label: 'Carbohydrates', value: `${data.carbs || 0} g` },
    { label: 'Fats', value: `${data.fat || 0} g` },
    { label: 'Dietary Fiber', value: `${data.fiber || 0} g` },
    { label: 'Glycemic Index', value: data.glycemicIndex || 'Low' }
  ];

  return (
    <div className="w-full border border-border rounded-lg overflow-hidden">
      <table className="w-full text-left border-collapse">
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.label} className={idx % 2 === 0 ? 'bg-white' : 'bg-surface'}>
              <td className="py-2.5 px-4 font-sans text-[13px] text-muted">{row.label}</td>
              <td className="py-2.5 px-4 font-mono text-[13px] font-medium text-black text-right">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
