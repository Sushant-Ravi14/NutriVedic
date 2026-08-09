import React from 'react';
import { Card } from '../../ui/Card';

export const WeightTrendLine = ({ points = [] }) => {
  if (!points || points.length === 0) return null;

  const weights = points.map((p) => p.weight);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights) + 0.5;
  const range = maxW - minW || 1;

  const width = 600;
  const height = 160;
  const padding = 20;

  const coords = points.map((p, idx) => {
    const x = padding + (idx / (points.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((p.weight - minW) / range) * (height - 2 * padding);
    return { x, y, weight: p.weight, date: p.date };
  });

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');

  return (
    <Card className="flex flex-col justify-between w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          WEIGHT PROGRESSION TREND
        </span>
        <span className="font-mono text-[11px] text-muted">
          Current: {points[points.length - 1]?.weight} kg
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px] h-[160px]">
          {/* Subtle horizontal grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e0e0e0" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#e0e0e0" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e0e0e0" strokeDasharray="3 3" />

          {/* Polyline */}
          <polyline fill="none" stroke="#0a0a0a" strokeWidth="2" points={polylinePoints} />

          {/* Dots */}
          {coords.map((c, idx) => (
            <g key={idx}>
              <circle cx={c.x} cy={c.y} r="4" fill="#0a0a0a" />
              <text x={c.x} y={c.y - 8} textAnchor="middle" className="font-mono text-[10px] fill-black">
                {c.weight}kg
              </text>
              <text x={c.x} y={height - 2} textAnchor="middle" className="font-mono text-[10px] fill-muted">
                {c.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </Card>
  );
};
