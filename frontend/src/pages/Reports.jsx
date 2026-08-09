import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';
import { KPICard } from '../components/features/reports/KPICard';
import { BarChart } from '../components/features/reports/BarChart';
import { MacroSplitChart } from '../components/features/reports/MacroSplitChart';
import { ComplianceTable } from '../components/features/reports/ComplianceTable';
import { WeightTrendLine } from '../components/features/reports/WeightTrendLine';
import { useReports } from '../hooks/useReports';

export const Reports = () => {
  const { data: analytics, isLoading } = useReports();

  const kpis = analytics?.kpis || {
    avgCalories: { value: 1860, unit: 'kcal/day', delta: -40, isPositive: true },
    complianceScore: { value: 92, unit: '% target', delta: 4, isPositive: true },
    weightTrend: { value: 71.4, unit: 'kg current', delta: -1.2, isPositive: true }
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
          <BarChart data={analytics?.weeklyBarData || []} />
        </div>
        <div>
          <MacroSplitChart split={analytics?.macroSplit} />
        </div>
      </div>

      {/* Weight Trend Line */}
      <div className="mb-8">
        <WeightTrendLine points={analytics?.weightPoints || []} />
      </div>

      {/* Compliance Table */}
      <ComplianceTable rows={analytics?.complianceList || []} />
    </PageWrapper>
  );
};
