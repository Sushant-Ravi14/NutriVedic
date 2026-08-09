import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useLogsByDate, useDeleteMeal } from '../hooks/useFoodLog';
import { formatDate, formatISODate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const FoodLog = () => {
  const [selectedDate, setSelectedDate] = useState(formatISODate());
  const { data: foodLog, isLoading } = useLogsByDate(selectedDate);
  const deleteMealMutation = useDeleteMeal();
  const navigate = useNavigate();

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatISODate(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatISODate(d));
  };

  const summary = foodLog?.summary || { consumedKcal: 0, targetKcal: 1950 };
  const meals = foodLog?.meals || [];

  return (
    <PageWrapper>
      {/* Date Header Navigator */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label block mb-1">
            NUTRITION DIARY LOG
          </span>
          <h1 className="font-serif text-[32px] font-bold text-black">
            {formatDate(selectedDate)}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrevDay}>
            ← Prev
          </Button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-[36px] px-3 bg-white border border-border rounded-lg font-mono text-xs text-black focus:outline-none"
          />
          <Button variant="secondary" size="sm" onClick={handleNextDay}>
            Next →
          </Button>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <Card className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface">
        <div>
          <span className="font-mono text-[10px] uppercase text-label block">DAY SUMMARY</span>
          <span className="font-serif text-[28px] font-bold text-black">
            {summary.consumedKcal} / {summary.targetKcal} kcal
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs text-muted">
          <span>Protein: {summary.protein || 0}g</span>
          <span>Carbs: {summary.carbs || 0}g</span>
          <span>Fat: {summary.fat || 0}g</span>
        </div>
        <Button variant="primary" size="sm" onClick={() => navigate('/scan')}>
          + Log Food
        </Button>
      </Card>

      {/* Meals List */}
      {meals.length === 0 ? (
        <EmptyState
          message="No meals logged for this date yet."
          actionLabel="+ Log First Meal"
          onAction={() => navigate('/scan')}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {meals.map((meal) => (
            <Card key={meal.id || meal.slot} className="w-full">
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <span className="font-sans font-bold text-[12px] uppercase tracking-wider text-black">
                  {meal.slot}
                </span>
                <span className="font-mono text-xs font-semibold text-black">
                  {meal.items.reduce((acc, i) => acc + (i.calories || 0), 0)} kcal
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {meal.items.map((item) => (
                  <div
                    key={item.id || item.name}
                    className="flex items-center justify-between py-2 border-b border-[#f0f0f0] last:border-0"
                  >
                    <div>
                      <span className="font-sans font-medium text-sm text-black block">{item.name}</span>
                      <span className="font-mono text-[11px] text-muted">
                        {item.grams}g • P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-semibold text-black">{item.calories} kcal</span>
                      <button
                        type="button"
                        onClick={() => deleteMealMutation.mutate(item.id)}
                        className="text-muted hover:text-negative font-sans text-xs p-1"
                        aria-label="Delete item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};
