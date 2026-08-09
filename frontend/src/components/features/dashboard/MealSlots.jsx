import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useNavigate } from 'react-router-dom';

export const MealSlots = ({ meals = [] }) => {
  const navigate = useNavigate();

  const slots = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

  const getSlotData = (slotName) => {
    const meal = meals.find((m) => m.slot.toLowerCase() === slotName.toLowerCase());
    return meal || { slot: slotName, items: [] };
  };

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          TODAY'S MEALS
        </span>
        <Button variant="primary" size="sm" onClick={() => navigate('/scan')}>
          + Log food
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {slots.map((slotName) => {
          const data = getSlotData(slotName);
          const totalKcal = data.items.reduce((acc, item) => acc + (item.calories || 0), 0);

          return (
            <div key={slotName} className="border border-border rounded-lg p-4 bg-white flex flex-col justify-between min-h-[160px]">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                  <span className="font-sans font-bold text-[11px] uppercase tracking-wider text-black">
                    {slotName}
                  </span>
                  <span className="font-mono text-[11px] text-muted">{totalKcal} kcal</span>
                </div>

                <div className="flex flex-col gap-2">
                  {data.items.length > 0 ? (
                    data.items.map((item) => (
                      <div key={item.id || item.name} className="font-sans text-[11px] text-black border-b border-[#f0f0f0] pb-1.5 flex justify-between items-center">
                        <span className="truncate max-w-[120px]">{item.name}</span>
                        <span className="font-mono text-muted text-[10px]">{item.calories}</span>
                      </div>
                    ))
                  ) : (
                    <span className="font-sans text-[11px] text-muted italic">No items logged</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/scan?slot=${slotName}`)}
                className="font-mono text-[11px] text-muted hover:text-black mt-4 transition-colors text-left"
              >
                + Add item
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
