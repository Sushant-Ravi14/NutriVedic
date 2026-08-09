import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { PWAInstallBanner } from '../components/layout/PWAInstallBanner';
import { CalorieCard } from '../components/features/dashboard/CalorieCard';
import { MacrosCard } from '../components/features/dashboard/MacrosCard';
import { WaterTracker } from '../components/features/dashboard/WaterTracker';
import { StreakCard } from '../components/features/dashboard/StreakCard';
import { MealSlots } from '../components/features/dashboard/MealSlots';
import { DietPlanPreview } from '../components/features/dashboard/DietPlanPreview';
import { useAuthStore } from '../store/authStore';
import { useLogsByDate, useUpdateWater } from '../hooks/useFoodLog';
import { useCurrentPlan } from '../hooks/useDietPlan';
import { formatDate, formatISODate } from '../utils/formatters';

export const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const today = formatISODate();

  const { data: foodLog } = useLogsByDate(today);
  const { data: currentPlan } = useCurrentPlan();
  const updateWaterMutation = useUpdateWater();

  const summary = {
    consumedKcal: foodLog?.summary?.totalCalories || 0,
    targetKcal: foodLog?.summary?.targetCalories || profile?.targetKcal || profile?.targetCalories || 2000,
    protein: foodLog?.summary?.totalProtein || 0,
    targetProtein: profile?.proteinTargetG || 95,
    carbs: foodLog?.summary?.totalCarbs || 0,
    targetCarbs: profile?.carbTargetG || 240,
    fat: foodLog?.summary?.totalFat || 0,
    targetFat: profile?.fatTargetG || 55,
    waterGlasses: foodLog?.summary?.waterGlasses || 0,
    streak: foodLog?.summary?.streak || 0
  };

  const handleWaterToggle = (newGlasses) => {
    updateWaterMutation.mutate(newGlasses);
  };

  return (
    <PageWrapper>
      <PWAInstallBanner />

      {/* Greeting Header */}
      <div className="mb-8">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label block mb-1">
          {formatDate(new Date())}
        </span>
        <h1 className="font-serif text-[32px] font-bold text-black">
          Good morning, {user?.firstName || 'User'}.
        </h1>
      </div>

      {/* 3-Column Grid on Desktop / 1-Column Stacked on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <CalorieCard consumed={summary.consumedKcal} target={summary.targetKcal} />

        <MacrosCard
          protein={{ current: summary.protein, target: summary.targetProtein }}
          carbs={{ current: summary.carbs, target: summary.targetCarbs }}
          fat={{ current: summary.fat, target: summary.targetFat }}
          fiber={{ current: 22, target: 30 }}
        />

        <div className="flex flex-col gap-6">
          <WaterTracker glasses={summary.waterGlasses} onToggleGlass={handleWaterToggle} />
          <StreakCard streak={summary.streak} />
        </div>
      </div>

      {/* Diet Plan Banner Preview */}
      <div className="mb-8">
        <DietPlanPreview plan={currentPlan} />
      </div>

      {/* Full-width Meal Slots Grid */}
      <MealSlots meals={foodLog?.meals || []} />
    </PageWrapper>
  );
};
