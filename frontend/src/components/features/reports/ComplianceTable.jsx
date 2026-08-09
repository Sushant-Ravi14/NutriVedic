import React from 'react';

export const ComplianceTable = ({ rows = [] }) => {
  return (
    <div className="w-full border border-border rounded-card overflow-hidden bg-white">
      <div className="p-4 border-b border-border bg-surface">
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          DAILY DIET COMPLIANCE LOG
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-[12px]">
          <thead>
            <tr className="border-b border-border text-label text-[10px] uppercase">
              <th className="py-3 px-4 font-normal">Date</th>
              <th className="py-3 px-4 font-normal">Status</th>
              <th className="py-3 px-4 font-normal">Calories</th>
              <th className="py-3 px-4 font-normal text-right">Delta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.date} className={idx % 2 === 0 ? 'bg-white' : 'bg-surface'}>
                <td className="py-3 px-4 font-medium text-black">{row.date}</td>
                <td className="py-3 px-4 flex items-center gap-1.5">
                  <span>{row.icon}</span>
                  <span className="font-sans text-[12px]">{row.status}</span>
                </td>
                <td className="py-3 px-4 text-black">{row.kcal} kcal</td>
                <td className={`py-3 px-4 text-right ${row.delta <= 0 ? 'text-positive' : 'text-negative'}`}>
                  {row.delta > 0 ? `▲ +${row.delta}` : `▼ ${row.delta}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
