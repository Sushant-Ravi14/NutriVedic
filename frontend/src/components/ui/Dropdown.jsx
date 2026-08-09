import React from 'react';

export const Dropdown = ({
  label,
  id,
  options = [],
  value,
  onChange,
  className = '',
  required = false
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="font-mono text-[11px] uppercase tracking-[1.5px] text-label">
          {label} {required && <span className="text-negative">*</span>}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={`h-[42px] px-3.5 bg-white border border-border rounded-lg text-black font-sans text-[14px] transition-colors focus:outline-none focus:border-black cursor-pointer ${className}`}
      >
        {options.map((opt) => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
