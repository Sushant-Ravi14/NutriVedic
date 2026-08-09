import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { PlanBanner } from '../components/features/dietplan/PlanBanner';
import { DaySelector } from '../components/features/dietplan/DaySelector';
import { MealCard } from '../components/features/dietplan/MealCard';
import { DailyTotals } from '../components/features/dietplan/DailyTotals';
import { NotesCard } from '../components/features/dietplan/NotesCard';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { useCurrentPlan, useGeneratePlan, useSwapMeal, useToggleEaten } from '../hooks/useDietPlan';

export const DietPlan = () => {
  const { data: plan, isLoading } = useCurrentPlan();
  const generatePlanMutation = useGeneratePlan();
  const swapMealMutation = useSwapMeal();
  const toggleEatenMutation = useToggleEaten();

  const [activeDay, setActiveDay] = useState('Monday');
  const [swapTargetMealId, setSwapTargetMealId] = useState(null);

  useEffect(() => {
    if (plan?.days?.[0]?.day) {
      setActiveDay(plan.days[0].day);
    }
  }, [plan]);

  const currentDayData = plan?.days?.find((d) => d.day === activeDay) || plan?.days?.[0];

  const calculateDailyTotals = () => {
    const target = plan?.targetKcal || 2000;
    const defaults = {
      kcal: 0,
      targetKcal: target,
      carbs: 0,
      targetCarbs: Math.round((target * 0.5) / 4),
      protein: 0,
      targetProtein: Math.round((target * 0.2) / 4),
      fat: 0,
      targetFat: Math.round((target * 0.3) / 9)
    };

    if (!currentDayData || !currentDayData.meals) {
      return defaults;
    }

    currentDayData.meals.forEach((m) => {
      defaults.kcal += m.calories || 0;
      defaults.carbs += m.carbs || 0;
      defaults.protein += m.protein || 0;
      defaults.fat += m.fat || 0;
    });

    return defaults;
  };

  const dailyTotals = calculateDailyTotals();

  const handleToggleEaten = (mealId, eaten) => {
    toggleEatenMutation.mutate({ day: activeDay, mealId, eaten });
  };

  const handleConfirmSwap = () => {
    if (swapTargetMealId) {
      swapMealMutation.mutate({ day: activeDay, mealId: swapTargetMealId });
      setSwapTargetMealId(null);
    }
  };

  return (
    <PageWrapper>
      <div className="mb-6">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label block mb-1">
          THERAPEUTIC AYURVEDIC NUTRITION
        </span>
        <h1 className="font-serif text-[32px] font-bold text-black">Personalized Diet Plan</h1>
      </div>

      {/* Top Black Banner */}
      <div className="mb-8">
        <PlanBanner
          plan={plan}
          onRegenerate={() => generatePlanMutation.mutate({})}
          isRegenerating={generatePlanMutation.isLoading}
        />
      </div>

      {/* Day Selector Pill Row */}
      <div className="mb-6">
        <DaySelector
          days={plan?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
          activeDay={activeDay}
          onSelectDay={setActiveDay}
        />
      </div>

      {/* 2x2 Meal Card Grid Per Selected Day */}
      {isLoading || generatePlanMutation.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {currentDayData?.meals?.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onToggleEaten={handleToggleEaten}
              onSwap={(id) => setSwapTargetMealId(id)}
            />
          ))}
        </div>
      )}

      {/* Daily Totals Bar */}
      <div className="mb-8">
        <DailyTotals totals={dailyTotals} />
      </div>

      {/* Notes Card */}
      <NotesCard notes={plan?.notes} conditions={plan?.conditions} />

      {/* Swap Meal Confirmation Modal */}
      <Modal
        isOpen={Boolean(swapTargetMealId)}
        onClose={() => setSwapTargetMealId(null)}
        title="Confirm Meal Swap"
      >
        <p className="font-sans text-sm text-black mb-6">
          Do you want to swap this meal for an equivalent Ayurvedic low-glycemic alternative tailored to your profile?
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setSwapTargetMealId(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmSwap}>
            ↻ Yes, Swap Meal
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  );
};
