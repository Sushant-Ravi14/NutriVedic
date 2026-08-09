import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { KPICard } from '../components/features/reports/KPICard';
import { BarChart } from '../components/features/reports/BarChart';
import { MacroSplitChart } from '../components/features/reports/MacroSplitChart';
import { ComplianceTable } from '../components/features/reports/ComplianceTable';
import { WeightTrendLine } from '../components/features/reports/WeightTrendLine';
import { useReports } from '../hooks/useReports';
import { useAuthStore } from '../store/authStore';

export const Reports = () => {
  const { data: analytics, isLoading } = useReports();
  const profile = useAuthStore((state) => state.profile);

  const summaries = analytics?.data || [];
  
  // 1. Calculate Average Calories
  const totalCaloriesSum = summaries.reduce((acc, curr) => acc + (curr.totalCalories || 0), 0);
  const avgCaloriesValue = summaries.length > 0 ? Math.round(totalCaloriesSum / summaries.length) : 0;
  
  // Calculate average target calories from user profile
  const userTargetCalories = profile?.targetKcal || profile?.targetCalories || 2000;
  const calDelta = avgCaloriesValue > 0 ? avgCaloriesValue - userTargetCalories : 0;

  // 2. Calculate Average Compliance Rate
  const totalComplianceSum = summaries.reduce((acc, curr) => acc + (curr.compliancePercentage || 0), 0);
  const avgComplianceValue = summaries.length > 0 ? Math.round(totalComplianceSum / summaries.length) : 0;

  // 3. Weight Variation (retrieve from user profile or weight logs)
  const currentWeight = profile?.weightKg || profile?.weight || 70;
  
  const kpis = {
    avgCalories: { 
      value: avgCaloriesValue > 0 ? avgCaloriesValue : userTargetCalories,
      unit: 'kcal/day', 
      delta: calDelta, 
      isPositive: calDelta <= 0
    },
    complianceScore: { 
      value: avgComplianceValue > 0 ? avgComplianceValue : 100, 
      unit: '% target', 
      delta: avgComplianceValue > 70 ? 5 : -2, 
      isPositive: avgComplianceValue > 70 
    },
    weightTrend: { 
      value: currentWeight, 
      unit: 'kg current', 
      delta: -0.5, 
      isPositive: true 
    }
  };

  // 4. Map Weekly Bar Data
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyBarData = summaries.map((s) => {
    const dateObj = new Date(s.date);
    const dayName = daysOfWeek[dateObj.getDay()] || s.date;
    return {
      day: dayName,
      calories: s.totalCalories || 0
    };
  });

  const finalWeeklyBarData = weeklyBarData.length > 0 ? weeklyBarData : [
    { day: 'Mon', calories: 0 },
    { day: 'Tue', calories: 0 },
    { day: 'Wed', calories: 0 },
    { day: 'Thu', calories: 0 },
    { day: 'Fri', calories: 0 },
    { day: 'Sat', calories: 0 },
    { day: 'Sun', calories: 0 }
  ];

  // 5. Calculate Macro Split over the week
  const totalProtein = summaries.reduce((acc, curr) => acc + (curr.totalProtein || 0), 0);
  const totalCarbs = summaries.reduce((acc, curr) => acc + (curr.totalCarbs || 0), 0);
  const totalFat = summaries.reduce((acc, curr) => acc + (curr.totalFat || 0), 0);
  
  const totalMacros = totalProtein + totalCarbs + totalFat;
  const macroSplit = totalMacros > 0 ? {
    protein: Math.round((totalProtein / totalMacros) * 100),
    carbs: Math.round((totalCarbs / totalMacros) * 100),
    fat: Math.round((totalFat / totalMacros) * 100)
  } : {
    protein: 20,
    carbs: 55,
    fat: 25
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <PageWrapper>
      {/* Header with Download PDF Button */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label block mb-1">
            ANALYTICAL METRICS & AUDIT
          </span>
          <h1 className="font-serif text-[32px] font-bold text-black">Progress Reports</h1>
        </div>

        <Button variant="secondary" onClick={handleDownloadPDF}>
          ↓ Download PDF
        </Button>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <KPICard
          label="AVERAGE DAILY INTAKE"
          value={kpis.avgCalories.value}
          unit={kpis.avgCalories.unit}
          delta={kpis.avgCalories.delta}
          isPositive={kpis.avgCalories.isPositive}
        />
        <KPICard
          label="COMPLIANCE RATE"
          value={kpis.complianceScore.value}
          unit={kpis.complianceScore.unit}
          delta={kpis.complianceScore.delta}
          isPositive={kpis.complianceScore.isPositive}
        />
        <KPICard
          label="WEIGHT VARIATION"
          value={kpis.weightTrend.value}
          unit={kpis.weightTrend.unit}
          delta={kpis.weightTrend.delta}
          isPositive={kpis.weightTrend.isPositive}
        />
      </div>

      {/* Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <BarChart data={finalWeeklyBarData} />
        </div>
        <div>
          <MacroSplitChart split={macroSplit} />
        </div>
      </div>

      {/* Weight Trend Line */}
      <div className="mb-8">
        <WeightTrendLine points={summaries.map(s => ({ date: s.date, weight: currentWeight }))} />
      </div>

      {/* Compliance Table */}
      <ComplianceTable rows={summaries.map(s => ({
        date: s.date,
        calories: s.totalCalories || 0,
        target: s.targetCalories || userTargetCalories,
        compliance: s.compliancePercentage || 0,
        status: s.status === 'on_track' ? 'On Track' : s.status === 'under' ? 'Under' : 'Over Limit'
      }))} />
    </PageWrapper>
  );
};
