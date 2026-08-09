import React from 'react';
import { Chip } from '../../ui/Chip';

export const DaySelector = ({ days = [], activeDay, onSelectDay }) => {
  return (
    <div className="w-full overflow-x-auto pb-2 flex items-center gap-2 scrollbar-none">
      {days.map((d) => {
        const dayName = typeof d === 'string' ? d : d.day;
        const isActive = activeDay === dayName;
        return (
          <Chip
            key={dayName}
            label={dayName}
            active={isActive}
            onClick={() => onSelectDay && onSelectDay(dayName)}
            className="shrink-0"
          />
        );
      })}
    </div>
  );
};
